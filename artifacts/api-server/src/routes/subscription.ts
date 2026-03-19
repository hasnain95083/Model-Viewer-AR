import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, modelsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";
import type { Plan } from "@workspace/db";
import type { Response } from "express";

const router: IRouter = Router();

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 1,
  pro: 10,
  business: -1, // unlimited
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

async function getSubscriptionInfo(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return null;

  const [{ value: modelCount }] = await db
    .select({ value: count() })
    .from(modelsTable)
    .where(eq(modelsTable.userId, userId));

  const plan = user.plan as Plan;
  const limit = PLAN_LIMITS[plan];
  const canUpload = limit === -1 || modelCount < limit;

  return { plan, modelCount: Number(modelCount), limit, canUpload };
}

// GET /api/subscription
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const info = await getSubscriptionInfo(req.user!.userId);
  if (!info) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(info);
});

// POST /api/subscription/upgrade
router.post("/upgrade", requireAuth, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body ?? {};
  const validPlans: Plan[] = ["free", "pro", "business"];

  if (!plan || !validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Must be one of: free, pro, business" });
    return;
  }

  await db
    .update(usersTable)
    .set({ plan })
    .where(eq(usersTable.id, req.user!.userId));

  const info = await getSubscriptionInfo(req.user!.userId);
  res.json(info);
});

export { getSubscriptionInfo };
export default router;
