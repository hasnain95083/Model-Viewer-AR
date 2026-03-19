import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { modelsTable, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { ListModelsResponse, GetModelResponse } from "@workspace/api-zod";
import { requireAuth, optionalAuth, type AuthRequest } from "../middlewares/requireAuth.js";
import { PLAN_LIMITS } from "./subscription.js";
import type { Plan } from "@workspace/db";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".glb" || ext === ".gltf") {
      cb(null, true);
    } else {
      cb(new Error("Only .glb and .gltf files are allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

const router: IRouter = Router();

// GET /api/models — list models for current user (or all if not authed for viewer compatibility)
router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  let models;
  if (req.user) {
    models = await db
      .select()
      .from(modelsTable)
      .where(eq(modelsTable.userId, req.user.userId))
      .orderBy(modelsTable.createdAt);
  } else {
    models = await db.select().from(modelsTable).orderBy(modelsTable.createdAt);
  }

  const result = models.map((m) => ({
    id: m.id,
    name: m.name,
    filename: m.filename,
    url: `/api/models/${m.id}/file`,
    createdAt: m.createdAt.toISOString(),
  }));
  res.json(ListModelsResponse.parse(result));
});

// GET /api/models/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [model] = await db.select().from(modelsTable).where(eq(modelsTable.id, id));
  if (!model) {
    res.status(404).json({ error: "Model not found" });
    return;
  }
  res.json(GetModelResponse.parse({
    id: model.id,
    name: model.name,
    filename: model.filename,
    url: `/api/models/${model.id}/file`,
    createdAt: model.createdAt.toISOString(),
  }));
});

// GET /api/models/:id/file
router.get("/:id/file", async (req, res) => {
  const { id } = req.params;
  const [model] = await db.select().from(modelsTable).where(eq(modelsTable.id, id));
  if (!model) {
    res.status(404).json({ error: "Model not found" });
    return;
  }
  const filePath = path.join(UPLOAD_DIR, model.filepath);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found on disk" });
    return;
  }
  const ext = path.extname(model.filename).toLowerCase();
  const contentType = ext === ".gltf" ? "model/gltf+json" : "model/gltf-binary";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(filePath);
});

// POST /api/models/upload — requires auth + plan limit check
router.post("/upload", requireAuth, upload.single("model"), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const userId = req.user!.userId;

  // Get user's plan
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const plan = user.plan as Plan;
  const limit = PLAN_LIMITS[plan];

  if (limit !== -1) {
    const [{ value: modelCount }] = await db
      .select({ value: count() })
      .from(modelsTable)
      .where(eq(modelsTable.userId, userId));

    if (Number(modelCount) >= limit) {
      // Remove the uploaded file since we're rejecting
      fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
      res.status(403).json({
        error: `Upload limit reached for ${plan} plan (${limit} model${limit === 1 ? "" : "s"}). Please upgrade to upload more.`,
        limitReached: true,
        plan,
        limit,
      });
      return;
    }
  }

  const id = uuidv4();
  const originalName = req.file.originalname;

  const [model] = await db
    .insert(modelsTable)
    .values({
      id,
      name: path.basename(originalName, path.extname(originalName)),
      filename: originalName,
      filepath: req.file.filename,
      userId,
    })
    .returning();

  res.json({
    id: model.id,
    name: model.name,
    filename: model.filename,
    url: `/api/models/${model.id}/file`,
    createdAt: model.createdAt.toISOString(),
  });
});

export default router;
