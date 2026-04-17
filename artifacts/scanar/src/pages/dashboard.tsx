import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useListModels } from "@/hooks/use-models";
import { useSubscription, useUpgradePlan, PLAN_META } from "@/hooks/use-subscription";
import type { Plan } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Cuboid, Eye, Clock, Loader2, Plus, Zap, ArrowRight, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: models, isLoading: modelsLoading } = useListModels();
  const { data: sub, isLoading: subLoading } = useSubscription();
  const upgradeMutation = useUpgradePlan();
  const { toast } = useToast();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";
  const plan = (sub?.plan ?? user?.plan ?? "free") as Plan;
  const planMeta = PLAN_META[plan];
  const modelCount = sub?.modelCount ?? 0;
  const limit = sub?.limit ?? 1;
  const progressPct = limit === -1 ? 100 : Math.min((modelCount / limit) * 100, 100);
  const isAtLimit = sub ? !sub.canUpload : false;

  const handleQuickUpgrade = async () => {
    const nextPlan: Plan = plan === "free" ? "pro" : "business";
    try {
      await upgradeMutation.mutateAsync(nextPlan);
      toast({ title: `Upgraded to ${PLAN_META[nextPlan].label}!`, description: `You now have ${PLAN_META[nextPlan].limit} uploads.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-lime-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/upload"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              isAtLimit
                ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                : "bg-lime-600 text-white hover:bg-lime-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAtLimit ? "Limit Reached" : "Upload Model"}
          </Link>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Models */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
              <Cuboid className="w-5 h-5 text-lime-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{subLoading ? "—" : modelCount}</p>
              <p className="text-xs text-slate-500">Models Uploaded</p>
            </div>
          </motion.div>

          {/* AR Experiences */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{subLoading ? "—" : modelCount}</p>
              <p className="text-xs text-slate-500">AR Experiences</p>
            </div>
          </motion.div>

          {/* Plan card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  plan === "free" ? "bg-slate-100 text-slate-600" :
                  plan === "pro" ? "bg-lime-100 text-lime-700" :
                  "bg-slate-900 text-white"
                }`}>{planMeta.label}</span>
                <span className="text-xs text-slate-400">Plan</span>
              </div>
              <Link href="/pricing" className="text-xs text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-0.5">
                Plans <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mb-2.5">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Usage</span>
                <span className={`font-mono font-semibold ${isAtLimit ? "text-red-500" : "text-slate-700"}`}>
                  {subLoading ? "…" : limit === -1 ? `${modelCount} / ∞` : `${modelCount} / ${limit}`}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className={`h-full rounded-full ${isAtLimit ? "bg-red-400" : plan === "pro" ? "bg-lime-500" : plan === "business" ? "bg-emerald-500" : "bg-slate-400"}`}
                />
              </div>
            </div>
            {plan !== "business" && (
              <button onClick={handleQuickUpgrade} disabled={upgradeMutation.isPending}
                className="w-full py-1.5 rounded-lg text-xs font-semibold bg-lime-50 border border-lime-200 text-lime-700 hover:bg-lime-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {upgradeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Upgrade to {plan === "free" ? "Pro" : "Business"}
              </button>
            )}
          </motion.div>
        </div>

        {/* Limit warning */}
        {isAtLimit && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Upload limit reached</p>
              <p className="text-xs text-amber-600">You've used all {limit} upload{limit === 1 ? "" : "s"} on the {planMeta.label} plan.</p>
            </div>
            <Link href="/pricing" className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors whitespace-nowrap">
              Upgrade Now
            </Link>
          </motion.div>
        )}

        {/* Models grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Cuboid className="w-4 h-4" /> Your Models
          </h2>

          {modelsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : !models || models.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-16 gap-4 text-center bg-white"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Cuboid className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-1">No models yet</p>
                <p className="text-sm text-slate-400">Upload your first .glb or .gltf to get started</p>
              </div>
              <Link href="/upload" className="btn-primary flex items-center gap-2 text-sm">
                <UploadCloud className="w-4 h-4" /> Upload First Model
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {models.map((model, i) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="card overflow-hidden group hover:shadow-md transition-all duration-200"
                >
                  {/* Preview */}
                  <div className="h-32 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 dot-bg opacity-50" />
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-lime-500 group-hover:border-lime-200 transition-all shadow-sm">
                      <Cuboid className="w-6 h-6" />
                    </div>
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 shadow-sm">
                      {model.filename.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate text-sm mb-0.5 group-hover:text-lime-700 transition-colors">{model.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                      <Clock className="w-3 h-3 shrink-0" />
                      {new Date(model.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <Link
                      href={`/viewer/${model.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700 transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> Open AR Viewer
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
