import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BusinessSelect() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState({ name: "", email: "", phone: "", address: "" });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("token");

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${API_URL}/businesses/my-businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusinesses(res.data);
    } catch (err) {
      setError("İşletmeler getirilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBusinesses();
    } else {
      navigate("/login");
    }
  }, [token, navigate, API_URL]);

  const handleSelectBusiness = (businessId, businessName) => {
    localStorage.setItem("businessId", businessId);
    localStorage.setItem("businessName", businessName);
    localStorage.setItem("userType", "business"); 
    navigate("/business-hub");
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg({ type: "", text: "" });
    try {
      const res = await axios.post(`${API_URL}/businesses`, newBusiness, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreateMsg({ type: "success", text: "Yeni işletme başarıyla oluşturuldu." });
      setNewBusiness({ name: "", email: "", phone: "", address: "" });
      setShowNewForm(false);
      fetchBusinesses(); // Refresh list
    } catch (err) {
      setCreateMsg({ type: "error", text: err.response?.data?.message || "Hata oluştu." });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#FAF7F8", color: "#1E2A40", fontWeight: "600", fontSize: "18px" }}>İşletmeler Yükleniyor...</div>;
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)",
      padding: "60px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#1E2A40", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            İşletmeleriniz
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", fontWeight: "500" }}>
            Yönetmek istediğiniz işletmeyi seçin veya yeni bir işletme ekleyin.
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontWeight: "600", textAlign: "center" }}>
            {error}
          </div>
        )}
        
        {createMsg.text && (
          <div style={{ background: createMsg.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: createMsg.type === "error" ? "#ef4444" : "#10b981", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontWeight: "600", textAlign: "center" }}>
            {createMsg.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {businesses.map((b) => (
            <div 
              key={b._id} 
              onClick={() => handleSelectBusiness(b._id, b.name)}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                padding: "32px",
                borderRadius: "24px",
                boxShadow: "0 10px 30px rgba(142, 74, 93, 0.1)",
                border: "1px solid rgba(255,255,255,0.6)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px"
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = "translateY(-5px)"; 
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(142, 74, 93, 0.2)"; 
                e.currentTarget.style.borderColor = "#C28798";
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = "translateY(0)"; 
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(142, 74, 93, 0.1)"; 
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
              }}
            >
              <div style={{ width: "64px", height: "64px", background: "#FAF7F8", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E4A5D" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1E2A40", margin: "0 0 8px 0" }}>{b.name}</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, fontWeight: "500" }}>{b.email}</p>
              </div>
              <div style={{ marginTop: "8px", padding: "8px 24px", borderRadius: "12px", background: "#1E2A40", color: "#fff", fontSize: "14px", fontWeight: "600", transition: "opacity 0.2s" }}>
                Giriş Yap →
              </div>
            </div>
          ))}

          {/* Create New Business Card / Form */}
          {!showNewForm ? (
            <div 
              onClick={() => setShowNewForm(true)}
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
                padding: "32px",
                borderRadius: "24px",
                border: "2px dashed #C28798",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                minHeight: "250px"
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                e.currentTarget.style.borderColor = "#8E4A5D";
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
                e.currentTarget.style.borderColor = "#C28798";
              }}
            >
              <div style={{ width: "64px", height: "64px", background: "#8E4A5D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#8E4A5D", margin: 0 }}>Yeni İşletme Ekle</h3>
            </div>
          ) : (
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              padding: "32px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(142, 74, 93, 0.15)",
              border: "1px solid #C28798",
              gridColumn: "1 / -1", // Span all columns if needed, but let's just let it fit. Actually spanning all is better for a form.
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1E2A40", margin: 0 }}>Yeni İşletme Bilgileri</h3>
                <button onClick={() => setShowNewForm(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>×</button>
              </div>
              <form onSubmit={handleCreateBusiness} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>İşletme Adı</label>
                  <input required value={newBusiness.name} onChange={e => setNewBusiness({...newBusiness, name: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", background: "#f9fafb" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>E-posta (İletişim)</label>
                  <input required type="email" value={newBusiness.email} onChange={e => setNewBusiness({...newBusiness, email: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", background: "#f9fafb" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Telefon</label>
                  <input value={newBusiness.phone} onChange={e => setNewBusiness({...newBusiness, phone: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", background: "#f9fafb" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Adres</label>
                  <input value={newBusiness.address} onChange={e => setNewBusiness({...newBusiness, address: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e5e7eb", outline: "none", background: "#f9fafb" }} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                  <button type="button" onClick={() => setShowNewForm(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#f3f4f6", color: "#4b5563", fontWeight: "600", cursor: "pointer" }}>İptal</button>
                  <button type="submit" disabled={creating} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#8E4A5D", color: "#fff", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(142, 74, 93,0.3)" }}>
                    {creating ? "Oluşturuluyor..." : "İşletmeyi Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
