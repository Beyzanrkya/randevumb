import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function BusinessProfile() {
  const { businessId: id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Randevu Formu State
  const [appointmentForm, setAppointmentForm] = useState({ serviceId: "", date: "", time: "" });
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentMsg, setAppointmentMsg] = useState({ text: "", isError: false });

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const userType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [error, setError] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);

  // Yorum Düzenleme State'leri
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });

  const handleUpdateReview = async (reviewId) => {
    try {
      const res = await axios.put(`${API_URL}/reviews/${reviewId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, ...res.data.review } : r));
      setEditingReview(null);
    } catch (err) {
      alert("Yorum güncellenemedi: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("İşletme Detayı Yükleniyor, ID:", id);
      setLoading(true);
      setError(null);
      try {
        const busRes = await axios.get(`${API_URL}/businesses/${id}`);
        setBusiness(busRes.data);

        try {
          const srvRes = await axios.get(`${API_URL}/services?businessId=${id}`);
          setServices(srvRes.data || []);
          if (srvRes.data && srvRes.data.length > 0) {
            setAppointmentForm(prev => ({ ...prev, serviceId: srvRes.data[0]._id }));
          }
        } catch (e) { console.error("Hizmet hatası"); }

        try {
          const revRes = await axios.get(`${API_URL}/reviews/business/${id}`);
          setReviews(revRes.data || []);

          // Ortalama puan hesapla
          if (revRes.data && revRes.data.length > 0) {
            const total = revRes.data.reduce((acc, rev) => acc + rev.rating, 0);
            setAverageRating((total / revRes.data.length).toFixed(1));
          }
        } catch (e) { console.error("Yorum hatası"); }

      } catch (err) {
        console.error("API Hatası:", err);
        setError(err.response?.data?.message || err.message);
        setBusiness(null);
      } finally {
        setLoading(false);
      }

      // Sadakat Puanlarını Getir
      if (token && userType === "customer") {
        try {
          const lpRes = await axios.get(`${API_URL}/loyalty/business/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLoyaltyPoints(lpRes.data?.points || 0);
        } catch (e) { console.error("Puan yükleme hatası"); }
      }
    };
    if(id) fetchData();
  }, [id, API_URL]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (userType !== "customer") {
      alert("Randevu almak için müşteri olarak giriş yapmalısınız.");
      return navigate("/customer-login");
    }

    setAppointmentLoading(true);
    try {
      const customerId = localStorage.getItem("customerId");
      await axios.post(`${API_URL}/appointments`, {
        businessId: id,
        customerId,
        ...appointmentForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointmentMsg({ text: "Randevunuz başarıyla oluşturuldu!", isError: false });
      setTimeout(() => navigate("/customer-appointments"), 2000);
    } catch (err) {
      setAppointmentMsg({ text: err.response?.data?.message || "Hata oluştu", isError: true });
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!window.confirm("100 puanınızı bir ücretsiz hizmet için kullanmak istediğinize emin misiniz?")) return;
    setRedeemLoading(true);
    try {
      const res = await axios.post(`${API_URL}/loyalty/redeem`, { businessId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoyaltyPoints(res.data.remainingPoints);
      setRedemptionResult({
        code: res.data.redemptionCode,
        instructions: res.data.instructions
      });
    } catch (err) {
      alert(err.response?.data?.message || "Puan kullanılamadı.");
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "60px", textAlign: "center" }}>Yükleniyor...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center" }}>İşletme bulunamadı.</div>;

  return (
    <div style={{ background: "#faf8f5", minHeight: "calc(100vh - 60px)", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Hediye Kullanım Modal */}
      {redemptionResult && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#fff", padding: "40px", borderRadius: "32px",
            maxWidth: "450px", width: "100%", textAlign: "center",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)", position: "relative",
            animation: "modalFadeIn 0.4s ease-out"
          }}>
            <button 
              onClick={() => setRedemptionResult(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af" }}
            >✕</button>
            
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎁</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111", marginBottom: "12px" }}>Tebrikler!</h2>
            <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "24px", lineHeight: "1.5" }}>
              {redemptionResult.instructions}
            </p>

            <div style={{ 
              background: "#fdf2f8", border: "2px dashed #8E4A5D", 
              padding: "20px", borderRadius: "20px", marginBottom: "24px" 
            }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#8E4A5D", margin: "0 0 10px 0", textTransform: "uppercase" }}>Hediye Kodunuz</p>
              <div style={{ fontSize: "36px", fontWeight: "900", color: "#8E4A5D", letterSpacing: "4px" }}>
                {redemptionResult.code}
              </div>
            </div>

            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${redemptionResult.code}`} 
                alt="QR Code"
                style={{ width: "150px", height: "150px", borderRadius: "12px", border: "4px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
              />
            </div>

            <button 
              onClick={() => setRedemptionResult(null)}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                background: "#8E4A5D", color: "#fff", fontWeight: "700", fontSize: "16px",
                cursor: "pointer", boxShadow: "0 10px 20px rgba(142,74,93,0.3)"
              }}
            >
              Tamam, Kodu Kaydettim
            </button>
          </div>
          <style>{`
            @keyframes modalFadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* İşletme Header */}
        <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: "120px", height: "120px",
            background: business.imageUrl ? `url(${business.imageUrl}) center/cover` : "#f5f3ef",
            borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: business.imageUrl ? "none" : "1px solid #e5e7eb"
          }}>
            {!business.imageUrl && "🏢"}
          </div>
          <div style={{ flex: "1" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 8px 0", color: "#111" }}>{business.name}</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 12px 0" }}>{business.description || "Bu işletme henüz bir açıklama eklememiş."}</p>
            <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#4b5563" }}>
              <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "8px", fontWeight: "700" }}>
                ⭐ {averageRating > 0 ? averageRating : "Yeni"}
                {business.reviewCount > 0 && <span style={{ fontSize: "12px", opacity: 0.8, marginLeft: "4px" }}>({business.reviewCount} Yorum)</span>}
              </span>
              <span>📍 {business.address || "Adres bilgisi yok"}</span>
              <span>📞 {business.phone || "Telefon yok"}</span>
            </div>
          </div>
        </div>

        {/* İşletme Galerisi */}
        {business.gallery && business.gallery.length > 0 && (
          <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>Galeriden Görüntüler</h2>
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin" }}>
              {business.gallery.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Portfolio ${index}`}
                  style={{ width: "200px", height: "150px", borderRadius: "16px", objectFit: "cover", flexShrink: 0, border: "1px solid #f3f4f6" }}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>

          {/* Sol Kolon: Hizmetler ve Yorumlar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Hizmet Fiyat Listesi */}
            <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>Fiyat Listesi</h2>
              {services.length === 0 ? (
                <p style={{ color: "#6b7280", fontSize: "14px" }}>Bu işletme henüz hizmet eklememiş.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {services.map(srv => (
                    <div key={srv._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f9fafb", borderRadius: "12px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#111" }}>{srv.name}</h4>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>⏱ {srv.duration} Dakika</span>
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "#529689" }}>
                        {srv.price} TL
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Yorumlar Bölümü */}
            <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>Yorumlar ve Değerlendirmeler</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviews.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>Henüz yorum yapılmamış.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px", marginTop: r === reviews[0] ? 0 : "16px" }}>
                      {editingReview === r._id ? (
                        /* Düzenleme Formu */
                        <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Puan:</label>
                            <select 
                              value={editForm.rating} 
                              onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}
                            >
                              {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Yıldız</option>)}
                            </select>
                          </div>
                          <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ddd", minHeight: "80px", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button 
                              onClick={() => handleUpdateReview(r._id)}
                              style={{ padding: "8px 16px", background: "#529689", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                            >
                              Güncelle
                            </button>
                            <button 
                              onClick={() => setEditingReview(null)}
                              style={{ padding: "8px 16px", background: "#e5e7eb", color: "#4b5563", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Yorum Görünümü */
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontWeight: "700", fontSize: "14px", color: "#111" }}>
                                {r.customerId?.name || "Anonim Kullanıcı"}
                              </span>
                              <span style={{ color: "#d97706", fontSize: "12px" }}>{"⭐".repeat(r.rating)}</span>
                            </div>

                            {/* Kendi yorumuysa DÜZENLE ve SİL butonlarını göster */}
                            {userType === "customer" && localStorage.getItem("customerId") === r.customerId?._id && (
                              <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                  onClick={() => {
                                    setEditingReview(r._id);
                                    setEditForm({ rating: r.rating, comment: r.comment });
                                  }}
                                  style={{ background: "none", border: "none", color: "#529689", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
                                      try {
                                        await axios.delete(`${API_URL}/reviews/${r._id}`, {
                                          headers: { Authorization: `Bearer ${token}` }
                                        });
                                        setReviews(reviews.filter(item => item._id !== r._id));
                                      } catch (err) {
                                        alert("Yorum silinemedi.");
                                      }
                                    }
                                  }}
                                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                >
                                  Sil
                                </button>
                              </div>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>{r.comment}</p>

                          {/* İşletme Cevabı Gösterimi */}
                          {r.businessReply && (
                            <div style={{ marginTop: "12px", background: "#f3f4f6", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #8E4A5D" }}>
                              <div style={{ fontSize: "12px", fontWeight: "700", color: "#8E4A5D", marginBottom: "2px" }}>İşletmenin Cevabı:</div>
                              <p style={{ margin: 0, fontSize: "13px", color: "#1E2A40" }}>{r.businessReply}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sağ Kolon: Randevu Formu (Sticky) */}
          <div style={{ position: "sticky", top: "20px", alignSelf: "start", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Sadakat Paneli */}
            {userType === "customer" && (
              <div style={{ background: "linear-gradient(135deg, #8E4A5D 0%, #C28798 100%)", padding: "24px", borderRadius: "24px", color: "#fff", boxShadow: "0 10px 30px rgba(142,74,93,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Brandev Sadakat</h3>
                  <div style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>Puanlı Müşteri</div>
                </div>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "40px", fontWeight: "900" }}>{loyaltyPoints}</div>
                  <div style={{ fontSize: "14px", opacity: 0.9, fontWeight: "600" }}>Mevcut Puanınız</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.1)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ width: `${Math.min(loyaltyPoints, 100)}%`, height: "100%", background: "#fff" }}></div>
                </div>
                <p style={{ fontSize: "11px", opacity: 0.8, marginBottom: "20px", textAlign: "center" }}>100 puan biriktirin, bir sonraki hizmeti ücretsiz kapın!</p>
                <button 
                  onClick={handleRedeemPoints}
                  disabled={loyaltyPoints < 100 || redeemLoading}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "12px", border: "none",
                    background: loyaltyPoints >= 100 ? "#fff" : "rgba(255,255,255,0.2)",
                    color: loyaltyPoints >= 100 ? "#8E4A5D" : "#fff",
                    fontWeight: "800", cursor: loyaltyPoints >= 100 ? "pointer" : "not-allowed",
                    transition: "0.2s"
                  }}
                >
                  {redeemLoading ? "İşleniyor..." : loyaltyPoints >= 100 ? "🎁 Ödülü Kullan (100 Puan)" : "Yetersiz Puan"}
                </button>
              </div>
            )}

            <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(82,150,137,0.08)", border: "1px solid #e6f4f1" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "24px", color: "#111" }}>Hemen Randevu Al</h2>

              <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Hizmet Seçimi</label>
                  <select
                    style={inputStyle}
                    value={appointmentForm.serviceId}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceId: e.target.value })}
                    required
                  >
                    {services.length === 0 ? <option value="">Önce hizmet eklenmeli</option> : null}
                    {services.map(srv => (
                      <option key={srv._id} value={srv._id}>{srv.name} — {srv.price} TL</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Tarih</label>
                  <input type="date" style={inputStyle}
                    min={new Date().toISOString().split("T")[0]}
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })} required />
                </div>

                <div>
                  <label style={labelStyle}>Saat</label>
                  <input type="time" style={inputStyle}
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })} required />
                </div>

                <button type="submit" disabled={appointmentLoading || services.length === 0} style={{
                  width: "100%", padding: "16px", background: "#529689", color: "#fff",
                  border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px",
                  cursor: "pointer", marginTop: "8px", transition: "0.2s"
                }}>
                  {appointmentLoading ? "İşleniyor..." : "Randevuyu Onayla"}
                </button>
              </form>

              {appointmentMsg.text && (
                <p style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", textAlign: "center", background: appointmentMsg.isError ? "#fef2f2" : "#ecfdf5", color: appointmentMsg.isError ? "#ef4444" : "#10b981" }}>
                  {appointmentMsg.text}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: "13px", color: "#4b5563", fontWeight: "700", marginBottom: "8px", display: "block"
};

const inputStyle = {
  width: "100%", padding: "14px 16px", borderRadius: "12px",
  border: "1px solid #e5e7eb", fontSize: "14px", outline: "none",
  backgroundColor: "#f9fafb", boxSizing: "border-box", fontFamily: "inherit"
};
