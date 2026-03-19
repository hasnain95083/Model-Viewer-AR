import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useListModels } from "@/hooks/use-models";
import { useSubscription, useUpgradePlan, PLAN_META } from "@/hooks/use-subscription";
import type { Plan } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloud, Cuboid, Eye, Clock, User,
  Loader2, Plus, Zap, ArrowRight, Infinity,
  TrendingUp, Star
} from "lucide-react";

const planIcons: Record<Plan, typeof Star> = {
  free: Star,
  pro: Zap,
  business: Infinity,
};

const planColors: Record<Plan, string> = {
  free: "text-white/50",
  pro: "text-primary",
  business: "text-accent",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: models, isLoading: modelsLoading } = useListModels();
  const { data: sub, isLoading: subLoading } = useSubscription();
  const upgradeMutation = useUpgradePlan();
  const { toast } = useToast();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";
  const plan = (sub?.plan ?? user?.plan ?? "free") as Plan;
  const PlanIcon = planIcons[plan];
  const planMeta = PLAN_META[plan];
  const modelCount = sub?.modelCount ?? 0;
  const limit = sub?.limit ?? 1;
  const progressPct = limit === -1 ? 100 : Math.min((modelCount / limit) * 100, 100);
  const isAtLimit = sub ? !sub.canUpload : false;

  const handleQuickUpgrade = async () => {
    const nextPlan: Plan = plan === "free" ? "pro" : "business";
    try {
      await upgradeMutation.mutateAsync(nextPlan);
      toast({
        title: `Upgraded to ${PLAN_META[nextPlan].label}!`,
        description: `You now have ${PLAN_META[nextPlan].limit} uploads.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary font-display font-bold text-lg shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                {initials}
              </div>
              <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${planColors[plan]} bg-card`}>
                <PlanIcon className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          <Link
            href="/upload"
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-[0_0_14px_rgba(0,212,255,0.3)] hover:shadow-[0_0_22px_rgba(191,0,255,0.5)] hover:-translate-y-0.5 transition-all ${
              isAtLimit
                ? "bg-white/5 border border-white/15 text-white/40 cursor-not-allowed pointer-events-none"
                : "bg-gradient-to-r from-primary to-accent text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAtLimit ? "Limit Reached" : "Upload New Model"}
          </Link>
        </motion.div>

        {/* Stats + Plan row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

          {/* Stats */}
          {[
            { label: "Models Uploaded", value: subLoading ? "—" : modelCount, icon: Cuboid, color: "text-primary" },
            { label: "AR Experiences", value: subLoading ? "—" : modelCount, icon: TrendingUp, color: "text-accent" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-white/20 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color} shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}

          {/* Plan card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border ${planMeta.border} ${planMeta.bg} p-5 relative overflow-hidden hover:${planMeta.glow} transition-all`}
          >
            {plan !== "free" && (
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${
                plan === "pro"
                  ? "bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                  : "bg-gradient-to-r from-accent/0 via-accent to-accent/0"
              }`} />
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PlanIcon className={`w-4 h-4 ${planColors[plan]}`} />
                <span className={`font-display font-bold text-sm ${planColors[plan]}`}>
                  {planMeta.label} Plan
                </span>
              </div>
              <Link
                href="/pricing"
                className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
              >
                See plans <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Usage bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Models used</span>
                <span className={`font-mono ${isAtLimit ? "text-red-400" : ""}`}>
                  {subLoading ? "…" : limit === -1 ? `${modelCount} / ∞` : `${modelCount} / ${limit}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    isAtLimit ? "bg-red-400" : plan === "pro" ? "bg-primary" : plan === "business" ? "bg-accent" : "bg-white/40"
                  }`}
                />
              </div>
            </div>

            {/* Upgrade CTA */}
            {plan !== "business" && (
              <button
                onClick={handleQuickUpgrade}
                disabled={upgradeMutation.isPending}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  plan === "free"
                    ? "bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25"
                    : "bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25"
                }`}
              >
                {upgradeMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Upgrade to {plan === "free" ? "Pro" : "Business"}
              </button>
            )}
            {plan === "business" && (
              <div className="w-full py-2 rounded-xl text-xs font-bold text-accent/60 text-center border border-accent/20 bg-accent/5">
                ∞ Unlimited uploads active
              </div>
            )}
          </motion.div>
        </div>

        {/* Limit warning banner */}
        {isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 font-semibold text-sm">Upload limit reached</p>
              <p className="text-amber-400/70 text-xs">
                You've used all {limit} model{limit === 1 ? "" : "s"} on the {planMeta.label} plan.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Upgrade
            </Link>
          </motion.div>
        )}

        {/* Models grid */}
        <div>
          <h2 className="text-base font-display font-bold mb-5 flex items-center gap-2 text-white/80">
            <Cuboid className="w-4 h-4 text-primary" /> Your 3D Models
          </h2>

          {modelsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : !models || models.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Cuboid className="w-10 h-10" />
              </div>
              <div>
                <p className="text-white/40 font-semibold mb-1">No models uploaded yet</p>
                <p className="text-white/25 text-sm">Drop your first .glb or .gltf to get started</p>
              </div>
              <Link
                href="/upload"
                className="mt-2 px-5 py-2.5 rounded-xl border border-primary/40 text-primary text-sm hover:bg-primary/10 transition-all flex items-center gap-2 font-semibold shadow-[0_0_12px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              >
                <UploadCloud className="w-4 h-4" /> Upload First Model
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {models.map((model, i) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-primary/30 hover:shadow-[0_0_25px_rgba(0,212,255,0.07)] transition-all group cursor-default"
                >
                  {/* Preview area */}
                  <div className="h-36 bg-[#0a0a12] relative flex items-center justify-center overflow-hidden">
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right,#80808012 1px,transparent 1px),linear-gradient(to bottom,#80808012 1px,transparent 1px)",
                        backgroundSize: "28px 28px",
                      }}
                    />
                    {/* Scanline overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center text-white/25 group-hover:text-primary/70 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all">
                      <Cuboid className="w-7 h-7" />
                    </div>
                    <span className="absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white/40">
                      {model.filename.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate mb-0.5 group-hover:text-primary/90 transition-colors">{model.name}</h3>
                    <p className="text-xs text-muted-foreground truncate font-mono mb-3">{model.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {new Date(model.createdAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </div>
                    <Link
                      href={`/viewer/${model.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_14px_rgba(0,212,255,0.25)] transition-all text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" /> Open AR Viewer
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
