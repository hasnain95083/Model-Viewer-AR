import { Layout } from "@/components/Layout";
import { ScannerIllustration } from "@/components/ScannerIllustration";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { UploadCloud, QrCode, Smartphone, Cuboid } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image generated from requirements */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Futuristic neon grid background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">WebAR Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display leading-[1.1]">
                Transform 3D Models Into <br/>
                <span className="text-gradient">AR Experiences</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Upload your .glb or .gltf files, instantly generate an augmented reality viewer link, and share it anywhere with a dynamic QR code.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Link 
                  href="/upload" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-accent text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(191,0,255,0.5)] hover:-translate-y-1 transition-all duration-300"
                >
                  Upload Your Model
                </Link>
                <a 
                  href="#how-it-works" 
                  className="px-8 py-4 rounded-xl font-bold text-lg glass-panel hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  Learn More
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:ml-auto w-full"
            >
              <ScannerIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/20 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display mb-4">Core <span className="text-primary">Features</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to bring your 3D assets into the real world.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "3D Upload",
                desc: "Drag and drop your .glb or .gltf files. We handle the optimization and hosting.",
                icon: UploadCloud,
                color: "text-primary"
              },
              {
                title: "AR Viewer",
                desc: "Instant WebXR and Quick Look support. No apps required to view in real space.",
                icon: Cuboid,
                color: "text-accent"
              },
              {
                title: "Dynamic QR Code",
                desc: "Generate scannable codes instantly to bridge desktop design and mobile viewing.",
                icon: QrCode,
                color: "text-primary"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-panel p-8 rounded-2xl neon-border group cursor-default"
              >
                <div className={`w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-display mb-4">How It <span className="text-accent">Works</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From 3D file to real-world deployment in under 30 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-primary/10 via-accent/30 to-primary/10 -z-10" />

            {[
              { step: "01", title: "Upload", icon: UploadCloud, desc: "Drop your 3D model file" },
              { step: "02", title: "Generate", icon: Cuboid, desc: "We process and host the file" },
              { step: "03", title: "Scan", icon: QrCode, desc: "Scan the QR code with phone" },
              { step: "04", title: "View AR", icon: Smartphone, desc: "Place object in your room" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-primary/30 relative group">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_10s_linear_infinite] group-hover:border-primary/60" />
                  <item.icon className="w-10 h-10 text-white group-hover:text-primary transition-colors" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold shadow-[0_0_10px_#bf00ff]">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
