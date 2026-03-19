import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useListModels } from "@/hooks/use-models";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  UploadCloud, Cuboid, Eye, Clock, User,
  Loader2, Plus, Scan
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: models, isLoading } = useListModels();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary font-display font-bold text-lg shadow-[0_0_18px_rgba(0,212,255,0.2)]">
              {initials}
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
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_0_14px_rgba(0,212,255,0.3)] hover:shadow-[0_0_22px_rgba(191,0,255,0.5)] hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Upload New Model
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Models", value: models?.length ?? "—", icon: Cuboid, color: "text-primary" },
            { label: "AR Experiences", value: models?.length ?? "—", icon: Scan, color: "text-accent" },
            { label: "Account Status", value: "Active", icon: User, color: "text-green-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Models list */}
        <div>
          <h2 className="text-lg font-display font-bold mb-5 flex items-center gap-2">
            <Cuboid className="w-5 h-5 text-primary" /> Your 3D Models
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : !models || models.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Cuboid className="w-10 h-10" />
              </div>
              <div>
                <p className="text-white/50 font-semibold mb-1">No models yet</p>
                <p className="text-white/30 text-sm">Upload your first .glb or .gltf file to get started</p>
              </div>
              <Link
                href="/upload"
                className="mt-2 px-5 py-2.5 rounded-xl border border-primary/40 text-primary text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 font-semibold"
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
                  className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-primary/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.08)] transition-all group"
                >
                  {/* Model preview placeholder */}
                  <div className="h-36 bg-[#0d0d14] relative flex items-center justify-center overflow-hidden">
                    <div
                      className="absolute inset-0 pointer-events-none opacity-50"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right,#80808010 1px,transparent 1px),linear-gradient(to bottom,#80808010 1px,transparent 1px)",
                        backgroundSize: "28px 28px",
                      }}
                    />
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center text-white/30 group-hover:text-primary/60 transition-colors">
                      <Cuboid className="w-8 h-8" />
                    </div>
                    {/* Format badge */}
                    <span className="absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white/40">
                      {model.filename.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate mb-1">{model.name}</h3>
                    <p className="text-xs text-muted-foreground truncate font-mono mb-4">{model.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {new Date(model.createdAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </div>
                    <Link
                      href={`/viewer/${model.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" /> Open in AR Viewer
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
