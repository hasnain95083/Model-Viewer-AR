import { motion } from "framer-motion";
import { Box, QrCode, Smartphone } from "lucide-react";

export function ScannerIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square select-none">

      {/* Outer ring */}
      <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-lime-200 animate-[spin_25s_linear_infinite]" />

      {/* Center 3D box mockup */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-40 h-40"
        >
          <div className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
            <Box className="w-20 h-20 text-lime-500" strokeWidth={1} />
          </div>
        </motion.div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-lime-400 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-lime-400 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-lime-400 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-lime-400 rounded-br-lg" />

      {/* Floating QR badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-0 bg-white rounded-xl border border-slate-200 shadow-md px-3 py-2 flex items-center gap-2"
      >
        <QrCode className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-semibold text-slate-700">Scan QR</span>
      </motion.div>

      {/* Floating AR badge */}
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-10 left-0 bg-lime-600 rounded-xl shadow-md px-3 py-2 flex items-center gap-2"
      >
        <Smartphone className="w-4 h-4 text-white" />
        <span className="text-xs font-semibold text-white">View in AR</span>
      </motion.div>

      {/* Scan line animation */}
      <div className="absolute inset-10 overflow-hidden rounded-2xl pointer-events-none">
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-0.5 bg-lime-500/60"
          style={{ boxShadow: "0 0 8px rgba(101,163,13,0.4)" }}
        />
      </div>

    </div>
  );
}
