import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import BusinessRegister from "./pages/BusinessRegister";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessSelect from "./pages/BusinessSelect";
import BusinessHub from "./pages/BusinessHub";
import BusinessSettings from "./pages/BusinessSettings";
import BusinessAppointments from "./pages/BusinessAppointments";
import Comments from "./pages/Comments";
import Categories from "./pages/Categories";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerAppointments from "./pages/CustomerAppointments";
import CustomerCreateAppointment from "./pages/CustomerCreateAppointment";
import CustomerProfile from "./pages/CustomerProfile";
import BusinessProfile from "./pages/BusinessProfile";
import CustomerDashboard from "./pages/CustomerDashboard";
import BusinessServices from "./pages/BusinessServices";
import BusinessReviews from "./pages/BusinessReviews";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
const API_URL = import.meta.env.VITE_API_URL || "/api";

function Navbar({ isDarkMode, toggleDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const [userProfilePic, setUserProfilePic] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/notifications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data || []);
      } catch (error) {
        console.error("Bildirimler alınamadı", error);
      }
    };
    fetchNotifications();

    const fetchUserProfile = async () => {
      if (token && userType === "customer") {
        try {
          const res = await axios.get(`${API_URL}/customers/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfilePic(res.data.profilePicture || "");
        } catch (error) {
          console.error("Profil alınamadı", error);
        }
      }
    };
    fetchUserProfile();

    const interval = setInterval(fetchNotifications, 30000); // 30 saniyede bir güncelle

    window.addEventListener("profileUpdated", fetchUserProfile);

    return () => {
      clearInterval(interval);
      window.removeEventListener("profileUpdated", fetchUserProfile);
    };
  }, [token, userType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReadNotification = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Okundu olarak işaretlenemedi", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Tüm verileri tek seferde temizle
    window.location.href = "/"; // Sayfayı tamamen yenileyerek ana sayfaya dön
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let links = [{ to: "/", label: "Ana Sayfa" }];

  if (!token) {
    links.push({ to: "/customer-login", label: "Müşteri Giriş" });
    links.push({ to: "/customer-register", label: "Müşteri Kayıt" });
    links.push({ to: "/login", label: "İşletme Giriş" });
    links.push({ to: "/register", label: "İşletme Kayıt" });
  } else if (userType === "customer") {
    links.push({ to: "/customer-appointments", label: "Randevularım" });
  } else if (userType === "business" || userType === "business_owner") {
    if (userType === "business") {
      links.push({ to: "/business-hub", label: "İşletme Paneli" });
    }
    links.push({ to: "/select-business", label: "İşletme Seç" });
  }

  return (
    <nav style={{
      background: "var(--bg)", borderBottom: "1px solid var(--border)",
      padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      height: "70px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 1000
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#c084fc" : "#1E2A40"} />
              <stop offset="100%" stopColor={isDarkMode ? "#a855f7" : "#3A4D70"} />
            </linearGradient>
            <linearGradient id="b-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8E4A5D" />
              <stop offset="100%" stopColor="#C28798" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill={isDarkMode ? "#1f2028" : "#fdf2f8"} stroke={isDarkMode ? "#2e303a" : "#fce7f3"} strokeWidth="2" />
          <path d="M 13 33 L 13 18 L 20 27 L 27 18 L 27 33" stroke="url(#m-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 20 15 L 25 15 C 32 15 32 22 27 22 C 35 22 35 33 25 33 L 20 33 Z" stroke="url(#b-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span style={{ fontWeight: "900", fontSize: "20px", color: "var(--text-h)", letterSpacing: "-0.5px" }}>
          <span style={{ color: isDarkMode ? "#c084fc" : "#1E2A40" }}>M</span>
          <span style={{ color: "#8E4A5D" }}>B</span>randev
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* Masaüstü Navigasyon Linkleri */}
        <div className="desktop-nav">
          {links.map(link => (
            <Link key={link.to} to={link.to} className="desktop-nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Bildirim Zili ve Profil (Her zaman görünür veya masaüstü öncelikli) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          
          {/* Dark Mode */}
          <button 
            onClick={toggleDarkMode}
            style={{
              background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
              borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer",
              fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>

          {token && (
            <>
              {/* Bildirim Zili */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", position: "relative" }}
                >
                  🔔
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{
                      position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "#fff",
                      fontSize: "10px", fontWeight: "bold", width: "16px", height: "16px",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{
                    position: "absolute", top: "45px", right: "-100px", width: "85vw", maxWidth: "320px", 
                    background: "var(--bg)", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", 
                    zIndex: 1000, border: "1px solid var(--border)", maxHeight: "400px", overflowY: "auto"
                  }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", fontWeight: "700", color: "var(--text-h)" }}>Bildirimler</div>
                    {notifications.length === 0 ? (
                      <p style={{ padding: "16px", fontSize: "13px", color: "var(--text)", margin: 0, textAlign: "center" }}>Hiç bildiriminiz yok.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleReadNotification(n._id)}
                          style={{
                            padding: "16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                            background: n.isRead ? "transparent" : "var(--accent-bg)", transition: "0.2s"
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", fontWeight: n.isRead ? "500" : "700" }}>{n.message}</p>
                          <span style={{ fontSize: "11px", color: "var(--text)", marginTop: "4px", display: "block" }}>
                            {new Date(n.createdAt).toLocaleDateString("tr-TR")} {new Date(n.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {userType === "customer" && (
                <div 
                  onClick={() => navigate("/customer-profile")}
                  style={{
                    width: "40px", height: "40px", minWidth: "40px", minHeight: "40px",
                    borderRadius: "50%", background: "#f3f4f6",
                    cursor: "pointer", overflow: "hidden", border: "2px solid #1E2A40",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {userProfilePic ? (
                    <img src={userProfilePic} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "20px" }}>👤</span>
                  )}
                </div>
              )}

              {/* Çıkış Yap Butonu */}
              <button 
                onClick={handleLogout} 
                className="desktop-links"
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: "none",
                  background: "#111", color: "#fff", cursor: "pointer",
                  fontSize: "14px", fontWeight: "700"
                }}
              >
                Çıkış Yap
              </button>
            </>
          )}
        </div>

        {/* Mobil Menü Butonu */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", padding: "8px" }}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobil Menü Overlay */}
        {isMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
            {links.map(link => (
              <Link key={link.to} to={link.to} className="mobile-menu-link">
                {link.label}
              </Link>
            ))}
            {token && (
              <>
                {userType === "customer" && (
                  <Link to="/customer-profile" className="mobile-menu-link" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                    👤 Profilim
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="mobile-menu-link" 
                  style={{ background: "#111", color: "#fff", border: "none", width: "100%" }}
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function ChatMessage({ msg }) {
  const navigate = useNavigate();
  
  const renderText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <span 
            key={i} 
            onClick={(e) => {
              e.preventDefault();
              navigate(match[2]);
            }}
            style={{ 
              color: "var(--accent)", 
              textDecoration: "underline", 
              fontWeight: "700", 
              cursor: "pointer",
              margin: "0 2px"
            }}
          >
            {match[1]}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={{
      background: msg.sender === "ai" ? "var(--accent-bg)" : "var(--text-h)",
      color: msg.sender === "ai" ? "var(--text-h)" : "var(--bg)",
      padding: "10px 14px", borderRadius: "16px",
      borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "16px",
      borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
      boxShadow: "var(--shadow)",
      maxWidth: "85%", alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
      fontSize: "14px", lineHeight: "1.5",
      border: msg.sender === "ai" ? "1px solid var(--accent-border)" : "none"
    }}>
      {renderText(msg.text)}
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
           (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const userType = localStorage.getItem("userType");
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "Merhaba! MBrandev hakkında size nasıl yardımcı olabilirim?" }
  ]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const userMessage = { sender: "user", text: chatMsg };
    const currentHistory = [...chatHistory, userMessage];
    
    setChatHistory(currentHistory);
    setChatMsg("");

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, {
        message: chatMsg,
        history: chatHistory,
        userType: userType
      });
      
      setChatHistory([...currentHistory, { sender: "ai", text: res.data.aiResponse }]);
    } catch (error) {
      console.error("AI Chat Error Details:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.aiResponse || error.response?.data?.message || "Üzgünüm, şu an sunucuyla bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin. 😊";
      
      setChatHistory([...currentHistory, { 
        sender: "ai", 
        text: errorMsg 
      }]);
    }
  };

  return (
    <BrowserRouter>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div style={{ minHeight: "calc(100vh - 60px)", background: "var(--bg)" }}>
        <Routes>
          <Route path="/" element={
            userType === "customer" ? <CustomerDashboard /> :
              <div style={{ background: "#fffafb", paddingBottom: "80px", fontFamily: "'Inter', sans-serif" }}>
                {/* Modern Hero Section with Split Layout */}
                <div className="hero-section" style={{
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "-100px", left: "-50px", width: "400px", height: "400px",
                    background: "radial-gradient(circle, rgba(142,74,93,0.08) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%"
                  }}></div>
                  <div style={{
                    position: "absolute", bottom: "-50px", right: "20%", width: "450px", height: "450px",
                    background: "radial-gradient(circle, rgba(194,135,152,0.12) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%"
                  }}></div>

                  <div className="hero-text" style={{ position: "relative" }}>
                    <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(30,42,64,0.08)", color: "#1E2A40", borderRadius: "20px", fontWeight: "600", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(30,42,64,0.15)", letterSpacing: "1px", textTransform: "uppercase" }}>
                      ✨ İşletmenin Kolay Hali
                    </div>
                    <h1 style={{ 
                      fontSize: "clamp(32px, 8vw, 56px)", 
                      fontWeight: "800", 
                      marginBottom: "20px", 
                      color: "#2C2A2B", 
                      letterSpacing: "-1px", 
                      lineHeight: "1.1" 
                    }}>
                      MBrandev ile <br />
                      <span style={{ background: "-webkit-linear-gradient(45deg, #8E4A5D, #C28798)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mükemmel Randevular</span>
                    </h1>
                    <p className="hero-p" style={{ fontSize: "clamp(16px, 4vw, 19px)", color: "#686163", marginBottom: "32px", fontWeight: "400", maxWidth: "550px", lineHeight: "1.7" }}>
                      İşletmenizi büyütmenin ve müşterilerinizle buluşmanın en modern, şeffaf ve şık yolu. Zamandan tasarruf edin, sanatınıza odaklanın.
                    </p>
                    <div className="hero-buttons" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <a href="/register" style={{ padding: "14px 28px", background: "linear-gradient(135deg, #1E2A40, #3A4D70)", color: "#fff", borderRadius: "30px", textDecoration: "none", fontWeight: "600", fontSize: "16px", boxShadow: "0 8px 25px rgba(30,42,64,0.2)", transition: "all 0.3s", cursor: "pointer", letterSpacing: "0.5px" }} onMouseOver={(e) => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 12px 30px rgba(30,42,64,0.3)" }} onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 25px rgba(30,42,64,0.2)" }}>
                        İşletme Kaydı Oluştur →
                      </a>
                      <a href="/customer-login" style={{ padding: "14px 28px", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(5px)", color: "#8E4A5D", borderRadius: "30px", textDecoration: "none", fontWeight: "600", fontSize: "16px", border: "1px solid rgba(142,74,93,0.2)", boxShadow: "0 8px 20px rgba(0,0,0,0.02)", transition: "all 0.3s", letterSpacing: "0.5px" }} onMouseOver={(e) => { e.target.style.transform = "translateY(-3px)"; e.target.style.background = "#fff" }} onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.background = "rgba(255, 255, 255, 0.8)" }}>
                        Müşteri Olarak Başla
                      </a>
                    </div>
                  </div>

                  <div className="hero-image-container" style={{ position: "relative" }}>
                    <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
                      <div style={{ position: "absolute", inset: "-15px", background: "linear-gradient(135deg, #F3EBED, #FAF7F8)", borderRadius: "30px", transform: "rotate(-3deg)", zIndex: -1 }}></div>
                      <img src="/booking_lifestyle.png" alt="Müşteri Randevu" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 20px 50px rgba(142,74,93,0.15)", objectFit: "cover", aspectRatio: "4/5" }} />
                      <div style={{ position: "absolute", bottom: "30px", left: "-15px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(142,74,93,0.08)", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(142,74,93,0.1)" }}>
                        <div style={{ background: "#F3EBED", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✨</div>
                        <div>
                          <div style={{ fontWeight: "800", color: "#2C2A2B", lineHeight: "1.2", fontSize: "15px" }}>%100</div>
                          <div style={{ fontSize: "11px", color: "#686163", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Memnuniyet</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neden MBrandev? - Soft Glassmorphic Pink */}
                <div style={{ padding: "80px 32px" }}>
                  <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "800", color: "#1E2A40", marginBottom: "50px" }}>
                    Neden MBrandev?
                  </h2>
                  <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap", maxWidth: "1000px", margin: "0 auto" }}>
                    {[
                      { icon: "📅", title: "Zahmetsiz Randevu", desc: "Birkaç saniye içinde online randevunuzu oluşturun, zaman kazanın." },
                      { icon: "💬", title: "Şeffaf Yorumlar", desc: "Müşteri deneyimlerini paylaşarak güvenilir bir ortam sağlayın." },
                      { icon: "🏢", title: "Modern Panel", desc: "İşletmenizin performansını ve takvimini anlık olarak yönetin." },
                      { icon: "✨", title: "Şeffaf Tasarım", desc: "Müşterilerinize modern ve estetik bir rezervasyon deneyimi sunun." },
                    ].map((item, index) => (
                      <div key={index} style={{
                        background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(12px)", borderRadius: "20px", padding: "36px 24px", width: "220px",
                        textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 10px 40px rgba(244, 114, 182, 0.08)",
                        transition: "all 0.3s ease", cursor: "default"
                      }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)" }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)" }}>
                        <div style={{ fontSize: "42px", marginBottom: "20px", background: "rgba(253, 242, 248, 0.8)", width: "80px", height: "80px", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", boxShadow: "0 4px 15px rgba(244, 114, 182, 0.15)", border: "1px solid rgba(255, 255, 255, 0.5)" }}>
                          {item.icon}
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "17px", color: "#374151", marginBottom: "10px" }}>{item.title}</div>
                        <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image and Text Feature Section */}
                <div style={{ padding: "80px 5%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "50px", background: "#fff", margin: "40px 20px", borderRadius: "40px", boxShadow: "0 10px 40px rgba(244, 114, 182, 0.03)", border: "1px solid rgba(255, 255, 255, 0.8)" }}>
                  <div style={{ flex: "1 1 450px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(244,114,182,0.3) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" }}></div>
                    <div style={{ position: "absolute", bottom: "-30px", right: "-30px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(251,207,232,0.4) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" }}></div>
                    <img src="/salon_interior.png" alt="Güzellik Salonu" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", objectFit: "cover", aspectRatio: "16/10", position: "relative", zIndex: 1 }} />
                  </div>
                  <div style={{ flex: "1 1 500px" }}>
                    <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(30,42,64,0.1)", color: "#1E2A40", borderRadius: "20px", fontWeight: "700", fontSize: "14px", marginBottom: "20px" }}>
                      💼 İşletmeler İçin
                    </div>
                    <h2 style={{ fontSize: "40px", fontWeight: "800", color: "#1E2A40", marginBottom: "20px", lineHeight: "1.2", letterSpacing: "-0.5px" }}>
                      Salonunuz İçin <br /><span style={{ color: "#8E4A5D" }}>Kusursuz</span> Yönetim
                    </h2>
                    <p style={{ fontSize: "18px", color: "#4b5563", marginBottom: "30px", lineHeight: "1.6" }}>
                      Salonunuzun ambiyansına yakışır modern bir dijital deneyim sunun. Müşterileriniz 7/24 kolayca randevu alırken, siz sadece işinize ve sanatınıza odaklanın. MBrandev ile salon yönetimi artık çok daha şık ve zahmetsiz.
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                      {['Tam Otomatik Takvim Yönetimi', 'Gerçek Zamanlı Bildirimler ve Hatırlatıcılar', 'Müşteri Yorumları ile İtibar Yönetimi'].map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                          <div style={{ background: "linear-gradient(135deg, #1E2A40, #3A4D70)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", boxShadow: "0 4px 10px rgba(30,42,64,0.3)" }}>✓</div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sistem Nasıl Çalışır? - Elegant Dark */}
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)", padding: "80px 32px", borderRadius: "32px", margin: "0 20px" }}>
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <span style={{ display: "inline-block", padding: "6px 14px", background: "#f3f4f6", color: "#374151", borderRadius: "20px", fontWeight: "700", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase" }}>Rehber</span>
                  </div>
                  <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", color: "#1E2A40", marginBottom: "20px", letterSpacing: "-0.5px" }}>
                    Sistem Nasıl Çalışır?
                  </h2>
                  <p style={{ textAlign: "center", color: "#6b7280", fontSize: "18px", marginBottom: "60px", maxWidth: "600px", margin: "0 auto 60px", lineHeight: "1.6" }}>
                    İster işletme sahibi olun, ister müşteri, MBrandev'i kullanmak üç basit adımdan ibarettir.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
                    {/* Step 1 */}
                    <div style={{ flex: "1", minWidth: "250px", textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "40px", fontWeight: "900", color: "#e5e7eb", marginBottom: "10px", lineHeight: "1" }}>01</div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#1E2A40", marginBottom: "12px" }}>Kayıt Olun</div>
                      <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>Müşteri veya İşletme hesabı oluşturarak platforma anında ve ücretsiz giriş yapın.</p>
                    </div>
                    {/* Step 2 */}
                    <div style={{ flex: "1", minWidth: "250px", textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "40px", fontWeight: "900", color: "#e5e7eb", marginBottom: "10px", lineHeight: "1" }}>02</div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#1E2A40", marginBottom: "12px" }}>Hizmetleri Keşfedin</div>
                      <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>İşletmeler hizmetlerini ekler, müşteriler ise ihtiyaç duydukları hizmeti kolayca filtreler.</p>
                    </div>
                    {/* Step 3 */}
                    <div style={{ flex: "1", minWidth: "250px", textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "40px", fontWeight: "900", color: "#e5e7eb", marginBottom: "10px", lineHeight: "1" }}>03</div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#1E2A40", marginBottom: "12px" }}>Randevu Alın</div>
                      <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>Tek tıkla randevu oluşturun. Otomatik bildirimler ve AI desteği ile süreci yönetin.</p>
                    </div>
                  </div>
                </div>
              </div>
          } />
          <Route path="/select-business" element={<BusinessSelect />} />
          <Route path="/business-hub" element={<BusinessHub />} />
          <Route path="/business-settings" element={<BusinessSettings />} />
          <Route path="/register" element={<BusinessRegister />} />
          <Route path="/login" element={<BusinessLogin />} />
          <Route path="/appointments" element={<BusinessAppointments />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/customer-appointments" element={<CustomerAppointments />} />
          <Route path="/customer-new-appointment" element={<CustomerCreateAppointment />} />
          <Route path="/book/:businessId" element={<BusinessProfile />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/business-services" element={<BusinessServices />} />
          <Route path="/business-reviews" element={<BusinessReviews />} />
          <Route path="/business-reviews" element={<BusinessReviews />} />
        </Routes>
      </div>

      {/* Floating AI Support Widget */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000 }}>
        {showChat ? (
          <div style={{
            width: window.innerWidth < 480 ? "calc(100vw - 40px)" : "350px",
            height: window.innerWidth < 480 ? "60vh" : "450px",
            background: "#fff", borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(30, 42, 64, 0.2)", display: "flex", flexDirection: "column",
            overflow: "hidden", border: "1px solid #e2e8f0",
            position: "fixed", bottom: window.innerWidth < 480 ? "90px" : "30px", right: window.innerWidth < 480 ? "20px" : "30px"
          }}>
            {/* Chat Header */}
            <div style={{ background: "linear-gradient(to right, #1E2A40, #3A4D70)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "rgba(255,255,255,0.2)", borderRadius: "50%" }}>
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 13 33 L 13 18 L 20 27 L 27 18 L 27 33" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 20 15 L 25 15 C 32 15 32 22 27 22 C 35 22 35 33 25 33 L 20 33 Z" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>MBrandev AI</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Sizin için burada</div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", background: "#fafafa", display: "flex", flexDirection: "column", gap: "12px" }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === "ai" ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                    <ChatMessage msg={msg} />
                </div>
              ))}
            </div>

            {/* Chat Footer */}
            <form onSubmit={handleSendChat} style={{ padding: "16px", background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Bir soru sorun..."
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "20px", outline: "none", fontSize: "14px" }}
              />
              <button type="submit" style={{ background: "#1E2A40", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ➤
              </button>
            </form>
          </div>
        ) : (
          <button 
            id="ai-chat-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowChat(true);
            }} 
            style={{
              width: "64px", height: "64px", background: "linear-gradient(135deg, #1E2A40, #3A4D70)",
              color: "#fff", border: "none", borderRadius: "50%",
              cursor: "pointer", boxShadow: "0 8px 25px rgba(30, 42, 64, 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.3s"
            }} 
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"} 
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 13 33 L 13 18 L 20 27 L 27 18 L 27 33" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 20 15 L 25 15 C 32 15 32 22 27 22 C 35 22 35 33 25 33 L 20 33 Z" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        )}
      </div>
    </BrowserRouter>
  );
}