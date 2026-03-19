import { Link, useLocation } from "wouter";
import { Scan, LayoutDashboard, UploadCloud, LogOut, LogIn, UserPlus, Loader2, Zap } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";
  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-60"
          style={{ animation: "scanline 8s linear infinite" }}
        />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-2xl border-b border-white/[0.06]">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group outline-none shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/60 transition-all shadow-[0_0_12px_rgba(0,212,255,0.15)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.35)]">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider hidden sm:block">
              Scan<span className="text-primary">AR</span>
            </span>
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/pricing", label: "Pricing" },
              ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: auth controls */}
          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : user ? (
              <>
                <Link
                  href="/upload"
                  className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/upload")
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-primary/30"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload
                </Link>
                <Link
                  href="/pricing"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-accent border border-accent/25 bg-accent/[0.06] hover:bg-accent/[0.12] transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">{user.plan}</span>
                </Link>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary cursor-default">
                  {initials}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all hidden sm:flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_12px_rgba(0,212,255,0.25)] hover:shadow-[0_0_20px_rgba(191,0,255,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[68px] relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-black/30 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-40">
            <Scan className="w-5 h-5" />
            <span className="font-display font-semibold tracking-wider text-sm">ScanAR</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ScanAR Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
