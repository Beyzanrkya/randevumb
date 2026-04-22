import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "16px",
  padding: "12px 16px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px", outline: "none",
  backgroundColor: "#f9fafb"
};

const btnStyle = {
  width: "100%", padding: "14px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "15px",
  fontWeight: "600", background: "#38bdf8", color: "#fff",
  marginTop: "8px", transition: "0.2s"
};

export default function CustomerCreateAppointment() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [formData, setFormData] = useState({
    businessId: businessId || "",
    serviceId: "",
    date: "",
    time: ""
  });
  
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    if (!businessId) return;
    
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/services?businessId=${businessId}`);
        setServices(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, serviceId: res.data[0]._id }));
        }
      } catch (err) {
        console.error("Hizmetler yüklenemedi", err);
        setMessage("Bu işletmeye ait hizmetler yüklenirken hata oluştu.");
        setIsError(true);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServices();
  }, [businessId, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(`${API_URL}/appointments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Randevu başarıyla oluşturuldu!");
      setIsError(false);
      setTimeout(() => navigate("/customer-appointments"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Randevu oluşturulamadı");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "60px auto", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginBottom: "16px", fontSize: "14px", fontWeight: "600", padding: 0 }}
      >
        ← Geri Dön
      </button>
      
      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "24px", color: "#111" }}>Randevu Oluştur</h2>
      
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: "13px", color: "#4b5563", fontWeight: "600", marginBottom: "6px", display: "block" }}>Hizmet Seçimi</label>
        {loadingServices ? (
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>Hizmetler yükleniyor...</p>
        ) : services.length > 0 ? (
          <select 
            style={inputStyle} 
            value={formData.serviceId}
            onChange={(e) => setFormData({...formData, serviceId: e.target.value})} 
            required
          >
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} ({service.duration} Dk) - {service.price} TL
              </option>
            ))}
          </select>
        ) : (
          <p style={{ fontSize: "14px", color: "#ef4444", marginBottom: "16px" }}>Bu işletmeye ait aktif bir hizmet bulunmuyor.</p>
        )}

        <label style={{ fontSize: "13px", color: "#4b5563", fontWeight: "600", marginBottom: "6px", display: "block" }}>Tarih</label>
        <input type="date" style={inputStyle} 
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})} required />

        <label style={{ fontSize: "13px", color: "#4b5563", fontWeight: "600", marginBottom: "6px", display: "block" }}>Saat</label>
        <input type="time" style={inputStyle} 
          value={formData.time}
          onChange={(e) => setFormData({...formData, time: e.target.value})} required />

        <button type="submit" style={btnStyle} disabled={loading || services.length === 0}>
          {loading ? "Oluşturuluyor..." : "Randevuyu Onayla"}
        </button>
      </form>
      
      {message && (
        <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "500", color: isError ? "#ef4444" : "#10b981", textAlign: "center", padding: "10px", background: isError ? "#fef2f2" : "#ecfdf5", borderRadius: "8px" }}>
          {message}
        </p>
      )}
    </div>
  );
}