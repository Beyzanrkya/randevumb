import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export default function BusinessRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/businesses/register`, form);
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>İşletme Kayıt</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="İşletme Adı" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <input type="password" placeholder="Şifre" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
        <button type="submit" style={btnStyle}>Kayıt Ol</button>
      </form>
      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
    </div>
  );
}