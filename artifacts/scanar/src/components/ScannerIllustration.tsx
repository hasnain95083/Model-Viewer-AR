import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function ScannerIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square perspective-[1000px]">
      {/* Base Platform */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-primary/10 rounded-full blur-xl animate-pulse-glow" />
      
      {/* 3D Object Mockup */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative w-48 h-48 border border-primary/30 bg-primary/5 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.2)]">
          <Box className="w-24 h-24 text-primary opacity-80" strokeWidth={1} />
          
          {/* Decorative nodes */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#bf00ff]" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#00d4ff]" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#00d4ff]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#bf00ff]" />
        </div>
      </motion.div>

      {/* Laser Scanner Line */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_#00d4ff,0_0_30px_#00d4ff] animate-scan z-10">
          <div className="absolute -top-8 left-0 w-full h-16 bg-gradient-to-b from-transparent via-primary/20 to-primary/5" />
        </div>
      </div>
      
      {/* Corner UI Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />
    </div>
  );
}
