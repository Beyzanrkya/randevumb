import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

const btnStyle = (color) => ({
  padding: "10px 20px", borderRadius: "8px", border: "none",
  cursor: "pointer", fontSize: "14px", fontWeight: "600",
  background: color, color: "#fff", marginTop: "4px"
});

export default function BusinessAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [updateForm, setUpdateForm] = useState({ id: "", date: "", time: "", status: "confirmed" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem("token");
  const businessId = localStorage.getItem("businessId");

  const getAppointments = async () => {
    try {
      const res = await axios.get(`${API_URL}/appointments?businessId=${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments);
      setMessage("Randevular getirildi");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  const updateAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/appointments/${updateForm.id}`,
        { date: updateForm.date, time: updateForm.time, status: updateForm.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Randevuları Listele</h2>
        <button onClick={getAppointments} style={btnStyle("#111")}>Randevuları Getir</button>
        {appointments.length > 0 && (
          <ul style={{ marginTop: "16px", padding: 0, listStyle: "none" }}>
            {appointments.map((a) => (
              <li key={a._id} style={{ padding: "10px", background: "#f9fafb", borderRadius: "8px", marginBottom: "8px", fontSize: "14px" }}>
                📅 {a.date} ⏰ {a.time} — <strong>{a.status}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Randevu Güncelle</h2>
        <form onSubmit={updateAppointment}>
          <input placeholder="Randevu ID" value={updateForm.id}
            onChange={(e) => setUpdateForm({ ...updateForm, id: e.target.value })} style={inputStyle} />
          <input placeholder="Tarih (2026-04-10)" value={updateForm.date}
            onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })} style={inputStyle} />
          <input placeholder="Saat (14:00)" value={updateForm.time}
            onChange={(e) => setUpdateForm({ ...updateForm, time: e.target.value })} style={inputStyle} />
          <select value={updateForm.status}
            onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} style={inputStyle}>
            <option value="pending">Bekliyor</option>
            <option value="confirmed">Onaylandı</option>
            <option value="cancelled">İptal</option>
          </select>
          <button type="submit" style={btnStyle("#f59e0b")}>Güncelle</button>
        </form>
        {message && (
          <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
            {isError ? "❌ " : "✅ "}{message}
          </p>
        )}
      </div>
    </div>
  );
}