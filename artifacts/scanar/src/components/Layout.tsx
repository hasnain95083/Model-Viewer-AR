import { Link, useLocation } from "wouter";
import { Scan, LayoutDashboard, UploadCloud, LogOut, LogIn, UserPlus, Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

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

          <nav className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Model</span>
                </Link>
                {/* User avatar + logout */}
                <div className="flex items-center gap-2 pl-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary">
                    {initials}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-2 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_12px_rgba(0,212,255,0.3)] hover:shadow-[0_0_20px_rgba(191,0,255,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Sign Up Free
                </Link>
              </>
            )}
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
