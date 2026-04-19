import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Randevuları getiren fonksiyon
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    try {
      // Dökümanındaki 5. Metot: GET /appointments
      const res = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments || []);
      setLoading(false);
    } catch (err) {
      console.error("Yükleme hatası:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Randevu silme fonksiyonu
  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;
    
    const token = localStorage.getItem("token");
    try {
      // Dökümanındaki 6. Metot: DELETE /appointments/{appointmentId}
      await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Randevu başarıyla silindi.");
      fetchAppointments(); // Listeyi güncelle
    } catch (err) {
      alert("Silme işlemi başarısız: " + (err.response?.data?.message || "Hata oluştu"));
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>Randevularım</h2>
      
      {loading ? <p>Yükleniyor...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {appointments.length > 0 ? appointments.map((app) => (
            <div key={app._id} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>{app.businessId?.name || "İşletme"}</div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                  📅 {app.date} | ⏰ {app.time}
                </div>
                <div style={{ 
                  marginTop: "8px", fontSize: "12px", padding: "4px 10px", 
                  borderRadius: "6px", display: "inline-block", fontWeight: "500",
                  background: app.status === "pending" ? "#fef3c7" : "#d1fae5",
                  color: app.status === "pending" ? "#92400e" : "#065f46"
                }}>
                  {app.status === "pending" ? "Beklemede" : "Onaylandı"}
                </div>
              </div>
              
              {/* SİLME BUTONU (6. Metot) */}
              <button 
                onClick={() => handleDelete(app._id)}
                style={deleteBtnStyle}
              >
                İptal Et
              </button>
            </div>
          )) : <p>Henüz bir randevunuz bulunmuyor.</p>}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff", padding: "20px", borderRadius: "12px",
  border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const deleteBtnStyle = {
  padding: "8px 16px", borderRadius: "8px", border: "1px solid #ef4444",
  background: "transparent", color: "#ef4444", cursor: "pointer",
  fontSize: "13px", fontWeight: "600", transition: "0.2s"
};