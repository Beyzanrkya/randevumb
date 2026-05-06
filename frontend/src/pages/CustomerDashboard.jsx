import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "az", "za"
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsRes, busRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/businesses`)
        ]);
        setCategories(catsRes.data || []);
        setBusinesses(busRes.data || []);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const filteredBusinesses = businesses.filter(b => {
    const matchesCat = selectedCategory === "all" || (b.categoryId && b.categoryId._id === selectedCategory);
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = locationQuery === "" || (b.address && b.address.toLowerCase().includes(locationQuery.toLowerCase()));
    return matchesCat && matchesSearch && matchesLoc;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name);
    if (sortBy === "za") return b.name.localeCompare(a.name);
    return new Date(b.createdAt) - new Date(a.createdAt); // default newest
  });

  // Kategori ismine göre örnek resimler (Görsel zenginlik için)
  const getCategoryImage = (categoryName) => {
    if (!categoryName) return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"; // Default office
    const name = categoryName.toLowerCase();
    if (name.includes("diş") || name.includes("sağlık")) return "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80";
    if (name.includes("güzellik") || name.includes("kuaför") || name.includes("salon")) return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80";
    if (name.includes("oto") || name.includes("araba") || name.includes("tamir")) return "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=400&q=80";
    if (name.includes("fitness") || name.includes("spor")) return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80";
    if (name.includes("temizlik")) return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80";
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 60px)", fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section with Gradient Background */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg) 0%, var(--accent-bg) 100%)",
        padding: "60px 20px 40px",
        borderBottomLeftRadius: "40px",
        borderBottomRightRadius: "40px",
        marginBottom: "30px",
        position: "relative",
        borderBottom: "1px solid var(--border)"
      }}>
        {/* Decorative background shapes container */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", borderBottomLeftRadius: "40px", borderBottomRightRadius: "40px", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "200px", height: "200px", background: "var(--accent-bg)", borderRadius: "50%", filter: "blur(40px)" }}></div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "800", color: "var(--text-h)", marginBottom: "24px", letterSpacing: "-1px" }}>
                MBrandev <span style={{ color: "var(--accent)" }}>AI</span>
              </h1>
              <div style={{ position: "relative", maxWidth: "480px" }}>
                <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "var(--text)" }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="İşletme veya Hizmet Ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "18px 24px 18px 50px", borderRadius: "30px", border: "1px solid var(--border)",
                    fontSize: "15px", outline: "none", boxShadow: "var(--shadow)", background: "var(--bg)",
                    color: "var(--text-h)", boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
            
            <div style={{ 
              background: "var(--accent-bg)", padding: "24px 32px", borderRadius: "30px", 
              borderTopLeftRadius: "60px", borderBottomRightRadius: "60px",
              maxWidth: "380px", textAlign: "center", border: "1px solid var(--accent-border)",
              backdropFilter: "blur(10px)", boxShadow: "var(--shadow)"
            }}>
              <p style={{ color: "var(--text-h)", fontWeight: "700", fontSize: "18px", margin: 0, lineHeight: "1.5" }}>
                Tüm Hizmetler, Tek Platform.<br/> Hayatınızı Kolaylaştırın.
              </p>
            </div>
          </div>

          {/* Categories Tabs */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "40px", paddingBottom: "8px" }}>
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                style={{
                  padding: "10px 20px", borderRadius: "30px", border: "none", 
                  cursor: "pointer", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap",
                  background: showFilter ? "var(--accent)" : "var(--text-h)", color: "var(--bg)", display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: "var(--shadow)", transition: "0.2s"
                }}
              >
                <span>⚙️</span> Filtrele & Sırala
              </button>
              
              {showFilter && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", left: 0, background: "var(--bg)",
                  padding: "20px", borderRadius: "16px", boxShadow: "var(--shadow)",
                  border: "1px solid var(--border)", zIndex: 1000, width: "260px"
                }}>
                  
                  {/* Sıralama */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-h)", display: "block", marginBottom: "8px" }}>🔄 Sıralama</label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--border)", outline: "none", fontSize: "13px", background: "var(--accent-bg)", color: "var(--text-h)" }}
                    >
                      <option value="newest">En Yeni İşletmeler</option>
                      <option value="az">A'dan Z'ye (İsim)</option>
                      <option value="za">Z'den A'ya (İsim)</option>
                    </select>
                  </div>

                  {/* Konum */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-h)", display: "block", marginBottom: "8px" }}>📍 Konuma Göre Ara</label>
                    <input 
                      placeholder="Şehir, ilçe veya semt..." 
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--border)", outline: "none", fontSize: "13px", boxSizing: "border-box", background: "var(--accent-bg)", color: "var(--text-h)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                const token = localStorage.getItem("token");
                if(token) navigate("/customer-appointments");
                else navigate("/customer-login");
              }}
              style={tabStyle(false)}
            >
              <span>🗓️</span> Randevularım
            </button>
            <button 
              onClick={() => setSelectedCategory("all")}
              style={tabStyle(selectedCategory === "all")}
            >
              <span>🌟</span> Tümü
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
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Business Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px" }}>
              <div style={{ 
                width: "40px", height: "40px", border: "4px solid var(--accent-bg)", 
                borderTop: "4px solid var(--accent)", borderRadius: "50%", 
                margin: "0 auto 20px", animation: "spin 1s linear infinite" 
              }}></div>
              <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: "600" }}>İşletmeler Yükleniyor...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : sortedBusinesses.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--text)", fontSize: "16px" }}>
              Aradığınız kriterlere uygun işletme bulunamadı.
            </div>
          ) : (
            sortedBusinesses.map(business => (
              <div key={business._id} style={{
                background: "var(--bg)", borderRadius: "24px", padding: "20px",
                boxShadow: "var(--shadow)", border: "1px solid var(--border)",
                display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {/* Image Mockup */}
                <div style={{ 
                  height: "180px", borderRadius: "16px", 
                  backgroundImage: `url(${business.imageUrl || getCategoryImage(business.categoryId?.name)})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  position: "relative", overflow: "hidden",
                  border: "1px solid var(--border)"
                }}>
                </div>
                
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-h)", margin: 0 }}>{business.name}</h3>
                    <span style={{ color: "#f59e0b", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      ⭐ {business.averageRating > 0 ? business.averageRating : "Yeni"} 
                      {business.reviewCount > 0 && <span style={{ fontSize: "11px", color: "var(--text)", fontWeight: "500" }}>({business.reviewCount})</span>}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text)", margin: "0 0 12px 0" }}>
                    {business.categoryId?.name || "Genel"} servisi
                  </p>
                </div>

                {/* Time Slots Mockup */}
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)", marginBottom: "8px" }}>Müsait Saatler:</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {["09:00", "10:30", "14:00", "16:30"].map(time => (
                      <span key={time} style={{
                        padding: "6px 12px", background: "var(--accent-bg)", color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        borderRadius: "6px", fontSize: "12px", fontWeight: "600"
                      }}>{time}</span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/book/${business._id}`)}
                  style={{
                    width: "100%", padding: "16px", background: "linear-gradient(135deg, #1E2A40, #3A4D70)", color: "#fff",
                    border: "none", borderRadius: "14px", fontWeight: "700", fontSize: "16px",
                    cursor: "pointer", marginTop: "auto", transition: "all 0.3s",
                    boxShadow: "0 4px 14px rgba(30, 42, 64, 0.3)"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(30, 42, 64, 0.4)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(30, 42, 64, 0.3)"; }}
                >
                  Randevu Al
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "10px 20px", borderRadius: "30px", border: "1px solid var(--border)", 
  cursor: "pointer", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", transition: "all 0.2s",
  background: isActive ? "var(--accent)" : "var(--bg)",
  color: isActive ? "#fff" : "var(--text)",
  display: "flex", alignItems: "center", gap: "6px",
  boxShadow: isActive ? "var(--shadow)" : "none"
});
