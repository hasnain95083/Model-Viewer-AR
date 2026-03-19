import { Link } from "wouter";
import { Box, Scan } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b-white/5 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group outline-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Scan className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wider text-white group-hover:text-primary transition-colors">
              Scan<span className="text-primary">AR</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/upload" 
              className="px-6 py-2.5 rounded-full font-semibold text-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Upload Model
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <Box className="w-6 h-6" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Scan className="w-5 h-5" />
            <span className="font-display font-semibold tracking-wider">ScanAR</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ScanAR Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
