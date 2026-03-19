import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="h-[70vh] w-full flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
          <AlertCircle className="w-24 h-24 text-destructive relative z-10" />
        </div>
        
        <h1 className="text-6xl font-display font-bold mb-4">404</h1>
        <h2 className="text-2xl text-white/80 mb-8">System offline or route not found.</h2>
        
        <Link 
          href="/" 
          className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all font-semibold"
        >
          Return to Hub
        </Link>
      </div>
    </Layout>
  );
}
