import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px", outline: "none"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#d087d6", color: "#000"
};

export default function CustomerCreateAppointment() {
  const [formData, setFormData] = useState({
    businessId: "",
    serviceId: "",
    date: "",
    time: ""
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      // Dökümanındaki 4. Metot: POST /appointments
      const res = await axios.post(`${API_URL}/appointments`, formData, {
        headers: { Authorization: `Bearer ${token}` } // Token şart
      });

      setMessage("Randevu başarıyla oluşturuldu!");
      setIsError(false);
      setTimeout(() => navigate("/customer-appointments"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Randevu oluşturulamadı");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", background: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Yeni Randevu Al</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: "13px", color: "#666" }}>İşletme ID</label>
        <input style={inputStyle} placeholder="Örn: 69d29fa..." 
          onChange={(e) => setFormData({...formData, businessId: e.target.value})} required />
        
        <label style={{ fontSize: "13px", color: "#666" }}>Hizmet ID</label>
        <input style={inputStyle} placeholder="Örn: 69d2aef..." 
          onChange={(e) => setFormData({...formData, serviceId: e.target.value})} required />

        <label style={{ fontSize: "13px", color: "#666" }}>Tarih</label>
        <input type="date" style={inputStyle} 
          onChange={(e) => setFormData({...formData, date: e.target.value})} required />

        <label style={{ fontSize: "13px", color: "#666" }}>Saat</label>
        <input type="time" style={inputStyle} 
          onChange={(e) => setFormData({...formData, time: e.target.value})} required />

        <button type="submit" style={btnStyle}>Randevuyu Onayla</button>
      </form>
      {message && <p style={{ marginTop: "12px", color: isError ? "red" : "green" }}>{message}</p>}
    </div>
  );
}