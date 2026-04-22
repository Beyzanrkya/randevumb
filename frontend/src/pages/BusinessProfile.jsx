import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function BusinessProfile() {
  const { businessId: id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Randevu Formu State
  const [appointmentForm, setAppointmentForm] = useState({ serviceId: "", date: "", time: "" });
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentMsg, setAppointmentMsg] = useState({ text: "", isError: false });

  // Yorum Formu State
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const userType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busRes, srvRes, cmtRes] = await Promise.all([
          axios.get(`${API_URL}/businesses/${id}`),
          axios.get(`${API_URL}/services?businessId=${id}`),
          axios.get(`${API_URL}/comments?businessId=${id}`)
        ]);
        
        setBusiness(busRes.data);
        setServices(srvRes.data || []);
        setComments(cmtRes.data || []);

        if (srvRes.data && srvRes.data.length > 0) {
          setAppointmentForm(prev => ({ ...prev, serviceId: srvRes.data[0]._id }));
        }
      } catch (err) {
        console.error("Veriler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (userType !== "customer") {
      alert("Randevu almak için müşteri olarak giriş yapmalısınız.");
      return navigate("/customer-login");
    }

    setAppointmentLoading(true);
    try {
      await axios.post(`${API_URL}/appointments`, {
        businessId: id,
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (userType !== "customer") {
      alert("Yorum yapmak için müşteri olarak giriş yapmalısınız.");
      return navigate("/customer-login");
    }

    setCommentLoading(true);
    try {
      const customerId = localStorage.getItem("customerId");
      const res = await axios.post(`${API_URL}/comments`, {
        businessId: id,
        customerId,
        text: commentText,
        rating: commentRating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Yorum listesine ekle
      setComments([res.data.comment, ...comments]);
      setCommentText("");
      setCommentRating(5);
    } catch (err) {
      alert(err.response?.data?.message || "Yorum eklenirken hata oluştu");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "60px", textAlign: "center" }}>Yükleniyor...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center" }}>İşletme bulunamadı.</div>;

  return (
    <div style={{ background: "#faf8f5", minHeight: "calc(100vh - 60px)", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* İşletme Header */}
        <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: "120px", height: "120px", background: "#f5f3ef", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
            🏢
          </div>
          <div style={{ flex: "1" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 8px 0", color: "#111" }}>{business.name}</h1>
            <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 12px 0" }}>{business.description || "Bu işletme henüz bir açıklama eklememiş."}</p>
            <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#4b5563" }}>
              <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "8px", fontWeight: "700" }}>⭐ 4.5</span>
              <span>📍 {business.address || "Adres bilgisi yok"}</span>
              <span>📞 {business.phone || "Telefon yok"}</span>
            </div>
          </div>
        </div>

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
              
              {userType === "customer" && (
                <form onSubmit={handleAddComment} style={{ marginBottom: "24px", background: "#f9fafb", padding: "16px", borderRadius: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <select value={commentRating} onChange={e => setCommentRating(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", background: "#fff" }}>
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="İşletme hakkında yorumunuzu yazın..." 
                    value={commentText} onChange={e => setCommentText(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", minHeight: "80px", marginBottom: "12px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <button type="submit" disabled={commentLoading} style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                    {commentLoading ? "Gönderiliyor..." : "Yorumu Paylaş"}
                  </button>
                </form>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {comments.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                ) : (
                  comments.map(c => (
                    <div key={c._id} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px", color: "#111" }}>
                          {c.customerId?.name || "Anonim Kullanıcı"}
                        </span>
                        <span style={{ color: "#d97706", fontSize: "12px" }}>{"⭐".repeat(c.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sağ Kolon: Randevu Formu (Sticky) */}
          <div style={{ position: "sticky", top: "20px", alignSelf: "start" }}>
            <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(82,150,137,0.08)", border: "1px solid #e6f4f1" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "24px", color: "#111" }}>Hemen Randevu Al</h2>
              
              <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Hizmet Seçimi</label>
                  <select 
                    style={inputStyle} 
                    value={appointmentForm.serviceId}
                    onChange={(e) => setAppointmentForm({...appointmentForm, serviceId: e.target.value})} 
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
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})} required />
                </div>

                <div>
                  <label style={labelStyle}>Saat</label>
                  <input type="time" style={inputStyle} 
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})} required />
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
