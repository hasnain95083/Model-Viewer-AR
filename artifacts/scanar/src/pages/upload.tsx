import { Layout } from "@/components/Layout";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadModel } from "@/hooks/use-models";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileBox, X, CheckCircle2, Download,
  Eye, Loader2, Cuboid, AlertCircle, Smartphone, QrCode
} from "lucide-react";
import { type Model } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string; alt?: string; ar?: boolean;
          "ar-modes"?: string; "camera-controls"?: boolean;
          "auto-rotate"?: boolean; "shadow-intensity"?: string;
        },
        HTMLElement
      >;
    }
  }
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch { return false; }
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

  useEffect(() => { setWebglSupported(checkWebGL()); }, []);

  useEffect(() => {
    if (!file || !webglSupported) return;
    if (customElements.get("model-viewer")) { setModelViewerReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.type = "module";
    script.onload = () => setModelViewerReady(true);
    script.onerror = () => console.warn("model-viewer failed");
    document.head.appendChild(script);
  }, [file, webglSupported]);

  useEffect(() => { return () => { if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current); }; }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File }[]) => {
    setFileError(null);
    const candidates = acceptedFiles.length > 0 ? acceptedFiles : rejectedFiles.map((r) => r.file);
    if (candidates.length === 0) return;
    const f = candidates[0];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "glb" && ext !== "gltf") { setFileError("Only .glb and .gltf files are supported."); return; }
    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const blobUrl = URL.createObjectURL(f);
    prevBlobRef.current = blobUrl;
    setFile(f); setLocalBlobUrl(blobUrl); setUploadedModel(null); setModelViewerReady(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "model/gltf-binary": [".glb"], "model/gltf+json": [".gltf"], "application/octet-stream": [".glb"], "application/json": [".gltf"] },
    maxFiles: 1, multiple: false,
    validator: (f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ext !== "glb" && ext !== "gltf" ? { code: "wrong-extension", message: "Only .glb and .gltf allowed" } : null;
    },
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (data) => { setUploadedModel(data); toast({ title: "Uploaded!", description: "Your 3D model is live." }); },
      onError: (err) => { toast({ title: "Upload Failed", description: err.message, variant: "destructive" }); },
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    a.download = `scanar-qr-${uploadedModel?.id ?? "model"}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prevBlobRef.current) { URL.revokeObjectURL(prevBlobRef.current); prevBlobRef.current = null; }
    setFile(null); setLocalBlobUrl(null); setUploadedModel(null); setFileError(null); setModelViewerReady(false);
  };

  const viewerUrl = uploadedModel ? `${window.location.origin}/viewer/${uploadedModel.id}` : "";
  const previewSrc = uploadedModel ? `/api/models/${uploadedModel.id}/file` : localBlobUrl ?? undefined;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="section-label mb-2">Upload</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Upload a 3D Model</h1>
          <p className="text-slate-500">Drop your .glb or .gltf file, preview it, then save and share via AR link.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">

          {/* ── LEFT: Controls ── */}
          <div className="flex flex-col gap-4">

            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center p-8 text-center select-none
                ${isDragActive ? "border-lime-500 bg-lime-50" : file ? "border-lime-300 bg-lime-50/50" : "border-slate-200 bg-white hover:border-lime-400 hover:bg-lime-50/30"}`}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div key="empty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">Drag &amp; drop your 3D file</p>
                    <p className="text-sm text-slate-400 mb-3">or click to browse files</p>
                    <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-mono">
                      .glb · .gltf — up to 100 MB
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col items-center w-full">
                    <div className="w-14 h-14 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center mb-3 text-lime-600">
                      <FileBox className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-900 mb-0.5 max-w-full truncate px-4">{file.name}</p>
                    <p className="text-xs text-slate-500 mb-4">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.name.split(".").pop()?.toUpperCase()}
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <button onClick={clearFile} disabled={uploadMutation.isPending}
                        className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3">
                        <X className="w-3.5 h-3.5" /> Change
                      </button>
                      {!uploadedModel && (
                        <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={uploadMutation.isPending}
                          className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
                          {uploadMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><UploadCloud className="w-3.5 h-3.5" /> Upload &amp; Save</>}
                        </button>
                      )}
                      {uploadedModel && (
                        <span className="flex items-center gap-1.5 text-lime-700 text-sm font-semibold bg-lime-50 px-3 py-2 rounded-xl border border-lime-200">
                          <CheckCircle2 className="w-4 h-4" /> Saved!
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress bar while uploading */}
            {uploadMutation.isPending && (
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-lime-500 rounded-full" initial={{ width: "5%" }} animate={{ width: "90%" }} transition={{ duration: 2 }} />
              </div>
            )}

            {/* File error */}
            <AnimatePresence>
              {fileError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{fileError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* QR + links after upload */}
            <AnimatePresence>
              {uploadedModel && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-600">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">AR Experience Ready</p>
                      <p className="text-xs text-slate-500">Scan with your phone to view in AR</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                      <QRCodeCanvas id="qr-code-canvas" value={viewerUrl} size={140} level="H" fgColor="#0f172a" bgColor="#ffffff" />
                    </div>
                    <div className="flex flex-col gap-2.5 w-full min-w-0">
                      <p className="text-xs font-mono text-slate-400 break-all bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">{viewerUrl}</p>
                      <button onClick={downloadQR}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <Download className="w-4 h-4" /> Download QR
                      </button>
                      <Link href={`/viewer/${uploadedModel.id}`}
                        className="btn-primary flex items-center justify-center gap-2 text-sm py-2">
                        <Eye className="w-4 h-4" /> Open AR Viewer
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: 3D Preview ── */}
          <div className="card overflow-hidden flex flex-col" style={{ minHeight: 460 }}>
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
              <Cuboid className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">3D Preview</span>
              {file && <span className="ml-auto text-xs text-slate-400 truncate max-w-[180px]">{file.name}</span>}
              {uploadedModel && (
                <span className="ml-1 flex items-center gap-1 text-xs text-lime-700 font-semibold bg-lime-50 px-2 py-0.5 rounded-full border border-lime-200">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            {/* Preview area */}
            <div className="flex-1 relative bg-slate-50" style={{ minHeight: 380 }}>
              <div className="absolute inset-0 dot-bg opacity-50 pointer-events-none" />

              {!file && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 shadow-sm">
                    <Cuboid className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400 mb-1">3D preview will appear here</p>
                    <p className="text-sm text-slate-300">Upload a .glb or .gltf file to get started</p>
                  </div>
                  <button onClick={open} className="btn-secondary flex items-center gap-2 text-sm">
                    <UploadCloud className="w-4 h-4" /> Browse Files
                  </button>
                </div>
              )}

              {file && webglSupported === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">3D preview unavailable</p>
                    <p className="text-sm text-slate-400 max-w-xs">WebGL isn't supported in this browser. You can still upload and share the AR link.</p>
                  </div>
                </div>
              )}

              {file && webglSupported === true && !modelViewerReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-sm">Loading 3D engine…</span>
                </div>
              )}

              {file && webglSupported === true && modelViewerReady && previewSrc && (
                <model-viewer src={previewSrc} alt={file.name} camera-controls auto-rotate ar
                  ar-modes="webxr scene-viewer quick-look" shadow-intensity="0.5"
                  style={{ width: "100%", height: "100%", position: "absolute", inset: 0, background: "transparent" }}
                />
              )}

              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                  <Loader2 className="w-8 h-8 text-lime-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Uploading…</p>
                </div>
              )}
            </div>

            {file && webglSupported === true && modelViewerReady && (
              <div className="shrink-0 px-5 py-2.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 flex gap-4">
                <span>Scroll to zoom · Drag to rotate</span>
                {uploadedModel && <span className="ml-auto text-lime-600 font-medium flex items-center gap-1"><QrCode className="w-3 h-3" /> AR enabled</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
