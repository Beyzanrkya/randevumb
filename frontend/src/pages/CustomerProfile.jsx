import { useState, useEffect } from "react";
import axios from "axios";

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

export default function CustomerProfile() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Sayfa açılınca mevcut profil bilgilerini çek
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Giriş yapmanız gerekiyor.");
        setIsError(true);
        setFetching(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/customers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || ""
        });
      } catch (err) {
        setMessage(err.response?.data?.message || "Profil bilgileri alınamadı.");
        setIsError(true);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`${API_URL}/customers/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Güncellenen ismi localStorage'a da yansıt
      if (res.data.customer?.name) {
        localStorage.setItem("customerName", res.data.customer.name);
      }
      setMessage("Profil başarıyla güncellendi!");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Güncelleme başarısız");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Profil Ayarları</h2>

      {fetching ? (
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Yükleniyor...</p>
      ) : (
        <form onSubmit={handleUpdate}>
          <label style={{ fontSize: "13px", color: "#666", marginBottom: "4px", display: "block" }}>Ad Soyad</label>
          <input
            placeholder="Adınızı girin"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
            required
          />
          <label style={{ fontSize: "13px", color: "#666", marginBottom: "4px", display: "block" }}>Telefon</label>
          <input
            placeholder="Telefon numaranızı girin"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={inputStyle}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Güncelleniyor..." : "Bilgileri Güncelle"}
          </button>
        </form>
      )}

      {message && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
    </div>
  );
}