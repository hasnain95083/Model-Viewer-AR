import { Layout } from "@/components/Layout";
import { useParams } from "wouter";
import { useGetModel } from "@/hooks/use-models";
import { useEffect, useRef, useState } from "react";
import { Loader2, Cuboid, Expand, RefreshCw, QrCode, ArrowLeft, AlertCircle, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "wouter";

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

export default function ViewerPage() {
  const params = useParams();
  const id = params.id ?? "";
  const { data: model, isLoading, isError } = useGetModel(id);
  const [mvLoaded, setMvLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [showQR, setShowQR] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

  useEffect(() => { setWebglSupported(checkWebGL()); }, []);

  useEffect(() => {
    if (!webglSupported) return;
    if (customElements.get("model-viewer")) { setMvLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.type = "module";
    script.onload = () => setMvLoaded(true);
    script.onerror = () => console.warn("model-viewer failed");
    document.head.appendChild(script);
  }, [webglSupported]);

  const resetCamera = () => {
    const viewer = viewerRef.current as any;
    if (viewer?.resetTurntableRotation) viewer.resetTurntableRotation();
    if (viewer?.jumpCameraToGoal) viewer.jumpCameraToGoal();
  };

  const viewerUrl = model ? `${window.location.origin}/viewer/${model.id}` : "";

  const downloadQR = () => {
    const canvas = document.getElementById("viewer-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    a.download = `scanar-${id}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-lime-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading model…</p>
        </div>
      </Layout>
    );
  }

  if (isError || !model) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-400 mb-5">
            <Cuboid className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Model Not Found</h2>
          <p className="text-slate-500 max-w-md mb-6">This 3D model could not be loaded. It may have been removed or the ID is invalid.</p>
          <Link href="/upload" className="btn-primary flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload a Model
          </Link>
        </div>
      </Layout>
    );
  }

  const modelFileUrl = `/api/models/${model.id}/file`;

  return (
    <Layout>
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full" style={{ height: "calc(100vh - 80px)" }}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {model.name}
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                  {model.filename.split(".").pop()?.toUpperCase()}
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">{model.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={resetCamera}
              className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => setShowQR((v) => !v)}
              className={`flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl border font-semibold transition-all ${
                showQR ? "bg-lime-600 border-lime-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}>
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
          </div>
        </div>

        {/* Viewer + QR panel */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

          {/* model-viewer card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 card overflow-hidden relative"
          >
            {/* Subtle dot bg */}
            <div className="absolute inset-0 dot-bg opacity-50 pointer-events-none" />

            {webglSupported === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 z-10">
                <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">3D viewer not available</p>
                  <p className="text-sm text-slate-400 max-w-xs">Your browser doesn't support WebGL. Open on a mobile device to view in AR.</p>
                </div>
                <a href={modelFileUrl} download className="btn-secondary text-sm flex items-center gap-2">Download Model File</a>
              </div>
            )}

            {webglSupported === true && !mvLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 z-10">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Loading WebXR engine…</span>
              </div>
            )}

            {webglSupported === true && mvLoaded && (
              <model-viewer ref={viewerRef as any} src={modelFileUrl} alt={model.name}
                ar ar-modes="webxr scene-viewer quick-look" camera-controls auto-rotate shadow-intensity="0.6"
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0, background: "transparent" }}
              >
                <button slot="ar-button" style={{
                  position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
                  padding: "12px 28px", background: "#65a30d", border: "none",
                  borderRadius: "999px", color: "white", fontWeight: "700", fontSize: "14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 16px rgba(101,163,13,0.35)", whiteSpace: "nowrap",
                }}>
                  <Expand style={{ width: 16, height: 16 }} /> View in AR
                </button>
              </model-viewer>
            )}

            {webglSupported === true && mvLoaded && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs text-slate-400 pointer-events-none shadow-sm backdrop-blur-sm">
                Drag to rotate · Scroll to zoom
              </div>
            )}
          </motion.div>

          {/* QR side panel */}
          {showQR && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              className="w-60 shrink-0 card p-5 flex flex-col items-center justify-center text-center gap-4"
            >
              <div>
                <p className="font-semibold text-slate-900 text-sm mb-0.5">Scan to open on mobile</p>
                <p className="text-xs text-slate-400">Point your camera at the code</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <QRCodeCanvas id="viewer-qr-canvas" value={viewerUrl} size={160} level="H" fgColor="#0f172a" bgColor="#ffffff" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 break-all px-1">{viewerUrl}</p>
              <button onClick={downloadQR} className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-1.5">
                Download QR
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
