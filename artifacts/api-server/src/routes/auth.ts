import { Router, type IRouter, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  signToken,
  hashPassword,
  comparePassword,
  COOKIE_NAME_EXPORT,
  cookieOptions,
} from "../lib/auth.js";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";
import { sendMail, buildVerificationEmail, getAppBaseUrl } from "../lib/mailer.js";

const router: IRouter = Router();

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (!/\d/.test(password)) {
    res.status(400).json({ error: "Password must contain at least one number" });
    return;
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    res.status(400).json({ error: "Password must contain at least one special character (e.g. ! @ # $ %)" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));

  if (existing) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const id = uuidv4();
  const verificationToken = randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  const [user] = await db
    .insert(usersTable)
    .values({
      id,
      email: normalizedEmail,
      passwordHash,
      plan: "free",
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    })
    .returning();

  // Build verification link pointing at the frontend
  const baseUrl = getAppBaseUrl(req);
  const verifyLink = `${baseUrl}/verify-email?token=${verificationToken}`;

  // Send the email. If sending fails, we delete the user so they can retry.
  try {
    const { subject, html, text } = buildVerificationEmail(user.email, verifyLink);
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    // Roll back the user creation so registration can be retried
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
    console.error("[register] Failed to send verification email:", err);
    res.status(502).json({
      error: "Could not send verification email. Please try again in a moment.",
    });
    return;
  }

  // Do NOT set the auth cookie — user must verify first.
  res.status(201).json({
    pending: true,
    email: user.email,
    message: "Please check your email and verify your account before logging in.",
  });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // STRICT email-verification gate: block unless emailVerified is explicitly true.
  // This catches both `false` and `null`, and any future nullable migration.
  if (user.emailVerified !== true) {
    res.status(403).json({
      error:
        "Your email is not verified. Please check your inbox and verify your email first before logging in.",
      needsVerification: true,
      email: user.email,
    });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie(COOKIE_NAME_EXPORT, token, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.json({ id: user.id, email: user.email, plan: user.plan });
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req: Request, res: Response) => {
  const { token } = req.body ?? {};

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Verification token is required" });
    return;
  }

  // Look the user up by the token they presented. We deliberately keep the token
  // in the database after a successful verification (until its 24h expiry) so this
  // endpoint is fully idempotent — React StrictMode, retries, and double-clicks
  // can all hit it safely without showing a spurious "invalid link" error.
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.verificationToken, token));

  if (!user) {
    res.status(400).json({ error: "Invalid or expired verification link" });
    return;
  }

  // Token must still be within its TTL window, regardless of verified state.
  if (
    !user.verificationTokenExpiresAt ||
    user.verificationTokenExpiresAt.getTime() < Date.now()
  ) {
    res
      .status(400)
      .json({ error: "Verification link has expired. Please sign up again." });
    return;
  }

  // First-time verification: flip the flag. We DO NOT null out the token —
  // the natural 24h expiry is the only invalidation mechanism.
  let verifiedUser = user;
  if (user.emailVerified !== true) {
    const [updated] = await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.id, user.id))
      .returning();
    verifiedUser = updated;
  }

  // Log the user in by setting the auth cookie
  const jwt = signToken({ userId: verifiedUser.id, email: verifiedUser.email });
  res.cookie(COOKIE_NAME_EXPORT, jwt, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.json({
    id: verifiedUser.id,
    email: verifiedUser.email,
    plan: verifiedUser.plan,
    alreadyVerified: user.emailVerified === true,
  });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME_EXPORT, cookieOptions(0));
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, email: user.email, plan: user.plan });
});

export default router;
