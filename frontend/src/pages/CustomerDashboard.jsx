import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, busRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/businesses`)
        ]);
        setCategories(catsRes.data || []);
        setBusinesses(busRes.data || []);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      }
    };
    fetchData();
  }, [API_URL]);

  const filteredBusinesses = businesses.filter(b => {
    const matchesCat = selectedCategory === "all" || (b.categoryId && b.categoryId._id === selectedCategory);
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 60px)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header / Search */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#111", marginBottom: "16px" }}>Randevu Al</h1>
          <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto" }}>
            <input 
              type="text" 
              placeholder="🔍 Seçtiğiniz Randevu Salonu veya Kategori Ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: "30px", border: "1px solid #e5e7eb",
                fontSize: "15px", outline: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "24px", justifyContent: "center" }}>
          <button 
            onClick={() => setSelectedCategory("all")}
            style={tabStyle(selectedCategory === "all")}
          >
            Tüm Hizmetler
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              style={tabStyle(selectedCategory === cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Business Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filteredBusinesses.map(business => (
            <div key={business._id} style={{
              background: "#fff", borderRadius: "16px", padding: "20px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6",
              display: "flex", flexDirection: "column", gap: "12px"
            }}>
              <div style={{ height: "140px", background: "#e5e7eb", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                {/* Fallback image representation */}
                🏢
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>{business.name}</h3>
                  <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                    ⭐ 4.5
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>
                  {business.categoryId?.name || "Genel"} Hizmetleri
                </p>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                  📍 {business.address || "Adres belirtilmemiş"}
                </p>
              </div>

              {/* Time Slots (Mockup for UI fidelity) */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                <span style={timeSlotStyle}>09:00</span>
                <span style={timeSlotStyle}>10:00</span>
                <span style={timeSlotStyle}>13:30</span>
                <span style={timeSlotStyle}>15:00</span>
              </div>

              <button 
                onClick={() => navigate(`/book/${business._id}`)}
                style={{
                  width: "100%", padding: "12px", background: "#38bdf8", color: "#fff",
                  border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px",
                  cursor: "pointer", marginTop: "auto", transition: "0.2s"
                }}
              >
                Randevu Al
              </button>
            </div>
          ))}
          
          {filteredBusinesses.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#6b7280" }}>
              Aradığınız kriterlere uygun işletme bulunamadı.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "10px 20px", borderRadius: "20px", border: "none", cursor: "pointer",
  fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", transition: "all 0.2s",
  background: isActive ? "#111" : "#fff",
  color: isActive ? "#fff" : "#4b5563",
  boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.05)"
});

const timeSlotStyle = {
  padding: "4px 10px", background: "#f3f4f6", color: "#374151",
  borderRadius: "6px", fontSize: "11px", fontWeight: "500"
};
