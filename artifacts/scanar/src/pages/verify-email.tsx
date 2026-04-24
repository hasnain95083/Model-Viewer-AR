import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Scan, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [, navigate] = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided in the link.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error ?? `Verification failed (${res.status})`);
          return;
        }

        // Refresh the auth context so the user is now logged in
        await refreshUser();
        if (cancelled) return;
        setStatus("success");

        // Redirect to dashboard after a short delay so the user sees the success state
        setTimeout(() => {
          if (!cancelled) navigate("/dashboard");
        }, 1800);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Verification failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center">
            <Scan className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">ScanAR</span>
        </Link>

        {status === "verifying" && (
          <div data-testid="verify-loading">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Verifying your email…</h1>
            <p className="text-sm text-slate-500">Just a moment while we confirm your account.</p>
          </div>
        )}

        {status === "success" && (
          <div data-testid="verify-success">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Email verified!</h1>
            <p className="text-sm text-slate-500 mb-6">Your account is active. Taking you to your dashboard…</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-lime-600 text-white hover:bg-lime-700 transition-colors"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div data-testid="verify-error">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
              <XCircle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Verification failed</h1>
            <p className="text-sm text-slate-500 mb-6">{errorMessage}</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl font-semibold bg-lime-600 text-white hover:bg-lime-700 transition-colors"
            >
              Sign up again
            </Link>
            <Link
              href="/login"
              className="block mt-3 text-sm text-slate-500 hover:text-slate-900"
            >
              Or go to sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
