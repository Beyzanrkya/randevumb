import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
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
import BusinessServices from "./pages/BusinessServices";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Navbar() {
  const location = useLocation();
  const links = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/register", label: "Kayıt" },
    { to: "/login", label: "Giriş" },
    { to: "/appointments", label: "Randevular" },
    { to: "/comments", label: "Yorumlar" },
    { to: "/categories", label: "Kategoriler" },
  ];

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "0 32px", display: "flex", alignItems: "center",
      height: "60px", gap: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      <span style={{ fontWeight: "700", fontSize: "18px", color: "#111", marginRight: "24px" }}>MBrandev</span>
      {links.map(link => (
        <Link key={link.to} to={link.to} style={{
          padding: "6px 14px", borderRadius: "6px", textDecoration: "none",
          fontSize: "14px", fontWeight: "500",
          color: location.pathname === link.to ? "#fff" : "#555",
          background: location.pathname === link.to ? "#111" : "transparent",
        }}>{link.label}</Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 60px)", background: "#f9fafb" }}>
        <Routes>
          <Route path="/" element={
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
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/customer-appointments" element={<CustomerAppointments />} />
          <Route path="/customer-new-appointment" element={<CustomerCreateAppointment />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/business-services" element={<BusinessServices />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}