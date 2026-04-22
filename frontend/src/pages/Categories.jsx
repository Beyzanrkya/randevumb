import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);
      } catch (err) {
        setMessage("Kategoriler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [API_URL]);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "24px", color: "#111", textAlign: "center" }}>
        Tüm Kategoriler
      </h2>

      {message && (
        <p style={{ textAlign: "center", color: "#ef4444", marginBottom: "16px" }}>{message}</p>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Kategoriler yükleniyor...</p>
      ) : categories.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Henüz hiç kategori bulunmuyor.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {categories.map((category) => (
            <div 
              key={category._id} 
              style={{
                background: "#fff", borderRadius: "12px", padding: "20px", textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"
              }}
            >
              <div style={{ fontSize: "40px", background: "#f9fafb", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                📁
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: 0 }}>
                {category.name}
              </h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                {category.description || "Açıklama bulunmuyor."}
              </p>
              
              <button 
                onClick={() => {
                  const userType = localStorage.getItem("userType");
                  if (userType === "customer") {
                    navigate("/");
                  } else {
                    navigate("/login");
                  }
                }}
                style={{
                  marginTop: "auto", padding: "8px 16px", borderRadius: "6px", border: "1px solid #e5e7eb",
                  background: "transparent", color: "#4b5563", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                }}
              >
                İşletmeleri Gör
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}