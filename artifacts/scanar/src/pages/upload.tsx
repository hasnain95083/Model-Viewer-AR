import { Layout } from "@/components/Layout";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadModel } from "@/hooks/use-models";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileBox, X, CheckCircle2, Download,
  Eye, Loader2, Cuboid, AlertCircle, Smartphone
} from "lucide-react";
import { type Model } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "shadow-intensity"?: string;
        },
        HTMLElement
      >;
    }
  }
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [uploadedModel, setUploadedModel] = useState<Model | null>(null);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const uploadMutation = useUploadModel();
  const { toast } = useToast();
  const prevBlobRef = useRef<string | null>(null);

  // Detect WebGL support once on mount
  useEffect(() => {
    setWebglSupported(checkWebGL());
  }, []);

  // Load model-viewer lazily only when a file has been picked and WebGL is available
  useEffect(() => {
    if (!file || !webglSupported) return;
    if (customElements.get("model-viewer")) {
      setModelViewerReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.type = "module";
    script.onload = () => setModelViewerReady(true);
    script.onerror = () => console.warn("model-viewer script failed to load");
    document.head.appendChild(script);
  }, [file, webglSupported]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File }[]) => {
    setFileError(null);

    // If nothing accepted, check rejected for extension anyway
    const candidates = acceptedFiles.length > 0 ? acceptedFiles : rejectedFiles.map((r) => r.file);
    if (candidates.length === 0) return;

    const f = candidates[0];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "glb" && ext !== "gltf") {
      setFileError("Only .glb and .gltf files are supported. Please select a valid 3D model file.");
      return;
    }

    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const blobUrl = URL.createObjectURL(f);
    prevBlobRef.current = blobUrl;

    setFile(f);
    setLocalBlobUrl(blobUrl);
    setUploadedModel(null);
    setModelViewerReady(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    // Accept any file type — we validate by extension manually
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "application/octet-stream": [".glb"],
      "application/json": [".gltf"],
    },
    maxFiles: 1,
    multiple: false,
    validator: (f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext !== "glb" && ext !== "gltf") {
        return { code: "wrong-extension", message: "Only .glb and .gltf files are allowed" };
      }
      return null;
    },
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setUploadedModel(data);
        toast({ title: "Upload Successful!", description: "Your 3D model has been saved." });
      },
      onError: (err) => {
        toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `scanar-qr-${uploadedModel?.id ?? "model"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prevBlobRef.current) { URL.revokeObjectURL(prevBlobRef.current); prevBlobRef.current = null; }
    setFile(null);
    setLocalBlobUrl(null);
    setUploadedModel(null);
    setFileError(null);
    setModelViewerReady(false);
  };

  const viewerUrl = uploadedModel ? `${window.location.origin}/viewer/${uploadedModel.id}` : "";
  // Prefer server URL after upload so the blob doesn't expire
  const previewSrc = uploadedModel
    ? `/api/models/${uploadedModel.id}/file`
    : localBlobUrl ?? undefined;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Upload <span className="text-primary">3D Model</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drop your .glb or .gltf file below to preview it and generate a shareable AR link.
          </p>
        </div>

        {/* Always two-column on lg+ */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Upload controls ── */}
          <div className="flex flex-col gap-5">

            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[220px] flex flex-col items-center justify-center p-10 text-center select-none
                ${isDragActive
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : file
                  ? "border-accent/50 bg-accent/5"
                  : "border-white/20 bg-white/[0.02] hover:border-primary/50 hover:bg-white/5"
                }
              `}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-primary shadow-[0_0_18px_rgba(0,212,255,0.25)]">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold mb-1">Drag &amp; drop your 3D file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <span className="text-xs font-mono px-3 py-1 rounded border border-white/10 bg-black/40 text-white/40">
                      .glb · .gltf — up to 100 MB
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-3 text-white shadow-[0_0_16px_rgba(191,0,255,0.25)]">
                      <FileBox className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-base mb-0.5 max-w-full truncate px-4">{file.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.name.split(".").pop()?.toUpperCase()}
                    </p>

                    <div className="flex gap-3 flex-wrap justify-center">
                      <button
                        onClick={clearFile}
                        disabled={uploadMutation.isPending}
                        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Change File
                      </button>
                      {!uploadedModel && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                          disabled={uploadMutation.isPending}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_0_14px_rgba(0,212,255,0.35)] hover:shadow-[0_0_22px_rgba(191,0,255,0.5)] hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {uploadMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                          ) : (
                            <><UploadCloud className="w-4 h-4" /> Upload &amp; Save</>
                          )}
                        </button>
                      )}
                      {uploadedModel && (
                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20">
                          <CheckCircle2 className="w-4 h-4" /> Saved to server
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* File error */}
            <AnimatePresence>
              {fileError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  {fileError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* QR + links — shown after server upload */}
            <AnimatePresence>
              {uploadedModel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-accent/30 bg-accent/5 p-6 relative overflow-hidden shadow-[0_0_25px_rgba(191,0,255,0.1)]"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary via-accent to-primary" />
                  <h3 className="font-display font-bold text-base mb-1 text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-accent" /> AR Experience Ready
                  </h3>
                  <p className="text-xs text-muted-foreground mb-5">Scan on your phone to view in Augmented Reality</p>

                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    <div className="bg-white p-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] shrink-0">
                      <QRCodeCanvas
                        id="qr-code-canvas"
                        value={viewerUrl}
                        size={150}
                        level="H"
                        fgColor="#0a0a0f"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div className="flex flex-col gap-3 w-full min-w-0">
                      <p className="text-xs font-mono text-muted-foreground break-all">{viewerUrl}</p>
                      <button
                        onClick={downloadQR}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" /> Download QR
                      </button>
                      <Link
                        href={`/viewer/${uploadedModel.id}`}
                        className="w-full px-4 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_12px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2 text-sm font-bold"
                      >
                        <Eye className="w-4 h-4" /> Open Full AR Viewer
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: 3D Preview panel ── */}
          <div
            className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden relative flex flex-col"
            style={{ minHeight: 480 }}
          >
            {/* Panel header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
              <Cuboid className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white/80">3D Preview</span>
              {file && (
                <span className="ml-auto text-xs font-mono text-white/35 truncate max-w-[180px]">{file.name}</span>
              )}
              {uploadedModel && (
                <span className="ml-1 text-xs text-green-400/80 font-medium bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                  ✓ Saved
                </span>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 relative" style={{ minHeight: 400 }}>
              {/* Background grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right,#80808010 1px,transparent 1px),linear-gradient(to bottom,#80808010 1px,transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              {/* State: No file selected */}
              {!file && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                    <Cuboid className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-white/40 font-medium mb-1">3D preview will appear here</p>
                    <p className="text-white/25 text-sm">Upload a .glb or .gltf file to get started</p>
                  </div>
                  <button
                    onClick={open}
                    className="mt-1 px-5 py-2.5 rounded-lg border border-primary/40 text-primary text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Browse Files
                  </button>
                </div>
              )}

              {/* State: File picked, WebGL not supported */}
              {file && webglSupported === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-white/70 font-semibold mb-1">3D preview not available</p>
                    <p className="text-white/40 text-sm max-w-xs">
                      Your browser doesn't support WebGL. You can still upload and share the AR link — it will render on supported devices.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">
                    <FileBox className="w-4 h-4" /> {file.name} ready to upload
                  </div>
                </div>
              )}

              {/* State: Loading model-viewer engine */}
              {file && webglSupported === true && !modelViewerReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary/60">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">Loading 3D engine…</span>
                </div>
              )}

              {/* State: model-viewer ready with a src */}
              {file && webglSupported === true && modelViewerReady && previewSrc && (
                <model-viewer
                  src={previewSrc}
                  alt={file.name}
                  camera-controls
                  auto-rotate
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  shadow-intensity="0.8"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                    background: "transparent",
                  }}
                />
              )}

              {/* Uploading overlay */}
              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10 backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-white/70 font-medium">Uploading to server…</p>
                </div>
              )}
            </div>

            {/* Controls hint footer */}
            {file && webglSupported === true && modelViewerReady && (
              <div className="shrink-0 px-5 py-2 border-t border-white/10 bg-white/[0.02] text-xs text-white/30 flex gap-4">
                <span>Scroll to zoom</span>
                <span>·</span>
                <span>Drag to rotate</span>
                {uploadedModel && (
                  <span className="ml-auto text-accent/60 font-medium">AR enabled on mobile</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
