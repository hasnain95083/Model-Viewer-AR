# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── scanar/             # ScanAR React frontend (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, scripts)
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## ScanAR Application

ScanAR is a SaaS-style AR platform where users upload 3D models (.glb/.gltf) and instantly view them in Augmented Reality. Features:
- **Landing Page**: Futuristic hero section with animated 3D scan concept, features and how-it-works sections
- **Upload Page**: Drag-and-drop 3D model upload, QR code generation, download QR button
- **Viewer Page**: model-viewer AR integration with WebXR, camera controls, auto-rotate, AR mode

### Frontend (artifacts/scanar)
- React + Vite + TypeScript
- Tailwind CSS with dark futuristic theme (neon blue #00d4ff / neon purple #bf00ff)
- Framer Motion animations
- qrcode.react for QR generation
- react-dropzone for file upload
- model-viewer (via CDN) for AR/3D rendering
- Wouter for client-side routing (pages: /, /upload, /viewer/:id)

### Backend (artifacts/api-server)
- Express 5 API server
- Multer for multipart file uploads (100MB limit)
- Files stored in `artifacts/api-server/uploads/`
- Routes:
  - `GET /api/models` — list all uploaded models
  - `GET /api/models/:id` — get model by ID
  - `GET /api/models/:id/file` — serve the raw 3D file
  - `POST /api/models/upload` — upload a .glb or .gltf file

### Database (lib/db)
- PostgreSQL + Drizzle ORM
- Table: `models` (id, name, filename, filepath, createdAt)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: health, models (upload/list/get/file).

### `artifacts/scanar` (`@workspace/scanar`)

React + Vite ScanAR frontend. Dark futuristic AR platform UI.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Schema: models table.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval codegen config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
