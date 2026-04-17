import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Check, Zap, Loader2, Star, Infinity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useUpgradePlan, PLAN_META } from "@/hooks/use-subscription";
import type { Plan } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const planOrder: Plan[] = ["free", "pro", "business"];
const planIcons = { free: Star, pro: Zap, business: Infinity } as const;

export default function PricingPage() {
  const { user } = useAuth();
  const { data: sub } = useSubscription();
  const upgradeMutation = useUpgradePlan();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const currentPlan = sub?.plan ?? user?.plan ?? "free";

  const handleUpgrade = async (plan: Plan) => {
    if (!user) { navigate("/signup"); return; }
    if (plan === currentPlan) return;
    try {
      await upgradeMutation.mutateAsync(plan);
      toast({
        title: plan === "free" ? "Downgraded to Free" : `Upgraded to ${PLAN_META[plan].label}!`,
        description: plan === "free" ? "Your plan has been changed." : `You now have ${PLAN_META[plan].limit} uploads.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="section-label mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {planOrder.map((planKey, i) => {
            const meta = PLAN_META[planKey];
            const Icon = planIcons[planKey];
            const isCurrent = currentPlan === planKey;
            const isPro = planKey === "pro";
            const isPending = upgradeMutation.isPending && upgradeMutation.variables === planKey;
            const isDowngrade = planOrder.indexOf(planKey) < planOrder.indexOf(currentPlan as Plan);

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex flex-col rounded-2xl border ${
                  isPro
                    ? "border-lime-500 shadow-lg shadow-lime-100"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                } bg-white transition-all duration-200 hover:-translate-y-0.5 overflow-hidden`}
              >
                {isPro && (
                  <div className="bg-lime-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      planKey === "free" ? "bg-slate-50 border-slate-200 text-slate-500" :
                      planKey === "pro" ? "bg-lime-50 border-lime-200 text-lime-600" :
                      "bg-slate-900 border-slate-800 text-white"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{meta.label}</h3>
                      <p className="text-xs text-slate-500">{meta.limit}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">{meta.price}</span>
                      <span className="text-slate-400 text-sm mb-1.5">{meta.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {meta.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Check className={`w-4 h-4 shrink-0 ${isPro ? "text-lime-500" : "text-slate-400"}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-slate-400 border border-slate-200 bg-slate-50 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(planKey)}
                      disabled={isPending || (upgradeMutation.isPending && !isPending)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        isPro
                          ? "bg-lime-600 text-white hover:bg-lime-700 shadow-sm"
                          : planKey === "business"
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      ) : isDowngrade ? "Downgrade" : !user ? "Get Started" : `Upgrade to ${meta.label}`}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          Payments are simulated for demo purposes. Plan changes take effect immediately.
        </p>
      </div>
    </Layout>
  );
}
