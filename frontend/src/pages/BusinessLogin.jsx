import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#111", color: "#fff"
};

export default function BusinessLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/businesses/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("businessId", res.data.business._id);
      localStorage.setItem("userType", "business");
      setMessage(res.data.message);
      setIsError(false);
      
      setTimeout(() => {
        window.location.href = "/appointments";
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>İşletme Giriş</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <input type="password" placeholder="Şifre" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
        <button type="submit" style={btnStyle}>Giriş Yap</button>
      </form>
      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
    </div>
  );
}