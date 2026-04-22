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

  // Kategori ismine göre emoji belirleme (görsel zenginlik için)
  const getCategoryEmoji = (categoryName) => {
    if (!categoryName) return "🏢";
    const name = categoryName.toLowerCase();
    if (name.includes("diş") || name.includes("sağlık")) return "🦷";
    if (name.includes("güzellik") || name.includes("kuaför") || name.includes("salon")) return "💇‍♀️";
    if (name.includes("oto") || name.includes("araba") || name.includes("tamir")) return "🚗";
    if (name.includes("fitness") || name.includes("spor")) return "🏋️‍♂️";
    if (name.includes("temizlik")) return "🧹";
    return "🏢";
  };

  return (
    <div style={{ background: "#faf8f5", minHeight: "calc(100vh - 60px)", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "32px", gap: "20px" }}>
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h1 style={{ fontSize: "42px", fontWeight: "800", color: "#111", marginBottom: "20px", letterSpacing: "-1px" }}>
              Randevu Al
            </h1>
            <div style={{ position: "relative", maxWidth: "400px" }}>
              <input 
                type="text" 
                placeholder="🔍 Seçtiğiniz Randevu Salonu veya Kategori Ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "16px 24px", borderRadius: "30px", border: "1px solid #eaeaea",
                  fontSize: "14px", outline: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", background: "#fff"
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            background: "#e6f4f1", padding: "24px 32px", borderRadius: "30px", 
            borderTopLeftRadius: "60px", borderBottomRightRadius: "60px",
            maxWidth: "350px", textAlign: "center", border: "1px solid #d1eae4"
          }}>
            <p style={{ color: "#2d6a5f", fontWeight: "700", fontSize: "16px", margin: 0, lineHeight: "1.4" }}>
              Tüm Hizmetler, Tek Platform.<br/> Hayatınızı Kolaylaştırın.
            </p>
          </div>
        </div>

        {/* Categories Tabs */}
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "32px" }}>
          <button 
            onClick={() => setSelectedCategory("all")}
            style={tabStyle(selectedCategory === "all")}
          >
            <span style={{ marginRight: "6px" }}>⚙️</span> Tüm Kategoriler
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
          {filteredBusinesses.map(business => (
            <div key={business._id} style={{
              background: "#fff", borderRadius: "24px", padding: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
              display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {/* Image Mockup */}
              <div style={{ 
                height: "160px", background: "#f5f3ef", borderRadius: "16px", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: "64px", position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(82, 150, 137, 0.1)", borderRadius: "50%" }}></div>
                {getCategoryEmoji(business.categoryId?.name)}
              </div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: "0 0 6px 0" }}>{business.name}</h3>
                  <span style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    ⭐ 4.5
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>
                  {business.categoryId?.name || "Genel"} Hizmetleri
                </p>
                <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                  📍 {business.address || "Adres belirtilmemiş"}
                </p>
              </div>

              {/* Time Slots Mockup */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "8px 0" }}>
                <span style={timeSlotStyle}>09:00</span>
                <span style={timeSlotStyle}>10:00</span>
                <span style={timeSlotStyle}>14:00</span>
                <span style={timeSlotStyle}>16:00</span>
                <span style={timeSlotStyle}>18:00</span>
              </div>

              <button 
                onClick={() => navigate(`/book/${business._id}`)}
                style={{
                  width: "100%", padding: "16px", background: "#529689", color: "#fff",
                  border: "none", borderRadius: "14px", fontWeight: "700", fontSize: "16px",
                  cursor: "pointer", marginTop: "auto", transition: "0.2s",
                  boxShadow: "0 4px 14px rgba(82, 150, 137, 0.3)"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#438074"}
                onMouseOut={(e) => e.currentTarget.style.background = "#529689"}
              >
                Randevu Al
              </button>
            </div>
          ))}
          
          {filteredBusinesses.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "16px" }}>
              Aradığınız kriterlere uygun işletme bulunamadı.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "12px 24px", borderRadius: "30px", border: isActive ? "none" : "1px solid #eaeaea", 
  cursor: "pointer", fontSize: "15px", fontWeight: "600", whiteSpace: "nowrap", transition: "all 0.2s",
  background: isActive ? "#529689" : "#fff",
  color: isActive ? "#fff" : "#6b7280",
  boxShadow: isActive ? "0 4px 15px rgba(82, 150, 137, 0.25)" : "0 2px 5px rgba(0,0,0,0.02)"
});

const timeSlotStyle = {
  padding: "8px 14px", background: "#e6f4f1", color: "#2d6a5f",
  borderRadius: "8px", fontSize: "13px", fontWeight: "600"
};
