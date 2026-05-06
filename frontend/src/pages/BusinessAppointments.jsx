import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// --- Icons ---
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

// --- Styles ---
const theme = {
  primary: "#8E4A5D", // Pink 500
  primaryHover: "#6B3545", // Pink 700
  secondary: "#C28798", // Pink 200
  bg: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)", // Pink 50 to Pink 100
  cardBg: "rgba(255, 255, 255, 0.85)", // Glassmorphism
  textMain: "#1E2A40",
  textMuted: "#6b7280",
  border: "#f3f4f6",
  success: "#10b981",
  error: "#ef4444",
};

export default function BusinessAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [updateForm, setUpdateForm] = useState({ id: "", date: "", time: "", status: "confirmed", note: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const businessId = localStorage.getItem("businessId");
  const navigate = useNavigate();

  const getAppointments = useCallback(async () => {
    if (!businessId || businessId === "null") {
      setMessage("İşletme seçilmedi. Lütfen işletme seçin.");
      setIsError(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/appointments?businessId=${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments || []);
      setMessage("Randevular başarıyla getirildi.");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Bir hata oluştu.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => {
    if (!token) {
      navigate("/business-login");
    } else if (!businessId || businessId === "null") {
      navigate("/select-business");
    } else {
      getAppointments();
    }
  }, [token, businessId, navigate, getAppointments]);

  const updateAppointment = async (e) => {
    e.preventDefault();
    if (!updateForm.id) {
      setMessage("Lütfen bir randevu ID girin.");
      setIsError(true);
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/appointments/${updateForm.id}`,
        { date: updateForm.date, time: updateForm.time, status: updateForm.status, note: updateForm.note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Randevu güncellendi.");
      setIsError(false);
      getAppointments(); // Refresh list after update
    } catch (err) {
      setMessage(err.response?.data?.message || "Güncelleme sırasında hata oluştu.");
      setIsError(true);
    }
  };

  // Status badge style helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed": return { bg: "#d1fae5", color: "#065f46", label: "Onaylandı" };
      case "pending": return { bg: "#fef3c7", color: "#92400e", label: "Bekliyor" };
      case "cancelled": return { bg: "#fee2e2", color: "#991b1b", label: "İptal" };
      case "completed": return { bg: "#e0e7ff", color: "#3730a3", label: "Tamamlandı" };
      default: return { bg: "#f3f4f6", color: "#374151", label: status };
    }
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
            İşletme Randevuları
          </h1>
          <p style={{ color: theme.textMuted, fontSize: "16px", margin: 0, fontWeight: "500" }}>
            Tüm randevularınızı tek bir yerden kolayca yönetin.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: theme.primary }}><CalendarIcon /></span> Randevu Listesi
              </h2>
              <button
                onClick={getAppointments}
                disabled={isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px", borderRadius: "12px", border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: "600",
                  background: theme.secondary, color: theme.primaryHover,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#fce7f3"}
                onMouseOut={(e) => e.currentTarget.style.background = theme.secondary}
              >
                <RefreshIcon /> {isLoading ? "Yükleniyor..." : "Yenile"}
              </button>
            </div>

            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted, background: "rgba(255,255,255,0.5)", borderRadius: "16px" }}>
                <div style={{ opacity: 0.4, marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <p style={{ fontWeight: "500" }}>Henüz randevu bulunmuyor veya getirilmedi.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "500px", paddingRight: "8px" }}>
                {appointments.map((a) => {
                  const statusInfo = getStatusStyle(a.status);
                  return (
                    <div key={a._id} onClick={() => setUpdateForm({ id: a._id, date: a.date, time: a.time, status: a.status, note: a.note || "" })} style={{
                      padding: "20px", 
                      background: a.status === "pending" ? "#FFFBEB" : "#fff", 
                      borderRadius: "16px",
                      boxShadow: a.status === "pending" ? "0 4px 15px rgba(245, 158, 11, 0.1)" : "0 4px 15px rgba(0,0,0,0.03)", 
                      border: a.status === "pending" ? "1px solid #FEF3C7" : "1px solid #f3f4f6",
                      cursor: "pointer", transition: "all 0.2s ease"
                    }}
                      onMouseOver={(e) => { 
                        e.currentTarget.style.transform = "translateY(-4px)"; 
                        e.currentTarget.style.boxShadow = a.status === "pending" ? "0 12px 25px rgba(245, 158, 11, 0.2)" : "0 12px 25px rgba(142, 74, 93, 0.12)"; 
                        e.currentTarget.style.borderColor = a.status === "pending" ? "#F59E0B" : theme.secondary; 
                      }}
                      onMouseOut={(e) => { 
                        e.currentTarget.style.transform = "translateY(0)"; 
                        e.currentTarget.style.boxShadow = a.status === "pending" ? "0 4px 15px rgba(245, 158, 11, 0.1)" : "0 4px 15px rgba(0,0,0,0.03)"; 
                        e.currentTarget.style.borderColor = a.status === "pending" ? "#FEF3C7" : "#f3f4f6"; 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{
                          fontSize: "13px", fontWeight: "700", padding: "6px 12px",
                          borderRadius: "24px", background: statusInfo.bg, color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                        <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>ID: {a._id.substring(0, 6)}...</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                          <span style={{ color: theme.primary, display: "flex" }}><CalendarIcon /></span> {a.date}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                          <span style={{ color: theme.primary, display: "flex" }}><ClockIcon /></span> {a.time}
                        </div>
                        {a.note && (
                          <div style={{ marginTop: "8px", padding: "10px", background: "rgba(243, 244, 246, 0.7)", borderRadius: "8px", fontSize: "13px", color: "#4b5563", fontStyle: "italic", borderLeft: `3px solid ${theme.primary}` }}>
                            <span style={{ fontWeight: "700", color: "#374151" }}>Açıklama:</span> {a.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Update Section */}
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
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: theme.primary }}><EditIcon /></span> Randevu Güncelle
            </h2>
            <p style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "28px", lineHeight: "1.5" }}>
              Listeden bir randevuya tıklayarak bilgilerini buraya taşıyabilir ve durumunu değiştirebilirsiniz.
            </p>

            <form onSubmit={updateAppointment} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Randevu ID</label>
                <input placeholder="Örn: 60d5ecb..." value={updateForm.id}
                  onChange={(e) => setUpdateForm({ ...updateForm, id: e.target.value })}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid #f3f4f6", fontSize: "15px", outline: "none",
                    boxSizing: "border-box", transition: "all 0.2s",
                    background: "#f9fafb", color: "#374151", fontWeight: "500"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Tarih</label>
                  <input type="date" value={updateForm.date}
                    onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: "12px",
                      border: "2px solid #f3f4f6", fontSize: "15px", outline: "none",
                      boxSizing: "border-box", transition: "all 0.2s",
                      background: "#f9fafb", color: "#374151", fontWeight: "500", fontFamily: "inherit"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Saat</label>
                  <input type="time" value={updateForm.time}
                    onChange={(e) => setUpdateForm({ ...updateForm, time: e.target.value })}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: "12px",
                      border: "2px solid #f3f4f6", fontSize: "15px", outline: "none",
                      boxSizing: "border-box", transition: "all 0.2s",
                      background: "#f9fafb", color: "#374151", fontWeight: "500", fontFamily: "inherit"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Durum</label>
                <select value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid #f3f4f6", fontSize: "15px", outline: "none",
                    boxSizing: "border-box", transition: "all 0.2s",
                    appearance: "none", background: "#f9fafb url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\") no-repeat right 16px center / 16px",
                    color: "#374151", fontWeight: "500"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\") no-repeat right 16px center / 16px"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\") no-repeat right 16px center / 16px"; }}
                >
                  <option value="pending">Bekliyor</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Not / Açıklama (İsteğe Bağlı)</label>
                <textarea 
                  placeholder="İptal veya değişiklik nedenini yazabilirsiniz..." 
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  rows="3"
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid #f3f4f6", fontSize: "14px", outline: "none",
                    boxSizing: "border-box", transition: "all 0.2s",
                    background: "#f9fafb", color: "#374151", fontWeight: "500",
                    resize: "vertical"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              <button type="submit" style={{
                width: "100%", padding: "16px 20px", borderRadius: "12px", border: "none",
                cursor: "pointer", fontSize: "16px", fontWeight: "700",
                background: theme.primary, color: "#fff", marginTop: "8px",
                boxShadow: "0 8px 20px rgba(142, 74, 93, 0.3)",
                transition: "all 0.2s",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = theme.primaryHover; e.currentTarget.style.boxShadow = "0 8px 25px rgba(142, 74, 93, 0.5)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = theme.primary; e.currentTarget.style.boxShadow = "0 8px 20px rgba(142, 74, 93, 0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              >
                <EditIcon /> Değişiklikleri Kaydet
              </button>
            </form>

            {message && (
              <div style={{
                marginTop: "24px", padding: "16px", borderRadius: "12px",
                fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px",
                background: isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                color: isError ? theme.error : theme.success,
                border: `1px solid ${isError ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
              }}>
                {isError ? "❌ " : "✅ "}{message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}