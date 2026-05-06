import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Randevuları getiren fonksiyon
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    try {
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
      await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Randevu başarıyla silindi.");
      fetchAppointments();
    } catch (err) {
      alert("Silme işlemi başarısız: " + (err.response?.data?.message || "Hata oluştu"));
    }
  };
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  // Yorum gönderme fonksiyonu
  const handleReviewSubmit = async (e, app) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/reviews`, {
        businessId: app.businessId._id,
        appointmentId: app._id,
        customerId: localStorage.getItem("customerId"),
        rating: reviewData.rating,
        comment: reviewData.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Yorumunuz için teşekkürler! 😊");
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: "" });
    } catch (err) {
      alert("Yorum gönderilemedi: " + (err.response?.data?.message || "Lütfen tekrar deneyin."));
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>Randevularım</h2>

      {loading ? <p>Yükleniyor...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {appointments.length > 0 ? appointments.map((app) => (
            <div key={app._id} style={{ ...cardStyle, flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>{app.businessId?.name || "İşletme"}</div>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                    📅 {app.date} | ⏰ {app.time}
                  </div>
                  <div style={{
                    marginTop: "8px", fontSize: "12px", padding: "4px 10px",
                    borderRadius: "6px", display: "inline-block", fontWeight: "600",
                    background: app.status === "pending" ? "#fef3c7" : 
                               (app.status === "cancelled" ? "#fee2e2" : 
                               (app.status === "completed" ? "#e0e7ff" : "#d1fae5")),
                    color: app.status === "pending" ? "#92400e" : 
                           (app.status === "cancelled" ? "#b91c1c" : 
                           (app.status === "completed" ? "#3730a3" : "#065f46"))
                  }}>
                    {app.status === "pending" ? "Beklemede" : 
                     (app.status === "cancelled" ? "İptal Edildi" : 
                     (app.status === "completed" ? "Tamamlandı" : "Onaylandı"))}
                  </div>

                  {app.note && (
                    <div style={{
                      marginTop: "12px", padding: "8px 12px", background: "#f9fafb",
                      borderRadius: "8px", fontSize: "13px", color: "#4b5563",
                      borderLeft: "3px solid #1E2A40", fontStyle: "italic"
                    }}>
                      <span style={{ fontWeight: "700", color: "#1E2A40", fontStyle: "normal" }}>İşletme Notu:</span> {app.note}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {(app.status === "confirmed" || app.status === "completed") && (
                    <button
                      onClick={() => setShowReviewForm(showReviewForm === app._id ? null : app._id)}
                      style={{ ...deleteBtnStyle, borderColor: "#1E2A40", color: "#1E2A40" }}
                    >
                      {showReviewForm === app._id ? "Vazgeç" : "⭐ Yorum Yap"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(app._id)}
                    style={deleteBtnStyle}
                  >
                    İptal Et
                  </button>
                </div>
              </div>

              {/* Yorum Formu */}
              {showReviewForm === app._id && (
                <form onSubmit={(e) => handleReviewSubmit(e, app)} style={{ marginTop: "20px", padding: "20px", background: "#fdf2f8", borderRadius: "12px", border: "1px solid #fce7f3" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Puanınız:</label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (Mükemmel)</option>
                      <option value="4">⭐⭐⭐⭐ (Çok İyi)</option>
                      <option value="3">⭐⭐⭐ (İyi)</option>
                      <option value="2">⭐⭐ (Kötü)</option>
                      <option value="1">⭐ (Çok Kötü)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Yorumunuz:</label>
                    <textarea
                      placeholder="Hizmetten memnun kaldınız mı? Buraya yazabilirsiniz..."
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", minHeight: "80px" }}
                    />
                  </div>
                  <button type="submit" style={{ width: "100%", padding: "10px", background: "#1E2A40", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                    Gönder
                  </button>
                </form>
              )}
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