import { Layout } from "@/components/Layout";
import { useParams } from "wouter";
import { useGetModel } from "@/hooks/use-models";
import { useEffect, useRef, useState } from "react";
import { Loader2, Cuboid, Expand, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

// Add TypeScript definitions for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        class?: string;
      }, HTMLElement>;
    }
  }
}

export default function ViewerPage() {
  const params = useParams();
  const id = params.id || "";
  const { data: model, isLoading, isError, error } = useGetModel(id);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

  // Dynamically inject model-viewer script
  useEffect(() => {
    if (customElements.get("model-viewer")) {
      setModelViewerLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.type = "module";
    script.onload = () => setModelViewerLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount as it's registered globally
    };
  }, []);

  const resetCamera = () => {
    if (viewerRef.current) {
      // Access the raw element to reset its camera
      const viewer = viewerRef.current as any;
      if (typeof viewer.cameraOrbit !== 'undefined') {
        viewer.cameraOrbit = "0deg 75deg 105%";
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-display tracking-widest animate-pulse">LOADING ASSET...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !model) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-6 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
            <Cuboid className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Model Not Found</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            The requested 3D model could not be loaded. It may have been removed or the ID is invalid.
          </p>
          <a href="/upload" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            Upload New Model
          </a>
        </div>
      </Layout>
    );
  }

  // Construct the absolute URL to the file endpoint.
  // The backend will serve the raw .glb/.gltf file from /api/models/:id/file
  const modelFileUrl = `/api/models/${model.id}/file`;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
              {model.name}
              <span className="text-xs font-sans px-2 py-1 rounded bg-white/10 border border-white/20 text-white/70">
                {model.filename.split('.').pop()?.toUpperCase()}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              ID: <span className="font-mono">{model.id}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={resetCamera}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Reset View
            </button>
            <a 
              href={modelFileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" /> Raw File
            </a>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 glass-panel rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)] border-white/10 flex items-center justify-center group bg-[#111]"
        >
          {/* subtle background grid for the viewer */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          {!modelViewerLoaded ? (
            <div className="flex flex-col items-center text-primary/50">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span>Loading WebXR Engine...</span>
            </div>
          ) : (
            <model-viewer
              ref={viewerRef as any}
              src={modelFileUrl}
              alt={model.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              class="w-full h-full outline-none focus:outline-none z-10 cursor-grab active:cursor-grabbing"
              style={{ '--poster-color': 'transparent' } as any}
            >
              {/* Custom AR Button slotted into model-viewer */}
              <button 
                slot="ar-button" 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-white font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)] flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Expand className="w-5 h-5" /> View in Space
              </button>
            </model-viewer>
          )}

          {/* Overlay hint */}
          <div className="absolute top-6 right-6 px-4 py-2 rounded-full glass-panel border border-white/10 text-xs font-medium text-white/60 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
            Scroll to zoom • Drag to rotate
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
