"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/GlassCard";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  Chrome,
  ArrowLeft,
} from "lucide-react";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("كلمات المرور غير متطابقة");
        }
        if (password.length < 6) {
          throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        }
        await signUp(email, password);
      } else if (mode === "reset") {
        await resetPassword(email);
        setSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ ما";
      setError(translateFirebaseError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ ما";
      setError(translateFirebaseError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const translateFirebaseError = (error: string): string => {
    const errorMap: Record<string, string> = {
      "Firebase: Error (auth/email-already-in-use).": "هذا البريد الإلكتروني مستخدم بالفعل",
      "Firebase: Error (auth/invalid-email).": "البريد الإلكتروني غير صالح",
      "Firebase: Error (auth/user-not-found).": "لم يتم العثور على المستخدم",
      "Firebase: Error (auth/wrong-password).": "كلمة المرور غير صحيحة",
      "Firebase: Error (auth/weak-password).": "كلمة المرور ضعيفة جداً",
      "Firebase: Error (auth/invalid-credential).": "بيانات الدخول غير صحيحة",
      "Firebase: Error (auth/too-many-requests).": "محاولات كثيرة جداً، حاول لاحقاً",
      "Firebase: Error (auth/popup-closed-by-user).": "تم إغلاق نافذة تسجيل الدخول",
    };
    return errorMap[error] || error;
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <GlassCard className="w-full max-w-md p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              {mode === "login" && <LogIn className="w-8 h-8 text-white" />}
              {mode === "signup" && <UserPlus className="w-8 h-8 text-white" />}
              {mode === "reset" && <Mail className="w-8 h-8 text-white" />}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === "login" && "مرحباً بعودتك"}
              {mode === "signup" && "إنشاء حساب جديد"}
              {mode === "reset" && "إعادة تعيين كلمة المرور"}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === "login" && "سجل دخولك للوصول إلى لوحة التحكم"}
              {mode === "signup" && "أنشئ حسابك للبدء في استخدام النظام"}
              {mode === "reset" && "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"}
            </p>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30"
              >
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Password Input */}
            {mode !== "reset" && (
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === "signup" && (
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "تسجيل الدخول"}
                  {mode === "signup" && "إنشاء الحساب"}
                  {mode === "reset" && "إرسال رابط إعادة التعيين"}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          {mode !== "reset" && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">أو</span>
              </div>
            </div>
          )}

          {/* Google Sign In */}
          {mode !== "reset" && (
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5" />
              المتابعة باستخدام Google
            </motion.button>
          )}

          {/* Mode Switchers */}
          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
                <p className="text-gray-400 text-sm">
                  ليس لديك حساب؟{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    إنشاء حساب
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-gray-400 text-sm">
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
}
