import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { UploadCloud, QrCode, Smartphone, Cuboid, ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({ ...fadeUp, transition: { duration: 0.4, delay: i * 0.08 } });

function ScannerAnimation() {
  const [scanY, setScanY] = useState(10);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState<{ x: number; y: number; id: number }[]>([]);
  const dotId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanY((prev) => {
        const next = prev + direction * 1.1;
        if (next >= 88) { setDirection(-1); return 88; }
        if (next <= 10) { setDirection(1); return 10; }
        return next;
      });
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.55));
      setDots((prev) => {
        const filtered = prev.filter((d) => d.id > dotId.current - 30);
        if (Math.random() > 0.55) {
          dotId.current += 1;
          return [...filtered, { x: 8 + Math.random() * 84, y: scanY + (Math.random() - 0.5) * 4, id: dotId.current }];
        }
        return filtered;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [direction, scanY]);

  const cubeLines = [
    "M 30 25 L 70 25 L 70 65 L 30 65 Z",
    "M 40 15 L 80 15 L 80 55 L 40 55 Z",
    "M 30 25 L 40 15", "M 70 25 L 80 15",
    "M 70 65 L 80 55", "M 30 65 L 40 55",
  ];

  return (
    <div className="relative w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-700 shadow-2xl" style={{ aspectRatio: "4/3" }}>
      <div className="absolute inset-0 dot-bg opacity-10" />

      <div className="absolute top-3 left-4 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-lime-500/70" />
        <span className="ml-2 text-[10px] font-mono text-slate-500 tracking-wider">SCAN_AR — 3D CAPTURE</span>
      </div>

      <svg viewBox="0 0 110 90" className="absolute inset-0 w-full h-full" style={{ top: "10%", left: "5%", width: "90%", height: "80%" }}>
        {cubeLines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#64748b" strokeWidth="0.6" strokeLinecap="round" />
        ))}

        <line x1="8" y1={scanY} x2="92" y2={scanY} stroke="#84cc16" strokeWidth="0.7" strokeOpacity="0.9" />
        <rect x="8" y={scanY - 6} width="84" height="6" fill="url(#scanGlow)" />

        {dots.map((d) => (
          <circle key={d.id} cx={d.x} cy={d.y} r="0.7" fill="#a3e635" fillOpacity="0.85" />
        ))}

        <defs>
          <linearGradient id="scanGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-lime-400 tracking-widest flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            SCANNING GEOMETRY
          </span>
          <span className="text-[10px] font-mono text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-600 to-lime-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-mono text-slate-600">VERTICES: {dots.length * 12}</span>
          <span className="text-[9px] font-mono text-slate-600">FORMAT: .GLB</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* Dot background */}
        <div className="absolute inset-0 dot-bg opacity-60 pointer-events-none" />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <motion.div {...stagger(0)} className="flex flex-col gap-6 max-w-xl">
              <div className="badge badge-lime w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                WebAR Platform — Now Live
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight">
                Your Ultimate AR{" "}
                <span className="text-lime-600">Product Visualization</span>{" "}
                Platform
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed">
                Upload .glb or .gltf files, instantly generate an augmented reality viewer link, and share it anywhere with a scannable QR code — no app required.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/upload" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  <UploadCloud className="w-5 h-5" /> Upload Your Model
                </Link>
                <Link href="/pricing" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
                  See Pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-4 pt-2">
                {["No app required", "Instant QR code", "Free to start"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-lime-500 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: 3D scanner animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <ScannerAnimation />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
                    <Cuboid className="w-5 h-5 text-lime-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">product-chair.glb</p>
                    <p className="text-xs text-slate-400">2.4 MB · Ready</p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-lime-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">4.8s avg.</p>
                    <p className="text-xs text-slate-400">Processing time</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Core Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Everything you need to go from{" "}
              <span className="text-lime-600">file to AR</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              A complete platform for 3D product visualization in augmented reality. Built for designers, developers, and teams.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              {...stagger(0)}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              viewport={{ once: true }}
              className="lg:col-span-2 card-hover p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center mb-5">
                <UploadCloud className="w-6 h-6 text-lime-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Drag-and-Drop 3D Upload</h3>
              <p className="text-slate-500 leading-relaxed max-w-lg">
                Upload .glb and .gltf files instantly. We handle storage, optimization, and hosting — your model is live in seconds with a permanent shareable URL.
              </p>
              <div className="mt-5 flex gap-2 flex-wrap">
                {[".glb", ".gltf", "Up to 100 MB", "Instant processing"].map((tag) => (
                  <span key={tag} className="badge badge-slate text-xs">{tag}</span>
                ))}
              </div>
            </motion.div>

            {/* Small card */}
            <motion.div
              {...stagger(1)}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              viewport={{ once: true }}
              className="card-hover p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
                <Cuboid className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">WebXR AR Viewer</h3>
              <p className="text-slate-500 leading-relaxed">
                Works with WebXR, Scene Viewer, and Quick Look. No app installation needed — just a browser.
              </p>
            </motion.div>

            {/* Small card */}
            <motion.div
              {...stagger(2)}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              viewport={{ once: true }}
              className="card-hover p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dynamic QR Codes</h3>
              <p className="text-slate-500 leading-relaxed">
                Auto-generated scannable codes for every model. Download and embed in print, packaging, or email.
              </p>
            </motion.div>

            {/* Medium card */}
            <motion.div
              {...stagger(3)}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              viewport={{ once: true }}
              className="lg:col-span-2 card-hover p-8 flex items-start gap-6"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
                  <Globe className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Share Anywhere</h3>
                <p className="text-slate-500 leading-relaxed max-w-lg">
                  Every model gets a permanent public link. Share directly via URL, embed in your website, or attach to email campaigns. Works on iOS Safari, Android Chrome, and more.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              From 3D file to AR experience <br className="hidden sm:block" />
              <span className="text-lime-600">in under 30 seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-slate-200 -z-10" />

            {[
              { step: "01", title: "Upload", icon: UploadCloud, desc: "Drag your .glb or .gltf file", color: "bg-lime-50 border-lime-200 text-lime-600" },
              { step: "02", title: "Process", icon: Cuboid, desc: "We host and optimize it", color: "bg-blue-50 border-blue-200 text-blue-600" },
              { step: "03", title: "Share QR", icon: QrCode, desc: "Scan or share the code", color: "bg-violet-50 border-violet-200 text-violet-600" },
              { step: "04", title: "View in AR", icon: Smartphone, desc: "Place it in your space", color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`relative w-20 h-20 rounded-2xl border ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <item.icon className="w-8 h-8" />
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to bring your products to life?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join teams already using ScanAR to create immersive AR product experiences.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn-primary px-8 py-3 text-base flex items-center gap-2">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="px-8 py-3 rounded-xl font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all text-base">
              View Plans
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
