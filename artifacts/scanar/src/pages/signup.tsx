import { useState, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, UserPlus, Loader2, AlertCircle, Scan, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pwStrength = password.length === 0 ? null : password.length < 6 ? "weak" : password.length < 10 ? "fair" : "strong";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Invalid email address"); return; }
    if (!password) { setError("Password is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register(email.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20 pointer-events-none" />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center">
            <Scan className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">ScanAR</span>
        </Link>
        <div className="relative z-10 space-y-4 max-w-xs">
          {[
            "Upload .glb and .gltf models instantly",
            "Generate AR experiences with one click",
            "Share via QR code — no app needed",
            "Works on iOS, Android, and desktop",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
              <span className="text-slate-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs relative z-10">&copy; {new Date().getFullYear()} ScanAR Platform</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
        <Link href="/" className="group absolute top-6 left-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm mx-auto"
        >
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center">
              <Scan className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">ScanAR</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-7">Start building AR experiences for free</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email" className="input-field pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" autoComplete="new-password" className="input-field pl-10" />
              </div>
              {pwStrength && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {["weak", "fair", "strong"].map((lv, i) => {
                    const active = pwStrength === "weak" ? i === 0 : pwStrength === "fair" ? i <= 1 : true;
                    return <div key={lv} className={`h-1 flex-1 rounded-full transition-all ${active ? pwStrength === "weak" ? "bg-red-400" : pwStrength === "fair" ? "bg-amber-400" : "bg-lime-500" : "bg-slate-200"}`} />;
                  })}
                  <span className={`text-xs font-medium ml-1 ${pwStrength === "weak" ? "text-red-500" : pwStrength === "fair" ? "text-amber-500" : "text-lime-600"}`}>{pwStrength}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password" className="input-field pl-10 pr-10" />
                {confirm && password === confirm && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500 pointer-events-none" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold bg-lime-600 text-white hover:bg-lime-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
