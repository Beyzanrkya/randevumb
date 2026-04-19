import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

export default function Categories() {
  const [categoryId, setCategoryId] = useState("");
  const [category, setCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const getCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/categories/${categoryId}`);
      setCategory(res.data);
      setMessage("Kategori getirildi");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Kategori Listeleme</h2>
        <form onSubmit={getCategory}>
          <input placeholder="Kategori ID" value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)} style={inputStyle} />
          <button type="submit" style={{ padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: "#111", color: "#fff" }}>
            Kategori Getir
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "12px", fontSize: "13px", color: isError ? "#ef4444" : "#16a34a" }}>
            {isError ? "❌ " : "✅ "}{message}
          </p>
        )}

        {category && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>{category.category?.name}</h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>{category.category?.description}</p>
            {category.businesses?.length > 0 && (
              <>
                <h4 style={{ fontSize: "14px", fontWeight: "600", marginTop: "12px" }}>İşletmeler:</h4>
                <ul style={{ padding: 0, listStyle: "none" }}>
                  {category.businesses.map((b) => (
                    <li key={b._id} style={{ padding: "8px", background: "#f9fafb", borderRadius: "8px", marginBottom: "6px", fontSize: "14px" }}>
                      🏢 {b.name} — {b.email}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}