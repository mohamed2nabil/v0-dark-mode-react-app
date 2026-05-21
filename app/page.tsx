"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  MessageSquare,
  Database,
  Clock,
  Settings,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Eye,
  EyeOff,
  Rocket,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

type TabType = "dashboard" | "whatsapp" | "scraper" | "logs";
type TerminalLog = { id: number; message: string; type: "info" | "success" | "error" };

// Login Component
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const errorMessages: Record<string, string> = {
        "auth/invalid-email": "البريد الإلكتروني غير صالح",
        "auth/user-not-found": "المستخدم غير موجود",
        "auth/wrong-password": "كلمة المرور غير صحيحة",
        "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
        "auth/weak-password": "كلمة المرور ضعيفة جداً",
        "auth/invalid-credential": "بيانات الدخول غير صحيحة",
      };
      setError(errorMessages[firebaseError.code || ""] || "حدث خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <img src="https://i.postimg.cc/kg5HnPT7/logo.png" alt="Logo" className="h-16 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="text-white/50 text-center mb-8">{isSignUp ? "أنشئ حسابك للبدء" : "مرحباً بعودتك"}</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="example@email.com"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                "إنشاء الحساب"
              ) : (
                "دخول"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              {isSignUp ? "لديك حساب؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ واحداً"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main Dashboard
function Dashboard({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("whatsapp");
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const addLog = (message: string, type: TerminalLog["type"]) => {
    setTerminalLogs((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "لوحة التحكم", icon: <LayoutGrid size={20} /> },
    { id: "whatsapp", label: "حملة واتساب", icon: <MessageSquare size={20} /> },
    { id: "scraper", label: "استخراج البيانات", icon: <Database size={20} /> },
    { id: "logs", label: "سجل العمليات", icon: <Clock size={20} /> },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col fixed right-0 top-0">
        <div className="p-6 border-b border-white/10">
          <img src="https://i.postimg.cc/kg5HnPT7/logo.png" alt="Logo" className="h-10 object-contain mx-auto" />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <User size={20} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">المدير</p>
              <p className="text-white/50 text-xs truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} className="text-white/50 hover:text-red-400 transition-colors" title="تسجيل الخروج">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 mr-64 flex flex-col"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Background Transition */}
        <div
          className="fixed inset-0 transition-opacity duration-500 bg-cover bg-center bg-no-repeat -z-20"
          style={{ backgroundImage: `url('https://i.postimg.cc/SxwnykmF/dark.jpg')`, opacity: isHovering ? 0 : 1 }}
        />
        <div
          className="fixed inset-0 transition-opacity duration-500 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url('https://i.postimg.cc/SRDXq9KS/light.jpg')`, opacity: isHovering ? 1 : 0 }}
        />

        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">إدارة المهام الذكية</h1>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <button className="text-white/60 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                {(activeTab === "whatsapp" || activeTab === "scraper") && (
                  <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-4">
                    <button
                      onClick={() => setActiveTab("whatsapp")}
                      className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                        activeTab === "whatsapp" ? "border-emerald-500 text-white" : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      <MessageSquare size={18} />
                      حملة إرسال واتساب
                    </button>
                    <button
                      onClick={() => setActiveTab("scraper")}
                      className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                        activeTab === "scraper" ? "border-emerald-500 text-white" : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      <Search size={18} />
                      استخراج بيانات الشركات
                    </button>
                  </div>
                )}

                {activeTab === "dashboard" && <DashboardContent />}
                {activeTab === "whatsapp" && <WhatsAppForm addLog={addLog} />}
                {activeTab === "scraper" && <ScraperForm addLog={addLog} />}
                {activeTab === "logs" && <LogsContent logs={terminalLogs} />}
              </div>

              {(activeTab === "whatsapp" || activeTab === "scraper") && <Terminal logs={terminalLogs} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function DashboardContent() {
  const stats = [
    { label: "الرسائل المرسلة", value: "12,847", change: "+12%" },
    { label: "الشركات المستخرجة", value: "3,291", change: "+8%" },
    { label: "نسبة النجاح", value: "94.2%", change: "+2%" },
    { label: "العمليات النشطة", value: "7", change: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <p className="text-white/50 text-sm mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              {stat.change && <span className="text-emerald-400 text-sm">{stat.change}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppForm({ addLog }: { addLog: (msg: string, type: TerminalLog["type"]) => void }) {
  const [formData, setFormData] = useState({ sendCount: "30", managerName: "", phoneNumber: "+201145252173", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog("جاري إرسال الحملة...", "info");

    try {
      const response = await fetch("https://n8n.an8n.store/webhook/sender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      addLog(response.ok ? "تم إرسال الحملة بنجاح!" : "فشل في إرسال الحملة", response.ok ? "success" : "error");
    } catch {
      addLog("خطأ في الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">حجم الإرسال</label>
          <input
            type="number"
            value={formData.sendCount}
            onChange={(e) => setFormData({ ...formData, sendCount: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">اسم المسؤول</label>
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="أستاذ محمد"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">رقم الموبايل المُرسِل</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="+201145252173"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">نص الرسالة</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
          placeholder="اكتب رسالتك هنا..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
      >
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Rocket size={18} />إطلاق الحملة</>}
      </button>
    </form>
  );
}

function ScraperForm({ addLog }: { addLog: (msg: string, type: TerminalLog["type"]) => void }) {
  const [formData, setFormData] = useState({ activity: "", city: "" });
  const [loading, setLoading] = useState(false);
  
  const cities = [
    "القاهرة",
    "الإسكندرية", 
    "الجيزة",
    "شرم الشيخ",
    "الأقصر",
    "أسوان",
    "المنصورة",
    "طنطا",
    "الزقازيق",
    "بورسعيد",
    "السويس",
    "دمياط",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog("جاري استخراج البيانات...", "info");

    try {
      const response = await fetch("https://n8n.an8n.store/webhook/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      addLog(response.ok ? "تم استخراج البيانات بنجاح!" : "فشل في استخراج البيانات", response.ok ? "success" : "error");
    } catch {
      addLog("خطأ في الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">النشاط <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="شركة مقاولات"
            required
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">المدينة <span className="text-red-400">*</span></label>
          <div className="relative">
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
              required
            >
              <option value="" disabled className="bg-gray-900">اختر المدينة...</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-gray-900">{city}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
      >
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={18} />بدء الاستخراج</>}
      </button>
    </form>
  );
}

function LogsContent({ logs }: { logs: TerminalLog[] }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">سجل جميع العمليات</h3>
      {logs.length === 0 ? (
        <p className="text-white/50 text-center py-8">لا توجد عمليات مسجلة بعد</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                log.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : log.type === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-white/5 border border-white/10"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${log.type === "success" ? "bg-emerald-500" : log.type === "error" ? "bg-red-500" : "bg-white/50"}`} />
              <span className={log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-400" : "text-white/70"}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Terminal({ logs }: { logs: TerminalLog[] }) {
  return (
    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button className="text-white/50 text-xs bg-white/5 px-3 py-1 rounded hover:bg-white/10 transition-colors">Clear Console</button>
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm font-medium">LIVE RESPONSE TERMINAL</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="h-48 p-4 font-mono text-sm overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-white/50 text-center">...System initialized. Ready for operations</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`mb-2 ${log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-400" : "text-white/70"}`}>
              <span className="text-white/30">[{new Date().toLocaleTimeString("ar-EG")}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: `url('https://i.postimg.cc/SxwnykmF/dark.jpg')`, backgroundSize: "cover" }}>
        <div className="w-10 h-10 border-4 border-white/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      {!user ? (
        <>
          <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: `url('https://i.postimg.cc/SxwnykmF/dark.jpg')` }} />
          <LoginScreen />
        </>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
