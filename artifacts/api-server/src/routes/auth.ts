import { Router, type IRouter, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
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

const router: IRouter = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
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

  const [user] = await db
    .insert(usersTable)
    .values({ id, email: normalizedEmail, passwordHash })
    .returning();

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie(COOKIE_NAME_EXPORT, token, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.status(201).json({ id: user.id, email: user.email });
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

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie(COOKIE_NAME_EXPORT, token, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.json({ id: user.id, email: user.email });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME_EXPORT, cookieOptions(0));
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ id: req.user!.userId, email: req.user!.email });
});

export default router;
