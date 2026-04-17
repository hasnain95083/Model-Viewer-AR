import { Link, useLocation } from "wouter";
import { Scan, LayoutDashboard, UploadCloud, LogOut, LogIn, UserPlus, Loader2, Zap, Menu, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";
  const isActive = (path: string) => location === path;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center shadow-sm group-hover:bg-lime-700 transition-colors">
              <Scan className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Scan<span className="text-lime-600">AR</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-lime-50 text-lime-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {loading ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            ) : user ? (
              <>
                <Link
                  href="/upload"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/upload")
                      ? "bg-lime-50 text-lime-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-lime-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{user.plan}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-lime-600 text-white hover:bg-lime-700 transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-lime-50 text-lime-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2">
              {user ? (
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  Sign Out
                </button>
              ) : (
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-lime-600 text-white text-center">
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-lime-600 flex items-center justify-center">
              <Scan className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm tracking-tight">ScanAR</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} ScanAR Platform</p>
        </div>
      </footer>
    </div>
  );
}
