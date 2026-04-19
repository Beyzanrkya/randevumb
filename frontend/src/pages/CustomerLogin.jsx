import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Beyza'nın tasarım stiline uyum sağlamak için aynı CSS objelerini kullanıyoruz
const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#d087d6", color: "#000" // Müşteri girişi için mor tonu (Ana sayfadaki buton rengin)
};

export default function CustomerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // Senin Vercel backend linkin
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dökümanındaki 2. Metot: POST /customers/login
      const res = await axios.post(`${API_URL}/customers/login`, form);
      
      // Dökümanına göre gelen token'ı saklıyoruz
      localStorage.setItem("token", res.data.token);
      
      setMessage(res.data.message || "Giriş başarılı!");
      setIsError(false);

      // Başarılı girişten sonra müşteriyi ana sayfaya veya randevularına yönlendir
      setTimeout(() => navigate("/"), 1500);

    } catch (err) {
      // Backend'den gelen hata mesajını göster
      setMessage(err.response?.data?.message || "E-posta veya şifre hatalı");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "#111" }}>Müşteri Girişi</h2>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email"
          placeholder="Email (örn: mel_test2@gmail.com)" 
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
        <button type="submit" style={btnStyle}>Giriş Yap</button>
      </form>

      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
      
      <p style={{ marginTop: "20px", fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
        Hesabınız yok mu? <a href="/register" style={{ color: "#d087d6", fontWeight: "600", textDecoration: "none" }}>Kayıt Ol</a>
      </p>
    </div>
  );
}