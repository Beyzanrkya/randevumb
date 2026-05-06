import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BusinessReviews() {
  console.log("BusinessReviews component rendering...");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const navigate = useNavigate();
  
  const API_URL = "http://localhost:5000/api";
  const businessId = localStorage.getItem("businessId");
  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/business/${businessId}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Yorumlar yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchReviews();
  }, [businessId, API_URL]);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return alert("Lütfen bir cevap yazın.");
    try {
      const res = await axios.post(`${API_URL}/reviews/${reviewId}/reply`, { reply: replyText });
      console.log("Cevap gönderildi:", res.data);
      setReplyText("");
      setReplyingTo(null);
      fetchReviews();
      alert("Cevabınız başarıyla gönderildi!");
    } catch (err) {
      console.error("Cevap gönderme hatası:", err.response?.data || err.message);
      alert("Cevap gönderilemedi: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1E2A40", marginBottom: "8px" }}>Müşteri Yorumları</h1>
      
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>Müşterilerinizin işletmeniz hakkında yaptığı tüm değerlendirmeler aşağıdadır.</p>

      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f9fafb", borderRadius: "20px", color: "#6b7280" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "16px" }}>💬</span>
          Henüz hiç yorum yapılmamış.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {reviews.map((r) => (
            <div key={r._id} style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "#111", fontSize: "16px", fontWeight: "700" }}>{r.customerId?.name || "Anonim Müşteri"}</h4>
                  <div style={{ color: "#d97706", fontSize: "14px" }}>
                    {"⭐".repeat(r.rating)}
                    <span style={{ color: "#9ca3af", marginLeft: "8px", fontSize: "12px" }}>
                      {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ margin: "0 0 16px 0", color: "#4b5563", lineHeight: "1.6", fontSize: "15px" }}>{r.comment}</p>

              {/* İşletme Cevabı Alanı */}
              {r.businessReply ? (
                <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #8E4A5D" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#8E4A5D", marginBottom: "4px" }}>İşletme Cevabı:</div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1E2A40" }}>{r.businessReply}</p>
                </div>
              ) : (
                <>
                  {replyingTo === r._id ? (
                    <div style={{ marginTop: "12px" }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Cevabınızı yazın..."
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleReply(r._id)} style={{ padding: "8px 16px", background: "#8E4A5D", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Gönder</button>
                        <button onClick={() => setReplyingTo(null)} style={{ padding: "8px 16px", background: "#f3f4f6", color: "#4b5563", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>İptal</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyingTo(r._id)} style={{ background: "none", border: "none", color: "#8E4A5D", cursor: "pointer", fontSize: "13px", fontWeight: "700", padding: 0 }}>Cevapla ↩</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
