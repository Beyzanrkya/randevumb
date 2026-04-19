import { useState, useEffect } from "react";
import axios from "axios";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px", outline: "none"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#111", color: "#fff"
};

export default function CustomerProfile() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    // Not: Dökümanında /customers/{customerId} diyor. 
    // Eğer backend'de /customers/me ayarlıysa onu kullanmak daha güvenlidir.
    try {
      const res = await axios.put(`${API_URL}/customers/me`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Profil başarıyla güncellendi!");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Güncelleme başarısız");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Profil Ayarları</h2>
      <form onSubmit={handleUpdate}>
        <label style={{ fontSize: "13px", color: "#666", marginBottom: "4px", display: "block" }}>Ad Soyad</label>
        <input 
          placeholder="Yeni adınızı girin" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
          style={inputStyle} 
          required 
        />
        <button type="submit" style={btnStyle}>Bilgileri Güncelle</button>
      </form>
      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {message}
        </p>
      )}
    </div>
  );
}