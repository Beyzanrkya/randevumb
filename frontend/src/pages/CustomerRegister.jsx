import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Beyza'nın tasarım stili (Sabit tutuyoruz)
const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#d087d6", color: "#000" 
};

export default function CustomerRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/customers/register`, form);
      
      setMessage(res.data.message || "Hesap başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");
      setIsError(false);

      setTimeout(() => navigate("/customer-login"), 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Kayıt sırasında bir hata oluştu");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>Müşteri Kayıt</h2>
      
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Ad Soyad" 
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          style={inputStyle} 
          required
        />
        <input 
          type="email"
          placeholder="Email" 
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          style={inputStyle} 
          required
        />
        <input 
          type="password" 
          placeholder="Şifre" 
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          style={inputStyle} 
          required
        />
        <button type="submit" style={btnStyle} disabled={loading}>{loading ? "Kaydediliyor..." : "Kayıt Ol"}</button>
      </form>

      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
    </div>
  );
}