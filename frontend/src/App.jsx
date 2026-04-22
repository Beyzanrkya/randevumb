import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import BusinessRegister from "./pages/BusinessRegister";
import BusinessLogin from "./pages/BusinessLogin";
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
const API_URL = import.meta.env.VITE_API_URL || "/api";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

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

    const interval = setInterval(fetchNotifications, 30000); // 30 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [token]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("businessId");
    localStorage.removeItem("userType");
    navigate("/");
  };

  let links = [{ to: "/", label: "Ana Sayfa" }];

  if (!token) {
    links.push({ to: "/customer-login", label: "Müşteri Giriş" });
    links.push({ to: "/customer-register", label: "Müşteri Kayıt" });
    links.push({ to: "/login", label: "İşletme Giriş" });
    links.push({ to: "/register", label: "İşletme Kayıt" });
  } else if (userType === "customer") {
    links.push({ to: "/customer-profile", label: "Profilim" });
    links.push({ to: "/customer-appointments", label: "Randevularım" });
  } else if (userType === "business") {
    links.push({ to: "/business-services", label: "Hizmetlerim" });
    links.push({ to: "/appointments", label: "Gelen Randevular" });
  }

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      height: "60px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontWeight: "700", fontSize: "18px", color: "#111", marginRight: "24px" }}>MBrandev</span>
        {links.map(link => (
          <Link key={link.to} to={link.to} style={{
            padding: "6px 14px", borderRadius: "6px", textDecoration: "none",
            fontSize: "14px", fontWeight: "500",
            color: location.pathname === link.to ? "#fff" : "#555",
            background: location.pathname === link.to ? "#111" : "transparent",
          }}>{link.label}</Link>
        ))}
      </div>
      {token && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          
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
                position: "absolute", top: "40px", right: "0", width: "300px", background: "#fff",
                borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 100,
                border: "1px solid #e5e7eb", maxHeight: "400px", overflowY: "auto"
              }}>
                <h4 style={{ margin: 0, padding: "16px", borderBottom: "1px solid #e5e7eb", fontSize: "14px", fontWeight: "700" }}>Bildirimler</h4>
                {notifications.length === 0 ? (
                  <p style={{ padding: "16px", fontSize: "13px", color: "#6b7280", margin: 0, textAlign: "center" }}>Hiç bildiriminiz yok.</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => handleReadNotification(n._id)}
                      style={{ 
                        padding: "16px", borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                        background: n.isRead ? "#fff" : "#eff6ff", transition: "0.2s"
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "13px", color: "#111", fontWeight: n.isRead ? "500" : "700" }}>{n.message}</p>
                      <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                        {new Date(n.createdAt).toLocaleDateString("tr-TR")} {new Date(n.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={{
            padding: "6px 14px", borderRadius: "6px", border: "1px solid #ef4444",
            background: "transparent", color: "#ef4444", cursor: "pointer",
            fontSize: "14px", fontWeight: "600"
          }}>Çıkış Yap</button>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  const userType = localStorage.getItem("userType");
  
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 60px)", background: "#f9fafb" }}>
        <Routes>
          <Route path="/" element={
            userType === "customer" ? <CustomerDashboard /> :
            <div>
              {/* Hero Section */}
              <div style={{
                background: "linear-gradient(135deg, #111 0%, #333 100%)",
                color: "#fff", textAlign: "center",
                padding: "80px 32px 60px",
              }}>
                <div style={{ fontSize: "52px", fontWeight: "800", marginBottom: "16px", letterSpacing: "-1px" }}>
                  MBrandev
                </div>
                <p style={{ fontSize: "22px", color: "#d1d5db", marginBottom: "16px" }}>
                  TEK TIKLA, EN HIZLISI.
                </p>
                <p style={{ fontSize: "15px", color: "#9ca3af", maxWidth: "500px", margin: "0 auto 40px" }}>
                  Bireylerin randevu oluşturmasını kolaylaştırırken işletmelerin de hizmetlerini dijital ortama taşımasını sağlayan modern platform.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <a href="/register" style={{ padding: "13px 32px", background: "#d087d6", color: "#000000", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>
                    İşletme Kaydı →
                  </a>
                  <a href="/login" style={{ padding: "13px 32px", background: "transparent", color: "#f9f9f9", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "15px", border: "1px solid rgba(255,255,255,0.3)" }}>
                    Giriş Yap
                  </a>
                </div>
              </div>

              {/* Product Image */}
              <div style={{ background: "#f3f4f6", padding: "40px 32px", textAlign: "center" }}>
                <img
                  src="/Product.png"
                  alt="MBrandev Platform"
                  style={{ maxWidth: "800px", width: "100%", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                  onError={(e) => e.target.style.display = "none"}
                />
              </div>

              {/* Features */}
              <div style={{ background: "#fff", padding: "60px 32px" }}>
                <h2 style={{ textAlign: "center", fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "40px" }}>
                  Neden MBrandev?
                </h2>
                <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
                  {[
                    { icon: "📅", title: "Kolay Randevu", desc: "Saniyeler içinde randevu oluşturun ve yönetin" },
                    { icon: "💬", title: "Müşteri Yorumları", desc: "Gerçek geri bildirimlerle hizmetinizi geliştirin" },
                    { icon: "🏢", title: "İşletme Paneli", desc: "İşletmenizi tamamen dijitale taşıyın" },
                    { icon: "⚡", title: "Hızlı & Güvenli", desc: "Modern altyapı ile kesintisiz hizmet" },
                  ].map((item) => (
                    <div key={item.title} style={{ background: "#f9fafb", borderRadius: "12px", padding: "28px 24px", width: "180px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>{item.icon}</div>
                      <div style={{ fontWeight: "600", fontSize: "15px", color: "#111", marginBottom: "8px" }}>{item.title}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />
          <Route path="/register" element={<BusinessRegister />} />
          <Route path="/login" element={<BusinessLogin />} />
          <Route path="/appointments" element={<BusinessAppointments />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />

          <Route path="/customer-appointments" element={<CustomerAppointments />} />
          <Route path="/customer-new-appointment" element={<CustomerCreateAppointment />} />
          <Route path="/book/:businessId" element={<BusinessProfile />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/business-services" element={<BusinessServices />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}