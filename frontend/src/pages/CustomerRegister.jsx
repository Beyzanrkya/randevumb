import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function CustomerRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const handleSocialLogin = (platform) => {
    setMessage(`${platform} ile kayıt şu an aktif değil. Çok yakında hizmetinizde olacak!`);
    setIsError(true);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/customers/register`, form);
      
      setMessage(res.data.message || "Hesap oluşturuldu! E-posta doğrulama sayfasına yönlendiriliyorsunuz...");
      setIsError(false);

      setTimeout(() => navigate("/verify-email", { state: { email: form.email, type: "customer" } }), 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Kayıt sırasında bir hata oluştu");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* Left Side - Image */}
      <div className="auth-left">
        <img src="/ai_customer_register.png" alt="MBrandev Randevu" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 0 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(30, 42, 64, 0.3), rgba(142, 74, 93, 0.3))", zIndex: 1 }}></div>
        
        <div style={{ position: "relative", zIndex: 2, color: "#1E2A40", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", display: "inline-block", maxWidth: "500px" }}>
          <h2 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "16px", lineHeight: "1.2", letterSpacing: "-0.5px", color: "#1E2A40" }}>Hemen Başlayın</h2>
          <p style={{ fontSize: "18px", color: "#4b5563", lineHeight: "1.6", fontWeight: "500", margin: 0 }}>MBrandev hesabı oluşturarak favori işletmelerinizi takip edin, geçmiş randevularınızı görün ve yeni randevularınızı tek tıkla alın.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        
        <div style={{ width: "100%", maxWidth: "450px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "inline-block", padding: "6px 14px", background: "rgba(142, 74, 93, 0.1)", color: "#8E4A5D", borderRadius: "20px", fontWeight: "700", fontSize: "12px", marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>Müşteri Kaydı</div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1E2A40", marginBottom: "10px", letterSpacing: "-0.5px" }}>Aramıza Katılın</h2>
            <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.5" }}>Saniyeler içinde hesabınızı oluşturun ve güzellik dünyasını keşfedin.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Ad Soyad</label>
              <input 
                placeholder="Örn. Ayşe Yılmaz" 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                style={{ width: "100%", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e5e7eb", fontSize: "15px", outline: "none", transition: "all 0.2s", boxSizing: "border-box", background: "#f9fafb" }}
                onFocus={(e) => { e.target.style.borderColor = "#8E4A5D"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(142, 74, 93, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>E-posta Adresi</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: "100%", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e5e7eb", fontSize: "15px", outline: "none", transition: "all 0.2s", boxSizing: "border-box", background: "#f9fafb" }}
                onFocus={(e) => { e.target.style.borderColor = "#8E4A5D"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(142, 74, 93, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
                required
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Şifre</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ width: "100%", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e5e7eb", fontSize: "15px", outline: "none", transition: "all 0.2s", boxSizing: "border-box", background: "#f9fafb" }}
                onFocus={(e) => { e.target.style.borderColor = "#8E4A5D"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(142, 74, 93, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
                required
              />
            </div>
            
            <button type="submit" style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #1E2A40, #3A4D70)", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 25px rgba(30, 42, 64, 0.25)", transition: "all 0.3s", letterSpacing: "0.5px" }} disabled={loading} onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 30px rgba(30, 42, 64, 0.35)"; }} onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 25px rgba(30, 42, 64, 0.25)"; }}>
              {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
            </button>
          </form>

          {message && (
            <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "12px", background: isError ? "rgba(239, 68, 68, 0.08)" : "rgba(22, 163, 74, 0.08)", color: isError ? "#b91c1c" : "#15803d", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "500" }}>
              <span style={{ fontSize: "18px" }}>{isError ? "⚠️" : "✨"}</span> {message}
            </div>
          )}

          {/* Social Login Separator */}
          <div style={{ display: "flex", alignItems: "center", margin: "32px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
            <div style={{ padding: "0 16px", color: "#6b7280", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hızlı Kayıt Olun</div>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button 
              type="button" 
              onClick={() => handleSocialLogin("Google")}
              style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.2s" }} 
              onMouseOver={(e) => e.currentTarget.style.background = "#f9fafb"} 
              onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile Kayıt Ol
            </button>

            <button 
              type="button" 
              onClick={() => handleSocialLogin("Apple")}
              style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #1E2A40", background: "#1E2A40", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "all 0.2s" }} 
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.85"} 
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 13.91C17.07 10.63 19.8 9 19.92 8.93C18.23 6.45 15.55 6.06 14.63 5.96C12.59 5.75 10.6 7.16 9.55 7.16C8.5 7.16 6.84 5.96 5.16 5.99C3.12 6.02 1.25 7.18 0.22 8.98C-1.89 12.65 0.72 18.06 2.76 21C3.76 22.44 4.92 24 6.49 23.97C8.01 23.94 8.6 23.01 10.42 23.01C12.24 23.01 12.78 23.97 14.35 23.94C15.96 23.91 16.96 22.5 17.96 21.03C19.11 19.34 19.59 17.7 19.64 17.61C19.59 17.59 17.03 16.63 17.05 13.91Z" />
                <path d="M13.68 3.97C14.52 2.96 15.08 1.58 14.93 0.2C13.75 0.25 12.28 0.99 11.41 1.99C10.64 2.89 9.97 4.31 10.16 5.66C11.48 5.76 12.83 4.98 13.68 3.97Z" />
              </svg>
              Apple ile Devam Et
            </button>
          </div>

          <div style={{ marginTop: "40px", textAlign: "center", fontSize: "15px", color: "#6b7280", borderTop: "1px solid #f3f4f6", paddingTop: "30px" }}>
            Zaten bir hesabınız var mı? <br/>
            <Link to="/customer-login" style={{ color: "#8E4A5D", fontWeight: "700", textDecoration: "none", display: "inline-block", marginTop: "8px", transition: "opacity 0.2s" }} onMouseOver={(e) => e.target.style.opacity = "0.8"} onMouseOut={(e) => e.target.style.opacity = "1"}>Giriş Yapın</Link>
          </div>

        </div>
      </div>
    </div>
  );
}