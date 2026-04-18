import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function ScannerIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">

      <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">

        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: "linear-gradient(rgba(132,204,22,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(132,204,22,0.08) 0%, transparent 65%)"
        }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute left-0 w-full h-[2px] bg-lime-400"
            style={{ boxShadow: "0 0 12px #84cc16, 0 0 28px #84cc16, 0 0 48px rgba(132,204,22,0.4)" }}
            animate={{ top: ["5%", "92%", "5%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-lime-500/25 to-transparent" />
          </motion.div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="relative w-36 h-36 border border-lime-500/50 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(132,204,22,0.06)",
                boxShadow: "0 0 32px rgba(132,204,22,0.18), inset 0 0 18px rgba(132,204,22,0.06)"
              }}
            >
              <Box className="w-20 h-20 text-lime-400" strokeWidth={1} style={{ filter: "drop-shadow(0 0 8px rgba(132,204,22,0.8))" }} />
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-400 rounded-full" style={{ boxShadow: "0 0 8px #84cc16, 0 0 18px #84cc16" }} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" style={{ boxShadow: "0 0 8px #34d399, 0 0 16px #34d399" }} />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full" style={{ boxShadow: "0 0 8px #34d399, 0 0 16px #34d399" }} />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-lime-400 rounded-full" style={{ boxShadow: "0 0 8px #84cc16, 0 0 18px #84cc16" }} />
            </div>
          </motion.div>
        </div>

        <div className="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-lime-400/80" />
        <div className="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-lime-400/80" />
        <div className="absolute bottom-14 left-5 w-7 h-7 border-b-2 border-l-2 border-lime-400/80" />
        <div className="absolute bottom-14 right-5 w-7 h-7 border-b-2 border-r-2 border-lime-400/80" />

        <div className="absolute bottom-0 left-0 right-0 p-4 pt-3 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono tracking-widest text-lime-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse inline-block" />
              SCANNING GEOMETRY
            </span>
            <span className="text-[9px] font-mono text-slate-500">FORMAT .GLB</span>
          </div>
          <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #65a30d, #84cc16, #a3e635)" }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-6 rounded-full"
        style={{ background: "rgba(132,204,22,0.2)", filter: "blur(16px)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
