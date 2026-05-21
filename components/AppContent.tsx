"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DynamicBackground } from "@/components/DynamicBackground";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DynamicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-white text-lg font-medium">جاري التحميل...</p>
          </motion.div>
        </div>
      </DynamicBackground>
    );
  }

  if (!user) {
    return (
      <DynamicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <AuthForm />
        </div>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground>
      <Dashboard />
    </DynamicBackground>
  );
}
