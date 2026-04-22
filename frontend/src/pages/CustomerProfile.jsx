import { useState, useEffect } from "react";
import axios from "axios";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "16px",
  padding: "12px 16px", borderRadius: "10px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box", background: "#f9fafb", fontFamily: "inherit"
};

const labelStyle = {
  fontSize: "13px", color: "#4b5563", fontWeight: "700", marginBottom: "6px", display: "block"
};

const btnStyle = {
  width: "100%", padding: "14px", borderRadius: "10px",
  border: "none", cursor: "pointer", fontSize: "15px",
  fontWeight: "700", background: "#529689", color: "#fff", transition: "0.2s"
};

export default function CustomerProfile() {
  const [form, setForm] = useState({ name: "", phone: "", birthDate: "", profilePicture: "", email: "" });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "Giriş yapmanız gerekiyor.", isError: true });
        setFetching(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/customers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          birthDate: res.data.birthDate || "",
          profilePicture: res.data.profilePicture || "",
          email: res.data.email || ""
        });
      } catch (err) {
        setMessage({ text: err.response?.data?.message || "Profil bilgileri alınamadı.", isError: true });
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [API_URL]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`${API_URL}/customers/me`, {
        name: form.name,
        phone: form.phone,
        birthDate: form.birthDate,
        profilePicture: form.profilePicture
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.customer?.name) {
        localStorage.setItem("customerName", res.data.customer.name);
      }
      setMessage({ text: "Profiliniz başarıyla güncellendi!", isError: false });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Güncelleme başarısız", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#faf8f5", minHeight: "calc(100vh - 60px)", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
        
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "32px", color: "#111", textAlign: "center" }}>
          Profilim
        </h2>

        {fetching ? (
          <p style={{ color: "#6b7280", textAlign: "center" }}>Bilgileriniz yükleniyor...</p>
        ) : (
          <form onSubmit={handleUpdate}>
            
            {/* Profil Fotoğrafı Alanı */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
              <div style={{ 
                width: "120px", height: "120px", borderRadius: "50%", background: "#f3f4f6", 
                marginBottom: "16px", overflow: "hidden", display: "flex", alignItems: "center", 
                justifyContent: "center", border: "4px solid #fff", boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
              }}>
                {form.profilePicture ? (
                  <img src={form.profilePicture} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display='none'} />
                ) : (
                  <span style={{ fontSize: "48px" }}>👤</span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Profil fotoğrafı linki (URL) ekleyin" 
                value={form.profilePicture}
                onChange={(e) => setForm({...form, profilePicture: e.target.value})}
                style={{ ...inputStyle, width: "80%", textAlign: "center", marginBottom: 0, padding: "10px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Ad Soyad</label>
                <input
                  placeholder="Örn: Ayşe Yılmaz"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>E-posta Adresi (Değiştirilemez)</label>
                <input
                  value={form.email}
                  disabled
                  style={{ ...inputStyle, background: "#e5e7eb", color: "#6b7280", cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label style={labelStyle}>Telefon Numarası</label>
                <input
                  placeholder="05XX XXX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Doğum Tarihi</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={btnStyle} 
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.background = "#438074"}
              onMouseOut={(e) => e.currentTarget.style.background = "#529689"}
            >
              {loading ? "Kaydediliyor..." : "Bilgilerimi Kaydet"}
            </button>
          </form>
        )}

        {message.text && (
          <div style={{ 
            marginTop: "20px", padding: "16px", borderRadius: "12px", textAlign: "center",
            fontWeight: "600", fontSize: "14px",
            background: message.isError ? "#fef2f2" : "#ecfdf5", 
            color: message.isError ? "#ef4444" : "#10b981" 
          }}>
            {message.isError ? "❌ " : "✅ "}{message.text}
          </div>
        )}
      </div>
    </div>
  );
}