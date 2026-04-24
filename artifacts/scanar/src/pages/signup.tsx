import { useState, useMemo, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, UserPlus, Loader2, AlertCircle, Scan, CheckCircle2, ArrowLeft, Check, X, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordChecks {
  length: boolean;
  number: boolean;
  special: boolean;
}

function evaluatePassword(pw: string): { checks: PasswordChecks; score: number; level: "weak" | "medium" | "strong" | null } {
  const checks: PasswordChecks = {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  if (pw.length === 0) return { checks, score: 0, level: null };
  const level: "weak" | "medium" | "strong" =
    score < 2 ? "weak" : score < 3 ? "medium" : "strong";
  return { checks, score, level };
}

export default function SignupPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [emailDelivered, setEmailDelivered] = useState<boolean>(true);

  const { checks, level: pwLevel } = useMemo(() => evaluatePassword(password), [password]);
  const allRequirementsMet = checks.length && checks.number && checks.special;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Invalid email address"); return; }
    if (!password) { setError("Password is required"); return; }
    if (!checks.length) { setError("Password must be at least 8 characters"); return; }
    if (!checks.number) { setError("Password must contain at least one number"); return; }
    if (!checks.special) { setError("Password must contain at least one special character (e.g. ! @ # $ %)"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const result = await register(email.trim(), password);
      setPendingEmail(result.email);
      setEmailDelivered(result.emailDelivered);
      if (!result.emailDelivered && result.deliveryError) {
        // Surface the underlying delivery problem to the browser console for
        // local diagnosis without blocking the user.
        console.warn(
          "[signup] Verification email could not be delivered:",
          result.deliveryError,
        );
      }
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // After successful signup, void the form & show "check your email" state
  void navigate;

  const submitDisabled = loading || !allRequirementsMet || password !== confirm || !email.trim();

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

          {pendingEmail ? (
            emailDelivered ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
                data-testid="signup-success"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-600">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h1>
                <p className="text-slate-500 text-sm mb-1">
                  We sent a verification link to
                </p>
                <p className="font-semibold text-slate-900 mb-5 break-all">{pendingEmail}</p>
                <div className="rounded-xl bg-lime-50 border border-lime-200 p-4 text-left text-sm text-lime-800 mb-6">
                  Please check your email and verify your account before logging in. The link will expire in 24 hours.
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Didn't get it? Check your spam folder, or wait a minute and try signing up again with the same email if it never arrives.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back to sign in
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
                data-testid="signup-success-no-email"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Account created</h1>
                <p className="text-slate-500 text-sm mb-1">
                  Your account was created for
                </p>
                <p className="font-semibold text-slate-900 mb-5 break-all">{pendingEmail}</p>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-left text-sm text-amber-800 mb-6">
                  Account created. If you did not receive a verification email, please contact support.
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  We were unable to send the verification email automatically. Your account is saved — once verification is completed, you'll be able to sign in.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back to sign in
                </Link>
              </motion.div>
            )
          ) : (<>
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
                  placeholder="Min. 8 chars, 1 number, 1 symbol" autoComplete="new-password" className="input-field pl-10" />
              </div>
              <AnimatePresence>
                {pwLevel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[0, 1, 2].map((i) => {
                        const active =
                          pwLevel === "weak" ? i === 0 :
                          pwLevel === "medium" ? i <= 1 : true;
                        const color =
                          pwLevel === "weak" ? "bg-red-400" :
                          pwLevel === "medium" ? "bg-amber-400" : "bg-lime-500";
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${active ? color : "bg-slate-200"}`}
                          />
                        );
                      })}
                      <span
                        className={`text-xs font-medium ml-1 capitalize ${
                          pwLevel === "weak" ? "text-red-500" :
                          pwLevel === "medium" ? "text-amber-500" : "text-lime-600"
                        }`}
                        data-testid="password-strength"
                      >
                        {pwLevel}
                      </span>
                    </div>

                    <ul className="mt-2 space-y-1 text-xs">
                      {[
                        { ok: checks.length, label: "At least 8 characters" },
                        { ok: checks.number, label: "Contains a number" },
                        { ok: checks.special, label: "Contains a special character (! @ # $ %)" },
                      ].map((req) => (
                        <li key={req.label} className="flex items-center gap-1.5">
                          {req.ok ? (
                            <Check className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className={req.ok ? "text-lime-700" : "text-slate-500"}>
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
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

            <button type="submit" disabled={submitDisabled} data-testid="signup-submit"
              className="w-full py-2.5 rounded-xl font-semibold bg-lime-600 text-white hover:bg-lime-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700 transition-colors">Sign in</Link>
          </p>
          </>)}
        </motion.div>
      </div>
    </div>
  );
}
