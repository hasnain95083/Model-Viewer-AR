import { useState, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, UserPlus, Loader2, AlertCircle, Scan, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? null : password.length < 6 ? "weak" : password.length < 10 ? "fair" : "strong";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Email is required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address"); return; }
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <Scan className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wider">
              Scan<span className="text-primary">AR</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold mb-2">Create account</h1>
          <p className="text-muted-foreground text-sm">Start building AR experiences for free</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
              </div>
              {/* Strength indicator */}
              {passwordStrength && (
                <div className="flex gap-1 mt-1.5">
                  {["weak", "fair", "strong"].map((level, i) => {
                    const active = passwordStrength === "weak" ? i === 0 : passwordStrength === "fair" ? i <= 1 : true;
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          active
                            ? passwordStrength === "weak" ? "bg-red-400" : passwordStrength === "fair" ? "bg-yellow-400" : "bg-green-400"
                            : "bg-white/10"
                        }`}
                      />
                    );
                  })}
                  <span className={`text-xs ml-1 ${passwordStrength === "weak" ? "text-red-400" : passwordStrength === "fair" ? "text-yellow-400" : "text-green-400"}`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
                {confirm && password === confirm && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_0_16px_rgba(0,212,255,0.35)] hover:shadow-[0_0_24px_rgba(191,0,255,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
