import { useState, useEffect } from "react";
import axios from "axios";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px", outline: "none"
};

const btnStyle = {
  width: "100%", padding: "11px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "14px",
  fontWeight: "600", background: "#111", color: "#fff"
};

export default function BusinessServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "", duration: "" });
  const [editingId, setEditingId] = useState(null); // Hangi hizmetin düzenlendiğini tutar
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const businessId = localStorage.getItem("businessId") || "69d29fa9fa7dafca23d868c8";

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services?businessId=${businessId}`);
      setServices(res.data);
    } catch (err) {
      console.error("Hizmetler yüklenemedi", err);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  // 7. ve 9. METOT: Ekleme ve Güncelleme İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editingId) {
        // 9. Metot: PUT /services/{serviceId}
        await axios.put(`${API_URL}/services/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Hizmet güncellendi!");
      } else {
        // 7. Metot: POST /services
        await axios.post(`${API_URL}/services`, { ...formData, businessId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Yeni hizmet eklendi!");
      }
      setFormData({ name: "", price: "", duration: "" });
      setEditingId(null);
      fetchServices();
    } catch (err) {
      setMessage("İşlem başarısız.");
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setFormData({ name: service.name, price: service.price, duration: service.duration });
    setMessage("");
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
        
        {/* SOL TARAF: Form (Ekleme/Güncelleme) */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
            {editingId ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
          </h2>
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <input placeholder="Hizmet Adı" value={formData.name} style={inputStyle}
              onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <input placeholder="Fiyat (TL)" type="number" value={formData.price} style={inputStyle}
              onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            <input placeholder="Süre (Dk)" type="number" value={formData.duration} style={inputStyle}
              onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
            <button type="submit" style={btnStyle}>{editingId ? "Güncelle" : "Ekle"}</button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:"", price:"", duration:""})}} 
                style={{...btnStyle, background: "#f3f4f6", color: "#333", marginTop: "8px"}}>İptal</button>
            )}
            {message && <p style={{ fontSize: "13px", marginTop: "10px", color: "green" }}>{message}</p>}
          </form>
        </div>

        {/* SAĞ TARAF: Liste */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Hizmetleriniz</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {services.map(service => (
              <div key={service._id} style={cardStyle}>
                <div>
                  <div style={{ fontWeight: "600" }}>{service.name}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{service.duration} dk - {service.price} TL</div>
                </div>
                <button onClick={() => startEdit(service)} style={editBtnStyle}>Düzenle</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const cardStyle = { background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" };
const editBtnStyle = { background: "transparent", border: "1px solid #111", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600" };