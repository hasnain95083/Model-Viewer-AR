import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { modelsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListModelsResponse, GetModelResponse } from "@workspace/api-zod";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
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

router.get("/", async (_req, res) => {
  const models = await db.select().from(modelsTable).orderBy(modelsTable.createdAt);
  const result = models.map((m) => ({
    id: m.id,
    name: m.name,
    filename: m.filename,
    url: `/api/models/${m.id}/file`,
    createdAt: m.createdAt.toISOString(),
  }));
  const parsed = ListModelsResponse.parse(result);
  res.json(parsed);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [model] = await db.select().from(modelsTable).where(eq(modelsTable.id, id));
  if (!model) {
    res.status(404).json({ error: "Model not found" });
    return;
  }
  const result = GetModelResponse.parse({
    id: model.id,
    name: model.name,
    filename: model.filename,
    url: `/api/models/${model.id}/file`,
    createdAt: model.createdAt.toISOString(),
  });
  res.json(result);
});

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

router.post("/upload", upload.single("model"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const id = uuidv4();
  const originalName = req.file.originalname;
  const storedFilename = req.file.filename;

  const [model] = await db
    .insert(modelsTable)
    .values({
      id,
      name: path.basename(originalName, path.extname(originalName)),
      filename: originalName,
      filepath: storedFilename,
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
