import { Layout } from "@/components/Layout";
import { useParams } from "wouter";
import { useGetModel } from "@/hooks/use-models";
import { useEffect, useRef, useState } from "react";
import { Loader2, Cuboid, Expand, RefreshCw, QrCode, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "wouter";

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

export default function ViewerPage() {
  const params = useParams();
  const id = params.id ?? "";
  const { data: model, isLoading, isError } = useGetModel(id);
  const [mvLoaded, setMvLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [showQR, setShowQR] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setWebglSupported(checkWebGL());
  }, []);

  useEffect(() => {
    if (!webglSupported) return;
    if (customElements.get("model-viewer")) {
      setMvLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.type = "module";
    script.onload = () => setMvLoaded(true);
    script.onerror = () => console.warn("model-viewer failed to load");
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
    const url = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const a = document.createElement("a");
    a.href = url;
    a.download = `scanar-${id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground tracking-widest text-sm animate-pulse">LOADING ASSET…</p>
        </div>
      </Layout>
    );
  }

  if (isError || !model) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-6">
            <Cuboid className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Model Not Found</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            The 3D model could not be loaded. It may have been removed or the ID is invalid.
          </p>
          <Link
            href="/upload"
            className="px-6 py-3 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
          >
            Upload a Model
          </Link>
        </div>
      </Layout>
    );
  }

  const modelFileUrl = `/api/models/${model.id}/file`;

  return (
    <Layout>
      <div
        className="flex flex-col px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold flex items-center gap-2">
                {model.name}
                <span className="text-xs font-sans px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white/60">
                  {model.filename.split(".").pop()?.toUpperCase()}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{model.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetCamera}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Reset View
            </button>
            <button
              onClick={() => setShowQR((v) => !v)}
              className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 text-sm ${
                showQR
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
          </div>
        </div>

        {/* Viewer + optional QR panel */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

          {/* model-viewer area */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-2xl overflow-hidden relative bg-[#0d0d14] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* Grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right,#80808010 1px,transparent 1px),linear-gradient(to bottom,#80808010 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* WebGL not supported */}
            {webglSupported === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 z-10">
                <div className="w-16 h-16 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-white/70 font-semibold mb-1">3D viewer not available</p>
                  <p className="text-white/40 text-sm max-w-xs">
                    Your browser doesn't support WebGL. Open this page on a mobile device to view in AR.
                  </p>
                </div>
                <a
                  href={modelFileUrl}
                  download
                  className="mt-2 px-5 py-2.5 rounded-lg border border-primary/40 text-primary text-sm hover:bg-primary/10 transition-colors"
                >
                  Download Model File
                </a>
              </div>
            )}

            {/* Loading engine */}
            {webglSupported === true && !mvLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary/60 z-10">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-sm tracking-wider">LOADING WEBXR ENGINE…</span>
              </div>
            )}

            {/* model-viewer */}
            {webglSupported === true && mvLoaded && (
              <model-viewer
                ref={viewerRef as any}
                src={modelFileUrl}
                alt={model.name}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  background: "transparent",
                }}
              >
                <button
                  slot="ar-button"
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "14px 32px",
                    background: "linear-gradient(to right, #00d4ff, #bf00ff)",
                    border: "none",
                    borderRadius: "999px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 20px rgba(0,212,255,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Expand style={{ width: 18, height: 18 }} /> View in AR
                </button>
              </model-viewer>
            )}

            {/* Hint overlay */}
            {webglSupported === true && mvLoaded && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs text-white/40 pointer-events-none backdrop-blur-sm">
                Drag to rotate · Scroll to zoom
              </div>
            )}
          </motion.div>

          {/* QR side panel — toggled by button */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 shrink-0 rounded-2xl border border-accent/30 bg-accent/5 p-5 flex flex-col items-center justify-center text-center gap-4 shadow-[0_0_25px_rgba(191,0,255,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary via-accent to-primary" />
              <p className="text-sm font-semibold text-white/80">Scan to open on mobile</p>
              <div className="bg-white p-3 rounded-xl">
                <QRCodeCanvas
                  id="viewer-qr-canvas"
                  value={viewerUrl}
                  size={170}
                  level="H"
                  fgColor="#0a0a0f"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all px-1">{viewerUrl}</p>
              <button
                onClick={downloadQR}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Download QR
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
