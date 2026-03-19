import { Layout } from "@/components/Layout";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadModel } from "@/hooks/use-models";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileBox, X, CheckCircle2, Download, Eye, Loader2 } from "lucide-react";
import { type Model } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedModel, setUploadedModel] = useState<Model | null>(null);
  const uploadMutation = useUploadModel();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadedModel(null); // Reset if dragging a new one
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setUploadedModel(data);
        toast({
          title: "Upload Successful!",
          description: "Your 3D model is ready for AR viewing.",
        });
      },
      onError: (error) => {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    // Create download link
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `scanar-${uploadedModel?.id || 'ar'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const viewerUrl = uploadedModel ? `${window.location.origin}/viewer/${uploadedModel.id}` : "";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Upload <span className="text-primary">Model</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Drop your .glb or .gltf file to instantly generate an AR experience.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Main Upload Area */}
          <div className={`md:col-span-${uploadedModel ? '7' : '12'} transition-all duration-500`}>
            <div className="glass-panel p-1 rounded-3xl neon-border relative overflow-hidden group">
              {/* Animated glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div 
                {...getRootProps()} 
                className={`relative z-10 p-12 border-2 border-dashed rounded-[22px] flex flex-col items-center justify-center min-h-[400px] transition-colors cursor-pointer text-center
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}
                `}
              >
                <input {...getInputProps()} />
                
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                        <UploadCloud className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Drag & Drop your 3D file</h3>
                      <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                      <div className="text-xs font-mono px-3 py-1 rounded border border-white/10 bg-black/50 text-white/50">
                        Supports .glb and .gltf
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="file"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-6 text-white shadow-[0_0_20px_rgba(191,0,255,0.3)]">
                        <FileBox className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-bold mb-1 max-w-full truncate px-4">{file.name}</h3>
                      <p className="text-muted-foreground mb-8 text-sm">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>

                      {!uploadedModel && (
                        <div className="flex gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-medium transition-colors flex items-center gap-2"
                            disabled={uploadMutation.isPending}
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpload();
                            }}
                            disabled={uploadMutation.isPending}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(191,0,255,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {uploadMutation.isPending ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                            ) : (
                              <><UploadCloud className="w-5 h-5" /> Upload File</>
                            )}
                          </button>
                        </div>
                      )}

                      {uploadedModel && (
                        <div className="flex items-center gap-2 text-green-400 font-medium bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
                          <CheckCircle2 className="w-5 h-5" />
                          Upload Complete
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Success / QR Code Area */}
          <AnimatePresence>
            {uploadedModel && (
              <motion.div 
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                className="md:col-span-5 h-full"
              >
                <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center relative overflow-hidden border-accent/30 shadow-[0_0_30px_rgba(191,0,255,0.15)]">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  
                  <h3 className="text-2xl font-display font-bold mb-2 text-white">AR Ready</h3>
                  <p className="text-sm text-muted-foreground mb-8">Scan to view on your mobile device</p>
                  
                  <div className="bg-white p-4 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] mb-8">
                    <QRCodeCanvas 
                      id="qr-code-canvas"
                      value={viewerUrl} 
                      size={200}
                      level={"H"}
                      includeMargin={false}
                      fgColor={"#0a0a0f"}
                      bgColor={"#ffffff"}
                    />
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={downloadQR}
                      className="w-full px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Download className="w-5 h-5" /> Download QR
                    </button>
                    
                    <Link 
                      href={`/viewer/${uploadedModel.id}`}
                      className="w-full px-6 py-3 rounded-xl bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2 font-bold"
                    >
                      <Eye className="w-5 h-5" /> Open Web Viewer
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </Layout>
  );
}
