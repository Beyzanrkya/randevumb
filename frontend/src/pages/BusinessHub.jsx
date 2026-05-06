import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function BusinessHub() {
  const navigate = useNavigate();
  const businessName = localStorage.getItem("businessName") || "İşletme";
  const businessId = localStorage.getItem("businessId");

  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!businessId) {
      navigate("/select-business");
      return;
    }

    const fetchData = async () => {
      try {
        // Genel İstatistikler
        const statsRes = await axios.get(`${API_URL}/appointments/stats/${businessId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Haftalık Grafik Verileri
        const weeklyRes = await axios.get(`${API_URL}/appointments/weekly-stats/${businessId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWeeklyData(weeklyRes.data);
      } catch (err) {
        console.error("Veriler alınamadı", err);
      }
    };
    fetchData();
  }, [businessId, navigate, API_URL, token]);

  const statCardStyle = {
    background: "var(--bg)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: "1",
    minWidth: "150px"
  };

  const chartContainerStyle = {
    background: "var(--bg)",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    marginBottom: "40px",
    height: "350px"
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "var(--bg)",
      padding: "60px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px", position: "relative" }}>
          <div style={{ display: "inline-block", padding: "8px 16px", background: "var(--accent-bg)", color: "var(--accent)", borderRadius: "20px", fontWeight: "700", fontSize: "14px", marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>
            İşletme Yönetimi
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-h)", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            Hoş Geldiniz, <span style={{ color: "#8E4A5D" }}>{businessName}</span>
          </h1>
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
          <div style={statCardStyle}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)", textTransform: "uppercase" }}>Toplam Randevu</span>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)" }}>{stats.total}</span>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", textTransform: "uppercase" }}>Onaylanan</span>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "#10b981" }}>{stats.confirmed}</span>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase" }}>Bekleyen</span>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "#f59e0b" }}>{stats.pending}</span>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#ef4444", textTransform: "uppercase" }}>İptal Edilen</span>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444" }}>{stats.cancelled}</span>
          </div>
        </div>

        {/* GRAFİK ALANI */}
        <div style={chartContainerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--text-h)" }}>Haftalık Performans</h3>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: "600" }}>Son 7 Gün</span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorRandevu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8E4A5D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8E4A5D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 'auto']} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  color: 'var(--text-h)'
                }}
                itemStyle={{ color: '#8E4A5D', fontWeight: 700 }}
                cursor={{ stroke: 'var(--accent)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="randevu" 
                stroke="#8E4A5D" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRandevu)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          <div 
            onClick={() => navigate("/appointments")}
            style={{
              background: "var(--bg)",
              padding: "40px 30px",
              borderRadius: "24px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "20px"
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.transform = "translateY(-8px)"; 
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.transform = "translateY(0)"; 
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #1E2A40, #3A4D70)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 10px 20px rgba(30,42,64,0.2)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-h)", margin: "0 0 10px 0" }}>Gelen Randevular</h2>
              <p style={{ fontSize: "15px", color: "var(--text)", margin: 0, lineHeight: "1.6" }}>Müşterilerinizden gelen randevu taleplerini görüntüleyin, onaylayın veya iptal edin.</p>
            </div>
            <div style={{ marginTop: "10px", color: "var(--accent)", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
              Randevulara Git →
            </div>
          </div>

          <div 
            onClick={() => navigate("/business-services")}
            style={{
              background: "var(--bg)",
              padding: "40px 30px",
              borderRadius: "24px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "20px"
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.transform = "translateY(-8px)"; 
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.transform = "translateY(0)"; 
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #8E4A5D, #C28798)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 10px 20px rgba(142, 74, 93,0.3)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-h)", margin: "0 0 10px 0" }}>Hizmetleri Yönet</h2>
              <p style={{ fontSize: "15px", color: "var(--text)", margin: 0, lineHeight: "1.6" }}>Sunduğunuz tüm hizmetleri listeleyin ve fiyatlandırın.</p>
            </div>
            <div style={{ marginTop: "10px", color: "var(--accent)", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
              Hizmetlere Git →
            </div>
          </div>

          <div 
            onClick={() => navigate("/business-reviews")}
            style={{
              background: "var(--bg)",
              padding: "40px 30px",
              borderRadius: "24px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "20px"
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.transform = "translateY(-8px)"; 
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.transform = "translateY(0)"; 
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 10px 20px rgba(245, 158, 11, 0.2)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-h)", margin: "0 0 10px 0" }}>Müşteri Yorumları</h2>
              <p style={{ fontSize: "15px", color: "var(--text)", margin: 0, lineHeight: "1.6" }}>Müşterilerinizin geri bildirimlerini inceleyin ve puanınızı takip edin.</p>
            </div>
            <div style={{ marginTop: "10px", color: "#f59e0b", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
              Yorumları Gör →
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
          <div 
            onClick={() => navigate("/business-settings")}
            style={{
              background: "var(--bg)",
              padding: "30px 40px",
              borderRadius: "24px",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "24px"
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.transform = "translateY(-4px)"; 
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.transform = "translateY(0)"; 
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 8px 16px rgba(16, 185, 129, 0.3)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-h)", margin: "0 0 6px 0" }}>İşletme Profili ve Ayarlar</h2>
              <p style={{ fontSize: "14px", color: "var(--text)", margin: 0, lineHeight: "1.5" }}>Fotoğraflar, galeri, iletişim ve adres bilgilerinizi güncelleyin.</p>
            </div>
            <div style={{ color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center" }}>
              Profili Düzenle →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
