import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Check, Zap, Loader2, Star, Infinity, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useUpgradePlan, PLAN_META } from "@/hooks/use-subscription";
import type { Plan } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const planOrder: Plan[] = ["free", "pro", "business"];
const planIcons = {
  free: Star,
  pro: Zap,
  business: Infinity,
} as const;

export default function PricingPage() {
  const { user } = useAuth();
  const { data: sub, isLoading: subLoading } = useSubscription();
  const upgradeMutation = useUpgradePlan();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleUpgrade = async (plan: Plan) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (plan === sub?.plan) return;

    try {
      await upgradeMutation.mutateAsync(plan);
      toast({
        title: plan === "free" ? "Downgraded to Free" : `Upgraded to ${PLAN_META[plan].label}!`,
        description:
          plan === "free"
            ? "Your plan has been changed to Free."
            : `You now have access to all ${PLAN_META[plan].label} features.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const currentPlan = sub?.plan ?? user?.plan ?? "free";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 mb-6">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">Simple Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Choose Your <span className="text-gradient">Plan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {planOrder.map((planKey, i) => {
            const meta = PLAN_META[planKey];
            const Icon = planIcons[planKey];
            const isCurrent = currentPlan === planKey;
            const isPending = upgradeMutation.isPending && upgradeMutation.variables === planKey;
            const isDowngrade =
              planOrder.indexOf(planKey) < planOrder.indexOf(currentPlan as Plan);

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border ${meta.border} ${meta.bg} ${meta.glow} flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Top accent line for pro/business */}
                {planKey !== "free" && (
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] ${
                      planKey === "pro"
                        ? "bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                        : "bg-gradient-to-r from-accent/0 via-accent to-accent/0"
                    }`}
                  />
                )}

                {/* Badge */}
                {meta.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,212,255,0.5)]">
                      {meta.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        planKey === "free"
                          ? "bg-white/5 border border-white/10 text-white/50"
                          : planKey === "pro"
                          ? "bg-primary/15 border border-primary/30 text-primary"
                          : "bg-accent/15 border border-accent/30 text-accent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-lg ${meta.color}`}>{meta.label}</h3>
                      <p className="text-xs text-muted-foreground">{meta.limit}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-7">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-display font-bold text-white">{meta.price}</span>
                      <span className="text-muted-foreground text-sm mb-1.5">{meta.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-7">
                    {meta.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-white/75">
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            planKey === "free"
                              ? "text-white/40"
                              : planKey === "pro"
                              ? "text-primary"
                              : "text-accent"
                          }`}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl border border-white/15 bg-white/5 text-center text-sm font-semibold text-white/50 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(planKey)}
                      disabled={isPending || (upgradeMutation.isPending && !isPending)}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        planKey === "free"
                          ? "border border-white/15 bg-white/5 hover:bg-white/10 text-white/70"
                          : planKey === "pro"
                          ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-accent text-primary-foreground shadow-[0_0_16px_rgba(0,212,255,0.3)] hover:shadow-[0_0_24px_rgba(191,0,255,0.4)] hover:-translate-y-0.5"
                          : "bg-gradient-to-r from-accent/80 to-accent hover:from-accent hover:to-primary text-white shadow-[0_0_16px_rgba(191,0,255,0.3)] hover:shadow-[0_0_24px_rgba(0,212,255,0.4)] hover:-translate-y-0.5"
                      }`}
                    >
                      {isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      ) : isDowngrade ? (
                        "Downgrade"
                      ) : !user ? (
                        "Get Started"
                      ) : (
                        `Upgrade to ${meta.label}`
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-sm mt-10"
        >
          Payments are simulated for demo purposes. Plan changes take effect immediately.
        </motion.p>
      </div>
    </Layout>
  );
}
