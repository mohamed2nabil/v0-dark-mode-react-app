"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DynamicBackground } from "@/components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  Plus,
  X,
  Globe,
  MapPin,
  Check,
  Menu,
  Trash2,
  Edit,
  RefreshCw,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  City,
  Country,
  CustomCity,
  DEFAULT_COUNTRIES,
  CITY_NEIGHBORHOODS,
  normalizeArabic,
} from "@/lib/citiesData";

type TabType = "whatsapp" | "scraper" | "logs" | "neighborhoods";
type TerminalLog = { id: number; message: string; type: "info" | "success" | "error" };

// Login Component
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 bg-black/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-8">
            <div className="text-white font-bold text-2xl">إدارة المهام الذكية</div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">تسجيل الدخول</h2>
          <p className="text-white/50 text-center mb-8">مرحباً بعودتك</p>

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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
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
              ) : (
                "دخول"
              )}
            </button>
          </form>


        </div>
      </motion.div>
    </div>
  );
}

// Main Dashboard
function Dashboard({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("whatsapp");
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const addLog = (message: string, type: TerminalLog["type"]) => {
    setTerminalLogs((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  // Lifted custom cities state
  const [customCities, setCustomCities] = useState<CustomCity[]>([]);

  // Lifted neighborhoods state
  const [neighborhoods, setNeighborhoods] = useState<Record<string, string[]>>({});

  // Load custom cities from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("custom_countries_cities");
      if (stored) {
        setCustomCities(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load custom cities", e);
    }
  }, []);

  // Load neighborhoods from localStorage or fallback to CITY_NEIGHBORHOODS
  useEffect(() => {
    try {
      const stored = localStorage.getItem("custom_neighborhoods");
      if (stored) {
        setNeighborhoods(JSON.parse(stored));
      } else {
        setNeighborhoods(CITY_NEIGHBORHOODS);
      }
    } catch (e) {
      console.error("Failed to load neighborhoods", e);
      setNeighborhoods(CITY_NEIGHBORHOODS);
    }
  }, []);

  const saveNeighborhoods = (newNeighborhoods: Record<string, string[]>) => {
    setNeighborhoods(newNeighborhoods);
    try {
      localStorage.setItem("custom_neighborhoods", JSON.stringify(newNeighborhoods));
    } catch (e) {
      console.error("Failed to save neighborhoods", e);
    }
  };

  const saveCustomCities = (newCities: CustomCity[]) => {
    setCustomCities(newCities);
    try {
      localStorage.setItem("custom_countries_cities", JSON.stringify(newCities));
    } catch (e) {
      console.error("Failed to save custom cities", e);
    }
  };

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "whatsapp", label: "حملة واتساب", icon: <MessageSquare size={20} /> },
    { id: "scraper", label: "استخراج البيانات", icon: <Database size={20} /> },
    { id: "neighborhoods", label: "إدارة الأحياء", icon: <MapPin size={20} /> },
    { id: "logs", label: "سجل العمليات", icon: <Clock size={20} /> },
  ];

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`w-64 h-screen bg-zinc-950 md:bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col fixed right-0 top-0 shadow-[0_0_60px_rgba(0,0,0,0.15)] z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-semibold text-lg">إدارة المهام الذكية</div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-white/50 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false); // Close on mobile navigation
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-3">
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
      <div className="flex-1 mr-0 md:mr-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-white/70 hover:text-white transition-colors p-1"
              title="القائمة"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-white">إدارة المهام الذكية</h1>
          </div>
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
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)] relative z-25">
                {(activeTab === "whatsapp" || activeTab === "scraper" || activeTab === "neighborhoods") && (
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 border-b border-white/10 pb-4">
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
                    <button
                      onClick={() => setActiveTab("neighborhoods")}
                      className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                        activeTab === "neighborhoods" ? "border-emerald-500 text-white" : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      <MapPin size={18} />
                      إدارة الأحياء
                    </button>
                  </div>
                )}

                {activeTab === "whatsapp" && <WhatsAppForm addLog={addLog} />}
                {activeTab === "scraper" && (
                  <ScraperForm
                    addLog={addLog}
                    customCities={customCities}
                    saveCustomCities={saveCustomCities}
                    neighborhoods={neighborhoods}
                  />
                )}
                {activeTab === "neighborhoods" && (
                  <NeighborhoodsManager
                    addLog={addLog}
                    customCities={customCities}
                    neighborhoods={neighborhoods}
                    saveNeighborhoods={saveNeighborhoods}
                  />
                )}
                {activeTab === "logs" && <LogsContent logs={terminalLogs} />}
              </div>

              {(activeTab === "whatsapp" || activeTab === "scraper" || activeTab === "neighborhoods") && <Terminal logs={terminalLogs} />}
            </motion.div>
          </AnimatePresence>
        </main>
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">اسم المسؤول</label>
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="أستاذ محمد"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">رقم الموبايل المُرسِل</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
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

interface ScraperFormProps {
  addLog: (msg: string, type: TerminalLog["type"]) => void;
  customCities: CustomCity[];
  saveCustomCities: (newCities: CustomCity[]) => void;
  neighborhoods: Record<string, string[]>;
}

function ScraperForm({
  addLog,
  customCities,
  saveCustomCities,
  neighborhoods: allNeighborhoods,
}: ScraperFormProps) {
  const [activity, setActivity] = useState("");
  const [maxResults, setMaxResults] = useState("10");
  const [loading, setLoading] = useState(false);

  // Combobox dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingCity, setEditingCity] = useState<CustomCity | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  const [modalCityName, setModalCityName] = useState("");
  const [modalCountryOption, setModalCountryOption] = useState("select");
  const [modalSelectedCountry, setModalSelectedCountry] = useState(DEFAULT_COUNTRIES[0]?.name || "المملكة العربية السعودية");
  const [modalCustomCountryName, setModalCustomCountryName] = useState("");
  const [modalLat, setModalLat] = useState("24.7136");
  const [modalLng, setModalLng] = useState("46.6753");
  const [modalError, setModalError] = useState("");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Merge default list with custom cities
  const mergedCountries = (() => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_COUNTRIES)) as Country[];
    customCities.forEach((cc) => {
      const existingCountry = merged.find((c) => c.name === cc.countryName);
      const cityObj = { name: cc.cityName, lat: cc.lat, lng: cc.lng };
      if (existingCountry) {
        if (!existingCountry.cities.some((city) => city.name === cc.cityName)) {
          existingCountry.cities.push(cityObj);
        }
      } else {
        merged.push({
          name: cc.countryName,
          cities: [cityObj],
        });
      }
    });
    return merged;
  })();

  // Filter countries and cities based on search query
  const filteredCountries = mergedCountries
    .map((country) => {
      const normalizedQuery = normalizeArabic(searchQuery).toLowerCase();
      const matchedCities = country.cities.filter(
        (city) =>
          normalizeArabic(city.name).toLowerCase().includes(normalizedQuery) ||
          normalizeArabic(country.name).toLowerCase().includes(normalizedQuery)
      );
      return {
        ...country,
        cities: matchedCities,
      };
    })
    .filter((country) => country.cities.length > 0);

  // Select a city handler
  const handleSelectCity = (city: City, countryName: string) => {
    setSelectedCity(city);
    setSelectedCountryName(countryName);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Convert Arabic numerals to English digits
  const parseArabicAndEnglishFloat = (str: string): number => {
    const arabicNums = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let formatted = str.toString().trim();
    for (let i = 0; i < 10; i++) {
      formatted = formatted.replace(arabicNums[i], i.toString());
    }
    return parseFloat(formatted);
  };

  // Add/Edit custom city handler
  const handleAddCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!modalCityName.trim()) {
      setModalError("يرجى إدخال اسم المدينة");
      return;
    }

    const finalCountryName =
      modalCountryOption === "select"
        ? modalSelectedCountry
        : modalCustomCountryName.trim();

    if (!finalCountryName) {
      setModalError("يرجى اختيار أو كتابة اسم الدولة");
      return;
    }

    const parsedLat = parseArabicAndEnglishFloat(modalLat);
    const parsedLng = parseArabicAndEnglishFloat(modalLng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setModalError("يرجى إدخال إحداثيات صحيحة (أرقام)");
      return;
    }

    const newCity: CustomCity = {
      cityName: modalCityName.trim(),
      countryName: finalCountryName,
      lat: parsedLat,
      lng: parsedLng,
    };

    if (editingCity) {
      // Modify existing custom city
      const updated = customCities.map((cc) => {
        if (
          cc.cityName.toLowerCase() === editingCity.cityName.toLowerCase() &&
          cc.countryName.toLowerCase() === editingCity.countryName.toLowerCase()
        ) {
          return newCity;
        }
        return cc;
      });
      saveCustomCities(updated);
      setEditingCity(null);
      addLog(`تم تعديل المدينة المخصصة: "${newCity.cityName}" بنجاح!`, "success");
    } else {
      // Check if city already exists
      const cityExists = mergedCountries.some((c) =>
        c.cities.some(
          (city) =>
            city.name.toLowerCase() === newCity.cityName.toLowerCase() &&
            c.name.toLowerCase() === newCity.countryName.toLowerCase()
        )
      );

      if (cityExists) {
        setModalError("هذه المدينة موجودة بالفعل في هذه الدولة!");
        return;
      }

      const updatedCustomCities = [...customCities, newCity];
      saveCustomCities(updatedCustomCities);
      addLog(`تمت إضافة وتحديد المدينة المخصصة: "${newCity.cityName}" بنجاح!`, "success");
    }

    // Auto-select newly added or edited city
    setSelectedCity({
      name: newCity.cityName,
      lat: newCity.lat,
      lng: newCity.lng,
    });
    setSelectedCountryName(newCity.countryName);
    setSearchQuery(""); // Clear search query so the new city is immediately visible

    // Reset modal form
    setModalCityName("");
    setModalCountryOption("select");
    setModalSelectedCountry(DEFAULT_COUNTRIES[0]?.name || "المملكة العربية السعودية");
    setModalCustomCountryName("");
    setModalLat("24.7136");
    setModalLng("46.6753");
    setIsModalOpen(false);
  };

  // Edit custom city click handler
  const handleEditCustomCity = (city: City, countryName: string) => {
    const cc = customCities.find(
      (c) => c.cityName.toLowerCase() === city.name.toLowerCase() && c.countryName.toLowerCase() === countryName.toLowerCase()
    );
    if (cc) {
      setEditingCity(cc);
      setModalCityName(cc.cityName);
      setModalCountryOption("select");
      setModalSelectedCountry(cc.countryName);
      setModalCustomCountryName(cc.countryName);
      setModalLat(cc.lat.toString());
      setModalLng(cc.lng.toString());
      setIsModalOpen(true);
      setIsOpen(false);
    }
  };

  // Delete custom city click handler
  const handleDeleteCustomCity = (cityName: string, countryName: string) => {
    const updated = customCities.filter(
      (cc) => !(cc.cityName.toLowerCase() === cityName.toLowerCase() && cc.countryName.toLowerCase() === countryName.toLowerCase())
    );
    saveCustomCities(updated);
    
    // Reset selection if the deleted city was selected
    if (selectedCity && selectedCity.name.toLowerCase() === cityName.toLowerCase() && selectedCountryName.toLowerCase() === countryName.toLowerCase()) {
      setSelectedCity(null);
      setSelectedCountryName("");
    }
    
    addLog(`تم حذف المدينة المخصصة "${cityName}" بنجاح!`, "success");
  };

  // Handle modal country change to auto-update lat/lng coordinates
  const handleModalCountryChange = (countryName: string) => {
    setModalSelectedCountry(countryName);
    const country = DEFAULT_COUNTRIES.find((c) => c.name === countryName);
    if (country && country.cities.length > 0) {
      setModalLat(country.cities[0].lat.toString());
      setModalLng(country.cities[0].lng.toString());
    }
  };

  // Quick action from search empty state
  const handleQuickAddCity = () => {
    setEditingCity(null);
    setModalCityName(searchQuery);
    setModalCountryOption("select");
    setModalSelectedCountry(DEFAULT_COUNTRIES[0]?.name || "المملكة العربية السعودية");
    setModalLat("24.7136");
    setModalLng("46.6753");
    setIsModalOpen(true);
    setIsOpen(false);
  };

  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      addLog("يرجى إدخال النشاط المطلوب أولاً", "error");
      return;
    }
    if (!selectedCity) {
      addLog("يرجى تحديد المدينة أولاً", "error");
      return;
    }

    const cityNeighborhoods = allNeighborhoods[selectedCity.name] || [];

    setLoading(true);
    addLog(`جاري استخراج البيانات لـ "${activity}" في "${selectedCity.name}"${cityNeighborhoods.length > 0 ? ` (مع إرسال ${cityNeighborhoods.length} أحياء للـ backend)` : ""}...`, "info");

    const payload: Record<string, any> = {
      "النشاط": activity.trim(),
      "المدينة": selectedCity.name,
      "عدد الشركات المطلوبة": parseInt(maxResults) || 10,
      "lat": selectedCity.lat,
      "lng": selectedCity.lng,
      "ll_param": `@${selectedCity.lat},${selectedCity.lng},13z`
    };

    if (cityNeighborhoods.length > 0) {
      payload["الاحياء"] = cityNeighborhoods;
    }

    try {
      const response = await fetch("https://n8n.an8n.store/webhook/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        addLog(`تم إرسال طلب استخراج البيانات بنجاح لـ "${selectedCity.name}"${cityNeighborhoods.length > 0 ? ` (مع ${cityNeighborhoods.length} أحياء للـ backend)` : ""}!`, "success");
      } else {
        addLog("فشل في إرسال طلب استخراج البيانات للـ Webhook", "error");
      }
    } catch (err) {
      addLog("حدث خطأ أثناء الاتصال بالخادم، يرجى التحقق من الشبكة", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Neighborhoods for currently selected city
  const neighborhoods = selectedCity ? allNeighborhoods[selectedCity.name] || [] : [];

  // Check if search button should be disabled
  const isSubmitDisabled = !activity.trim() || !selectedCity || loading;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* City Select Dropdown (Combobox) */}
          <div className={`relative ${isOpen ? "z-40" : "z-10"}`} ref={dropdownRef}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white/70 text-sm">
                المدينة <span className="text-emerald-400 font-bold">*</span>
              </label>
            <button
              type="button"
              onClick={() => {
                setEditingCity(null);
                setModalCityName("");
                setModalCountryOption("select");
                setModalSelectedCountry(DEFAULT_COUNTRIES[0]?.name || "المملكة العربية السعودية");
                setModalLat("24.7136");
                setModalLng("46.6753");
                setModalError("");
                setIsModalOpen(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors animate-pulse"
            >
              <Plus size={12} />
              إضافة مدينة مخصصة
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-right flex items-center justify-between focus:outline-none focus:border-emerald-500/60 hover:bg-white/10 transition-all cursor-pointer min-h-[48px]"
          >
            {selectedCity ? (
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400 shrink-0" />
                <span className="font-medium">{selectedCity.name}</span>
                <span className="text-xs text-white/40">({selectedCountryName})</span>
              </span>
            ) : (
              <span className="text-white/30">اختر المدينة...</span>
            )}
            <ChevronDown
              size={18}
              className={`text-white/50 transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Combobox Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-2 w-full bg-zinc-950 border border-white/10 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden"
              >
                {/* Search Box */}
                <div className="p-2 border-b border-white/10 flex items-center relative">
                  <Search size={14} className="absolute right-4 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg pr-9 pl-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="ابحث بالمدينة أو الدولة..."
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute left-4 text-white/40 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Cities List */}
                <div className="max-h-60 overflow-y-auto p-2 space-y-2 text-right">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-white/40 text-xs mb-2">لا توجد نتائج لـ "{searchQuery}"</p>
                      <button
                        type="button"
                        onClick={handleQuickAddCity}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold py-1.5 px-3 rounded-lg border border-emerald-500/20 transition-all inline-flex items-center gap-1"
                      >
                        <Plus size={12} />
                        إضافة "{searchQuery}" كمدينة جديدة
                      </button>
                    </div>
                  ) : (
                    filteredCountries.map((country) => (
                      <div key={country.name} className="space-y-1">
                        <div className="text-emerald-400/80 text-xs font-semibold px-2 py-1 flex items-center gap-1.5 select-none border-b border-white/5 pb-1">
                          <Globe size={12} />
                          <span>{country.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 py-1">
                          {country.cities.map((city) => {
                            const isCustom = customCities.some(
                              (cc) => cc.cityName.toLowerCase() === city.name.toLowerCase() && cc.countryName.toLowerCase() === country.name.toLowerCase()
                            );
                            return (
                              <div
                                key={city.name}
                                className={`w-full group px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                  selectedCity?.name === city.name
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectCity(city, country.name)}
                                  className="flex-1 text-right font-medium"
                                >
                                  {city.name}
                                </button>
                                <div className="flex items-center gap-1.5">
                                  {selectedCity?.name === city.name && <Check size={12} className="text-emerald-400 shrink-0" />}
                                  {isCustom && (
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditCustomCity(city, country.name);
                                        }}
                                        className="p-0.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors"
                                        title="تعديل المدينة"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCustomCity(city.name, country.name);
                                        }}
                                        className="p-0.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-colors"
                                        title="حذف المدينة"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Add Custom */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingCity(null);
                    setModalCityName("");
                    setModalCountryOption("select");
                    setModalSelectedCountry(DEFAULT_COUNTRIES[0]?.name || "المملكة العربية السعودية");
                    setModalLat("24.7136");
                    setModalLng("46.6753");
                    setModalError("");
                    setIsModalOpen(true);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold py-2.5 px-3 border-t border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} className="text-emerald-400" />
                  إضافة مدينة مخصصة بإحداثيات
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Input */}
        <div>
          <label className="block text-white/70 text-sm mb-2">
            النشاط <span className="text-emerald-400 font-bold">*</span>
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="شركة مقاولات، مطاعم، إلخ..."
            required
          />
        </div>

        {/* Max Results Input */}
        <div>
          <label className="block text-white/70 text-sm mb-2">
            عدد الشركات المطلوبة <span className="text-white/40 text-xs font-normal">(الافتراضي 10)</span>
          </label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="10"
            min="1"
            max="1000"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 mt-4"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Search size={18} />
            بدء الاستخراج
          </>
        )}
      </button>

      </form>

      {/* Custom City Modal using React Portal */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-950/90 border border-white/10 rounded-2xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10 text-right animate-none scrollbar-none"
                dir="rtl"
              >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="text-emerald-400 w-5 h-5 animate-pulse" />
                  {editingCity ? "تعديل مدينة مخصصة" : "إضافة مدينة وإحداثيات مخصصة"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {modalError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2 text-right" dir="rtl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAddCustomCitySubmit} className="space-y-4 text-right" dir="rtl">
                {/* City Name */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">اسم المدينة <span className="text-emerald-400 font-bold">*</span></label>
                  <input
                    type="text"
                    required
                    value={modalCityName}
                    onChange={(e) => setModalCityName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors text-right"
                    placeholder="مثال: الجبيل، الهفوف، إلخ..."
                  />
                </div>

                {/* Country Option */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">الدولة <span className="text-emerald-400 font-bold">*</span></label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setModalCountryOption("select")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        modalCountryOption === "select"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      اختر من القائمة
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalCountryOption("custom")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        modalCountryOption === "custom"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      كتابة دولة جديدة
                    </button>
                  </div>

                  {modalCountryOption === "select" ? (
                    <div className="relative">
                      <select
                        value={modalSelectedCountry}
                        onChange={(e) => handleModalCountryChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer text-sm font-medium text-right"
                        required={modalCountryOption === "select"}
                      >
                        <option value="" disabled className="bg-zinc-950">اختر الدولة...</option>
                        {mergedCountries.map((c) => (
                          <option key={c.name} value={c.name} className="bg-zinc-950">
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      required={modalCountryOption === "custom"}
                      value={modalCustomCountryName}
                      onChange={(e) => setModalCustomCountryName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors text-right"
                      placeholder="مثال: المملكة العربية السعودية"
                    />
                  )}
                </div>

                {/* Coordinates (Lat / Lng) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-2 text-right">خط العرض (Latitude) <span className="text-emerald-400 font-bold">*</span></label>
                    <input
                      type="text"
                      required
                      value={modalLat}
                      onChange={(e) => setModalLat(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors text-center"
                      placeholder="24.7136"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2 text-right">خط الطول (Longitude) <span className="text-emerald-400 font-bold">*</span></label>
                    <input
                      type="text"
                      required
                      value={modalLng}
                      onChange={(e) => setModalLng(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors text-center"
                      placeholder="46.6753"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-white/40 leading-relaxed border-t border-white/5 pt-3 text-right">
                  <p>تنبيه: خطوط العرض والطول هي إحداثيات جغرافية دقيقة للمدينة. يمكنك الحصول عليها بسهولة من خرائط Google أو أي محرك بحث.</p>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/70 font-semibold px-4 py-2 rounded-xl border border-white/5 transition-colors text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-xl transition-colors text-xs"
                  >
                    {editingCity ? "تعديل وحفظ" : "إضافة المدينة"}
                  </button>
                </div>
              </form>

              {/* Dedicated Custom Cities Management Section */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 text-right">
                  <Database size={14} className="text-emerald-400" />
                  المدن المخصصة المضافة حالياً
                </h4>
                
                {customCities.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4 bg-white/2 rounded-xl border border-white/5">
                    لم يتم إضافة أي مدن مخصصة بعد.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {customCities.map((cc) => (
                      <div 
                        key={`${cc.cityName}-${cc.countryName}`}
                        className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-semibold text-white truncate">{cc.cityName}</p>
                          <p className="text-[10px] text-white/40 truncate">{cc.countryName}</p>
                          <p className="text-[9px] text-emerald-400/70 font-mono mt-0.5" dir="ltr">
                            Lat: {cc.lat.toFixed(4)}, Lng: {cc.lng.toFixed(4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Triggers Edit City
                              setEditingCity(cc);
                              setModalCityName(cc.cityName);
                              setModalCountryOption(
                                DEFAULT_COUNTRIES.some((c) => c.name === cc.countryName) ? "select" : "custom"
                              );
                              if (DEFAULT_COUNTRIES.some((c) => c.name === cc.countryName)) {
                                setModalSelectedCountry(cc.countryName);
                              } else {
                                setModalCustomCountryName(cc.countryName);
                              }
                              setModalLat(cc.lat.toString());
                              setModalLng(cc.lng.toString());
                            }}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="تعديل المدينة"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomCity(cc.cityName, cc.countryName)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="حذف المدينة"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
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
                log.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : log.type === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-white/10 border border-white/10"
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
    <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button className="text-white/50 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-colors">Clear Console</button>
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

interface NeighborhoodsManagerProps {
  addLog: (msg: string, type: TerminalLog["type"]) => void;
  customCities: CustomCity[];
  neighborhoods: Record<string, string[]>;
  saveNeighborhoods: (newNeighborhoods: Record<string, string[]>) => void;
}

function NeighborhoodsManager({
  addLog,
  customCities,
  neighborhoods: allNeighborhoods,
  saveNeighborhoods,
}: NeighborhoodsManagerProps) {
  const [selectedCityName, setSelectedCityName] = useState("الرياض");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState("");

  // Merge default list with custom cities
  const mergedCountries = (() => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_COUNTRIES)) as Country[];
    customCities.forEach((cc) => {
      const existingCountry = merged.find((c) => c.name === cc.countryName);
      const cityObj = { name: cc.cityName, lat: cc.lat, lng: cc.lng };
      if (existingCountry) {
        if (!existingCountry.cities.some((city) => city.name === cc.cityName)) {
          existingCountry.cities.push(cityObj);
        }
      } else {
        merged.push({
          name: cc.countryName,
          cities: [cityObj],
        });
      }
    });
    return merged;
  })();

  // Filter countries and cities based on search query
  const filteredCountries = mergedCountries
    .map((country) => {
      const normalizedQuery = normalizeArabic(searchQuery).toLowerCase();
      const matchedCities = country.cities.filter(
        (city) =>
          normalizeArabic(city.name).toLowerCase().includes(normalizedQuery) ||
          normalizeArabic(country.name).toLowerCase().includes(normalizedQuery)
      );
      return {
        ...country,
        cities: matchedCities,
      };
    })
    .filter((country) => country.cities.length > 0);

  // Find country name of the currently selected city
  const selectedCountryName = (() => {
    for (const country of mergedCountries) {
      if (country.cities.some((city) => city.name === selectedCityName)) {
        return country.name;
      }
    }
    return "";
  })();

  const currentNeighborhoods = allNeighborhoods[selectedCityName] || [];

  const handleAddNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = newNeighborhood.trim();
    if (!name) return;

    // Check duplicate
    const normalizedNew = normalizeArabic(name).toLowerCase();
    const isDuplicate = currentNeighborhoods.some(
      (n) => normalizeArabic(n).toLowerCase() === normalizedNew
    );

    if (isDuplicate) {
      setError("هذا الحي موجود بالفعل في هذه المدينة!");
      addLog(`فشل إضافة حي: "${name}" مكرر بالفعل في "${selectedCityName}"`, "error");
      return;
    }

    const updated = {
      ...allNeighborhoods,
      [selectedCityName]: [...currentNeighborhoods, name],
    };
    saveNeighborhoods(updated);
    setNewNeighborhood("");
    addLog(`تمت إضافة الحي "${name}" إلى "${selectedCityName}" بنجاح`, "success");
  };

  const handleDeleteNeighborhood = (index: number) => {
    const neighborhoodToDelete = currentNeighborhoods[index];
    const filtered = currentNeighborhoods.filter((_, i) => i !== index);
    const updated = {
      ...allNeighborhoods,
      [selectedCityName]: filtered,
    };
    saveNeighborhoods(updated);
    addLog(`تم حذف الحي "${neighborhoodToDelete}" من "${selectedCityName}"`, "success");
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(currentNeighborhoods[index]);
  };

  const handleSaveEdit = (index: number) => {
    const text = editingText.trim();
    if (!text) return;

    // Check duplicate (excluding current index)
    const normalizedNew = normalizeArabic(text).toLowerCase();
    const isDuplicate = currentNeighborhoods.some(
      (n, i) => i !== index && normalizeArabic(n).toLowerCase() === normalizedNew
    );

    if (isDuplicate) {
      setError("هذا الاسم موجود بالفعل لحي آخر!");
      addLog(`فشل تعديل الحي: الاسم الجديد "${text}" مكرر`, "error");
      return;
    }

    const updatedList = [...currentNeighborhoods];
    const oldName = updatedList[index];
    updatedList[index] = text;

    const updated = {
      ...allNeighborhoods,
      [selectedCityName]: updatedList,
    };
    saveNeighborhoods(updated);
    setEditingIndex(null);
    addLog(`تم تعديل الحي من "${oldName}" إلى "${text}" في "${selectedCityName}" بنجاح`, "success");
  };

  const handleResetToDefault = () => {
    const defaultNeighborhoods = CITY_NEIGHBORHOODS[selectedCityName];
    if (defaultNeighborhoods) {
      const updated = {
        ...allNeighborhoods,
        [selectedCityName]: [...defaultNeighborhoods],
      };
      saveNeighborhoods(updated);
      addLog(`تمت إعادة تعيين أحياء "${selectedCityName}" إلى الوضع الافتراضي للبلدة`, "success");
    }
  };

  const hasDefault = selectedCityName in CITY_NEIGHBORHOODS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right" dir="rtl">
      {/* Right Pane: City Selector Sidebar */}
      <div className="lg:col-span-4 bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col h-[550px] backdrop-blur-md">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Globe size={18} className="text-emerald-400" />
          <span>اختر المدينة لتعديل أحيائها</span>
        </h3>
        
        {/* Search cities */}
        <div className="relative mb-4">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="ابحث عن مدينة أو دولة..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {filteredCountries.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">لا توجد نتائج مطابقة</p>
          ) : (
            filteredCountries.map((country) => (
              <div key={country.name} className="space-y-1">
                <div className="text-emerald-400/80 text-xs font-semibold px-2 py-1 select-none border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Globe size={12} />
                  <span>{country.name}</span>
                </div>
                <div className="grid grid-cols-1 gap-1 py-1">
                  {country.cities.map((city) => {
                    const isCustom = customCities.some(
                      (cc) => cc.cityName.toLowerCase() === city.name.toLowerCase() && cc.countryName.toLowerCase() === country.name.toLowerCase()
                    );
                    const isSelected = selectedCityName === city.name;
                    return (
                      <button
                        key={city.name}
                        onClick={() => {
                          setSelectedCityName(city.name);
                          setError("");
                          setEditingIndex(null);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={12} className={isSelected ? "text-emerald-400" : "text-white/40"} />
                          <span>{city.name}</span>
                        </span>
                        {isCustom && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            مخصصة
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Left Pane: Neighborhoods Customization Area */}
      <div className="lg:col-span-8 bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col h-[550px] backdrop-blur-md relative overflow-hidden">
        {/* Header section inside Left Pane */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">البلدان والمدن / {selectedCountryName}</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <MapPin className="text-emerald-400" size={20} />
              <span>أحياء مدينة {selectedCityName}</span>
              <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-normal">
                {currentNeighborhoods.length} حيّ
              </span>
            </h2>
          </div>
          
          {hasDefault && (
            <button
              onClick={handleResetToDefault}
              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl border border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
              title="إعادة تعيين للأحياء الافتراضية"
            >
              <RefreshCw size={14} className="text-emerald-400" />
              <span>إعادة تعيين للافتراضي</span>
            </button>
          )}
        </div>

        {/* Display inline error/success messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        {/* Add new neighborhood inline form */}
        <form onSubmit={handleAddNeighborhood} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNeighborhood}
            onChange={(e) => {
              setNewNeighborhood(e.target.value);
              setError("");
            }}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 transition-colors"
            placeholder="مثال: حي النخيل، حي الياسمين..."
          />
          <button
            type="submit"
            disabled={!newNeighborhood.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>إضافة حي</span>
          </button>
        </form>

        {/* Neighborhood scroll list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
          {currentNeighborhoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MapPin size={48} className="text-white/10 mb-3" />
              <p className="text-white/40 text-sm">لا توجد أحياء مضافة لهذه المدينة حالياً.</p>
              <p className="text-white/20 text-xs mt-1">ابدأ بكتابة اسم حي جديد في الحقل أعلاه لإضافته.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentNeighborhoods.map((nh, idx) => {
                const isEditing = editingIndex === idx;
                return (
                  <div
                    key={`${nh}-${idx}`}
                    className={`bg-white/5 border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center justify-between transition-all group ${
                      isEditing ? "ring-1 ring-emerald-500/50 bg-emerald-500/5" : ""
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => {
                            setEditingText(e.target.value);
                            setError("");
                          }}
                          className="flex-1 bg-zinc-950 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="حفظ"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(null);
                            setError("");
                          }}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="إلغاء"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-white/80 text-sm font-medium pr-1 select-all truncate">
                          {nh}
                        </span>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="تعديل اسم الحي"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNeighborhood(idx)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="حذف الحي"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DynamicBackground>
      <div className="relative z-10 min-h-screen font-sans" dir="rtl">
        {!user ? (
          <LoginScreen />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </DynamicBackground>
  );
}
