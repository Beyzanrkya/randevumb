import { useState, useEffect } from "react";
import axios from "axios";

// --- Icons ---
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

// --- Theme ---
const theme = {
  primary: "#8E4A5D",
  primaryHover: "#6B3545",
  secondary: "#C28798",
  bg: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)",
  cardBg: "rgba(255, 255, 255, 0.85)",
  textMain: "#1E2A40",
  textMuted: "#6b7280",
  border: "#f3f4f6",
  success: "#10b981",
  error: "#ef4444",
};

export default function BusinessServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "", duration: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const businessId = localStorage.getItem("businessId");
  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services?businessId=${businessId}`);
      setServices(res.data);
    } catch (err) {
      console.error("Hizmetler yüklenemedi", err);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/services/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Hizmet güncellendi!");
      } else {
        await axios.post(`${API_URL}/services`, { ...formData, businessId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Yeni hizmet eklendi!");
      }
      setIsError(false);
      setFormData({ name: "", price: "", duration: "", description: "" });
      setEditingId(null);
      fetchServices();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("İşlem başarısız.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setFormData({ name: service.name, price: service.price, duration: service.duration, description: service.description || "" });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", duration: "", description: "" });
    setMessage("");
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: `2px solid ${theme.border}`, fontSize: "15px", outline: "none",
    boxSizing: "border-box", transition: "all 0.2s",
    background: "#f9fafb", color: theme.textMain, fontWeight: "500"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      padding: "40px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: theme.textMain
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header Section */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: theme.primaryHover, margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            Hizmetleri Yönet
          </h1>
          <p style={{ color: theme.textMuted, fontSize: "16px", margin: 0, fontWeight: "500" }}>
            İşletmenize ait hizmetleri ekleyin, düzenleyin ve fiyatlandırın.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
          
          {/* Form Section */}
          <div style={{
            background: theme.cardBg,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(142, 74, 93, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            height: "fit-content"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: theme.primary }}>{editingId ? <EditIcon /> : <PlusIcon />}</span> 
              {editingId ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Hizmet Adı</label>
                <input placeholder="Örn: Saç Kesimi" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required 
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Fiyat (TL)</label>
                  <input type="number" placeholder="Örn: 250" value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})} required 
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = "#f9fafb"; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Süre (Dakika)</label>
                  <input type="number" placeholder="Örn: 45" value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})} required 
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = "#f9fafb"; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Açıklama (İsteğe Bağlı)</label>
                <textarea placeholder="Hizmetin neleri kapsadığını yazabilirsiniz..." value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  style={{...inputStyle, resize: "vertical"}}
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" disabled={isLoading} style={{
                  flex: 1, padding: "16px", borderRadius: "12px", border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer", fontSize: "16px", fontWeight: "700",
                  background: theme.primary, color: "#fff",
                  boxShadow: "0 8px 20px rgba(142, 74, 93, 0.3)",
                  transition: "all 0.2s",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
                }}
                  onMouseOver={(e) => { e.currentTarget.style.background = theme.primaryHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = theme.primary; e.currentTarget.style.transform = "translateY(0)"; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                  onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                >
                  {isLoading ? "İşleniyor..." : (editingId ? "Değişiklikleri Kaydet" : "Hizmeti Ekle")}
                </button>
                
                {editingId && (
                  <button type="button" onClick={cancelEdit} style={{
                    padding: "16px 24px", borderRadius: "12px", border: "none",
                    cursor: "pointer", fontSize: "16px", fontWeight: "600",
                    background: "#f3f4f6", color: "#4b5563",
                    transition: "all 0.2s"
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                  >
                    İptal
                  </button>
                )}
              </div>

              {message && (
                <div style={{
                  marginTop: "16px", padding: "16px", borderRadius: "12px",
                  fontSize: "14px", fontWeight: "600", textAlign: "center",
                  background: isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                  color: isError ? theme.error : theme.success,
                  border: `1px solid ${isError ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
                }}>
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* List Section */}
          <div style={{
            background: theme.cardBg,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(142, 74, 93, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            display: "flex", flexDirection: "column"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: theme.primary }}><ListIcon /></span> Mevcut Hizmetleriniz
            </h2>

            {services.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted, background: "rgba(255,255,255,0.5)", borderRadius: "16px" }}>
                <p style={{ fontWeight: "500" }}>Henüz hizmet eklemediniz.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "500px", paddingRight: "8px" }}>
                {services.map((service) => (
                  <div key={service._id} style={{
                    padding: "20px", background: "#fff", borderRadius: "16px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f3f4f6",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.2s ease"
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 25px rgba(142, 74, 93, 0.12)"; e.currentTarget.style.borderColor = theme.secondary; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "#f3f4f6"; }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: theme.textMain }}>{service.name}</h3>
                      {service.description && (
                        <p style={{ fontSize: "14px", color: theme.textMuted, margin: "0 0 10px 0", lineHeight: "1.5", fontStyle: "italic" }}>
                          {service.description}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "12px", fontSize: "14px", fontWeight: "500", color: theme.textMuted }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>⏱ {service.duration} Dk.</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: theme.primaryHover }}>💰 {service.price} ₺</span>
                      </div>
                    </div>
                    
                    <button onClick={() => startEdit(service)} style={{
                      background: "rgba(142, 74, 93, 0.1)", color: theme.primary,
                      border: "none", borderRadius: "10px", padding: "10px",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "0.2s"
                    }}
                      onMouseOver={(e) => { e.currentTarget.style.background = theme.primary; e.currentTarget.style.color = "#fff"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(142, 74, 93, 0.1)"; e.currentTarget.style.color = theme.primary; }}
                      title="Düzenle"
                    >
                      <EditIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}