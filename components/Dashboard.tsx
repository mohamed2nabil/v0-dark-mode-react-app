"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/GlassCard";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Shield,
  Clock,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const stats = [
  {
    title: "المستخدمين النشطين",
    value: "2,847",
    change: "+12.5%",
    icon: Users,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "الإيرادات",
    value: "$45,231",
    change: "+8.2%",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "الطلبات",
    value: "1,234",
    change: "+23.1%",
    icon: Activity,
    color: "from-purple-500 to-violet-600",
  },
  {
    title: "معدل التحويل",
    value: "4.6%",
    change: "+1.2%",
    icon: Zap,
    color: "from-orange-500 to-red-600",
  },
];

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", active: true },
  { icon: Users, label: "المستخدمين", active: false },
  { icon: BarChart3, label: "التقارير", active: false },
  { icon: Globe, label: "الأتمتة", active: false },
  { icon: Shield, label: "الأمان", active: false },
  { icon: Settings, label: "الإعدادات", active: false },
];

const recentActivities = [
  { id: 1, action: "تم إضافة مستخدم جديد", user: "أحمد محمد", time: "منذ 5 دقائق" },
  { id: 2, action: "تم تحديث النظام", user: "النظام", time: "منذ 15 دقيقة" },
  { id: 3, action: "تم إنشاء تقرير جديد", user: "سارة أحمد", time: "منذ 30 دقيقة" },
  { id: 4, action: "تم تفعيل الأتمتة", user: "محمد علي", time: "منذ ساعة" },
  { id: 5, action: "تم تحديث الإعدادات", user: "فاطمة حسن", time: "منذ ساعتين" },
];

export function Dashboard() {
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 100 }}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 backdrop-blur-xl bg-white/5 border-l border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">مركز التحكم</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active
                    ? "bg-gradient-to-l from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.active && <ChevronLeft className="w-4 h-4 mr-auto" />}
              </motion.button>
            ))}
          </nav>

          {/* User Info */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {user?.displayName || "المستخدم"}
                </p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">تسجيل الخروج</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">مرحباً بك 👋</h1>
              <p className="text-gray-400 text-sm mt-1">إليك ملخص نشاطك اليوم</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 bg-white/5 border border-white/10 rounded-xl py-2 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <GlassCard className="p-5 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-medium bg-green-500/20 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Chart Placeholder */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <GlassCard className="p-5 lg:p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">نظرة عامة على الأداء</h2>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 text-sm focus:outline-none focus:border-cyan-500/50">
                  <option>آخر 7 أيام</option>
                  <option>آخر 30 يوم</option>
                  <option>آخر سنة</option>
                </select>
              </div>

              {/* Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[65, 40, 85, 50, 70, 45, 90, 60, 75, 55, 80, 95].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="flex-1 bg-gradient-to-t from-cyan-500/60 to-blue-600/60 rounded-t-lg hover:from-cyan-500 hover:to-blue-600 transition-all cursor-pointer"
                  />
                ))}
              </div>
              <div className="flex justify-between px-4 mt-4 text-xs text-gray-500">
                <span>يناير</span>
                <span>فبراير</span>
                <span>مارس</span>
                <span>أبريل</span>
                <span>مايو</span>
                <span>يونيو</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <GlassCard className="p-5 lg:p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">النشاط الأخير</h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-xs">{activity.user}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500 text-xs">{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <GlassCard className="p-5 lg:p-6">
            <h2 className="text-lg font-bold text-white mb-4">الإجراءات السريعة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: "إضافة مستخدم", color: "from-cyan-500 to-blue-600" },
                { icon: BarChart3, label: "إنشاء تقرير", color: "from-green-500 to-emerald-600" },
                { icon: Globe, label: "تشغيل أتمتة", color: "from-purple-500 to-violet-600" },
                { icon: Settings, label: "الإعدادات", color: "from-orange-500 to-red-600" },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div
                    className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
