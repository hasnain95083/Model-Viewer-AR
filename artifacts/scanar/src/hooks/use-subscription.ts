import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Plan } from "@/contexts/AuthContext";

export interface SubscriptionInfo {
  plan: Plan;
  modelCount: number;
  limit: number;
  canUpload: boolean;
}

async function fetchSubscription(): Promise<SubscriptionInfo> {
  const res = await fetch("/api/subscription", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
}

async function upgradePlan(plan: Plan): Promise<SubscriptionInfo> {
  const res = await fetch("/api/subscription/upgrade", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to upgrade plan");
  }
  return res.json();
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    retry: false,
    staleTime: 30_000,
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upgradePlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["models"] });
    },
  });
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 1,
  pro: 10,
  business: -1,
};

export const PLAN_META = {
  free: {
    label: "Free",
    price: "$0",
    period: "forever",
    limit: "1 model",
    color: "text-white/60",
    border: "border-white/10",
    bg: "bg-white/[0.02]",
    glow: "",
    badge: null,
    features: [
      "1 model upload",
      "AR viewer link",
      "QR code generation",
      "Basic support",
    ],
  },
  pro: {
    label: "Pro",
    price: "$12",
    period: "/ month",
    limit: "10 models",
    color: "text-primary",
    border: "border-primary/40",
    bg: "bg-primary/[0.04]",
    glow: "shadow-[0_0_40px_rgba(0,212,255,0.15)]",
    badge: "Most Popular",
    features: [
      "10 model uploads",
      "AR viewer link",
      "QR code generation",
      "Priority support",
      "Custom branding",
    ],
  },
  business: {
    label: "Business",
    price: "$49",
    period: "/ month",
    limit: "Unlimited models",
    color: "text-accent",
    border: "border-accent/40",
    bg: "bg-accent/[0.03]",
    glow: "shadow-[0_0_40px_rgba(191,0,255,0.12)]",
    badge: null,
    features: [
      "Unlimited model uploads",
      "AR viewer link",
      "QR code generation",
      "24/7 priority support",
      "Custom branding",
      "Team collaboration",
      "Analytics dashboard",
    ],
  },
} as const;
