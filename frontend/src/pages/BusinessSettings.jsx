import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

// --- Image Cropping Helper ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result);
      };
    }, "image/jpeg", 0.9);
  });
}

// --- Theme ---
const theme = {
  primary: "#8E4A5D",
  primaryHover: "#6B3545",
  secondary: "#C28798",
  bg: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)",
  cardBg: "rgba(255, 255, 255, 0.9)",
  textMain: "#1E2A40",
  textMuted: "#6b7280",
  border: "rgba(255,255,255,0.8)",
  success: "#10b981",
  error: "#ef4444",
};

export default function BusinessSettings() {
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", description: "", imageUrl: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const businessId = localStorage.getItem("businessId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!businessId) {
      navigate("/select-business");
      return;
    }

    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`${API_URL}/businesses/${businessId}`);
        setBusiness(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          description: res.data.description || "",
          imageUrl: res.data.imageUrl || "",
          gallery: res.data.gallery || []
        });
      } catch (err) {
        console.error("İşletme bilgileri alınamadı", err);
      }
    };

    fetchBusiness();
  }, [API_URL, businessId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Lütfen 5MB'dan daha küçük bir fotoğraf seçin.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData({ ...formData, imageUrl: croppedImage });
      setImageSrc(null); // Hide cropper
    } catch (e) {
      console.error(e);
      alert("Fotoğraf kırpılırken hata oluştu.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.put(`${API_URL}/businesses/${businessId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("İşletme bilgileri başarıyla güncellendi!");
      setIsError(false);
      setBusiness(res.data.business);
      localStorage.setItem("businessName", res.data.business.name);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Güncelleme sırasında bir hata oluştu.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: `2px solid #f3f4f6`, fontSize: "15px", outline: "none",
    boxSizing: "border-box", transition: "all 0.2s",
    background: "#f9fafb", color: theme.textMain, fontWeight: "500"
  };

  if (!business) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: theme.bg, color: theme.textMain, fontWeight: "600", fontSize: "18px" }}>Yükleniyor...</div>;

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: theme.bg,
      padding: "60px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      
      {/* Cropper Modal */}
      {imageSrc && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "24px", width: "90%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ margin: 0, textAlign: "center", fontSize: "20px", fontWeight: "700" }}>Fotoğrafı Ayarla</h3>
            
            <div style={{ position: "relative", width: "100%", height: "300px", background: "#333", borderRadius: "16px", overflow: "hidden" }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Square aspect ratio
                cropShape="rect" // Businesses usually have square/rect logos
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>Yakınlaştırma</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => setImageSrc(null)}
                style={{ flex: 1, padding: "12px", background: "#f3f4f6", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", color: "#4b5563" }}
              >
                İptal
              </button>
              <button 
                onClick={showCroppedImage}
                style={{ flex: 1, padding: "12px", background: theme.primary, color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <button 
          onClick={() => navigate("/business-hub")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", color: theme.textMuted,
            fontSize: "15px", fontWeight: "600", cursor: "pointer",
            marginBottom: "30px", padding: 0, transition: "0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = theme.primaryHover}
          onMouseOut={(e) => e.currentTarget.style.color = theme.textMuted}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Panoya Dön
        </button>

        <div style={{
          background: theme.cardBg,
          backdropFilter: "blur(12px)",
          padding: "40px",
          borderRadius: "24px",
          boxShadow: "0 15px 35px rgba(142, 74, 93, 0.1)",
          border: `1px solid ${theme.border}`
        }}>
          
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "800", color: theme.textMain, margin: "0 0 10px 0" }}>İşletme Profili</h1>
            <p style={{ color: theme.textMuted, margin: 0, fontSize: "16px", fontWeight: "500" }}>İşletmenizin müşterilere görünen vitrinini düzenleyin.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px" }}>
              <div style={{
                width: "150px", height: "150px", borderRadius: "24px",
                background: formData.imageUrl ? `url(${formData.imageUrl}) center/cover` : "rgba(142, 74, 93, 0.1)",
                border: formData.imageUrl ? "none" : `2px dashed ${theme.secondary}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.primary, marginBottom: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}>
                {!formData.imageUrl && <span style={{ fontSize: "14px", fontWeight: "600", textAlign: "center", padding: "10px" }}>Fotoğraf Yok</span>}
              </div>
              <div style={{ width: "100%", position: "relative", textAlign: "center" }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  id="photo-upload"
                  style={{ display: "none" }}
                />
                <label 
                  htmlFor="photo-upload"
                  style={{
                    display: "inline-block", padding: "12px 24px", background: theme.secondary, color: "#fff",
                    borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    transition: "0.2s", boxShadow: "0 4px 15px rgba(194, 135, 152, 0.4)"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = theme.primary; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = theme.secondary; }}
                >
                  Galeriden Fotoğraf Seç
                </label>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "12px", margin: "12px 0 0 0" }}>İşletmeniz için logoyu veya en güzel vitrin fotoğrafınızı yükleyin (Maks 5MB).</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>İşletme Adı</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} 
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>E-posta (İletişim)</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} 
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Telefon</label>
                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} 
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Adres</label>
                <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={inputStyle} 
                  onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Hakkımızda (Açıklama)</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows="4"
                style={{...inputStyle, resize: "vertical"}} 
                placeholder="Müşterilerinize işletmenizden ve kalitenizden bahsedin..."
                onFocus={(e) => { e.target.style.borderColor = theme.primary; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#f3f4f6"; e.target.style.background = "#f9fafb"; }}
              />
            </div>

            {/* GALERİ YÖNETİMİ */}
            <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "30px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: theme.textMain }}>İşletme Galerisi (Portföy)</h3>
              <p style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "20px" }}>
                Yaptığınız işlerin fotoğraflarını buraya ekleyerek müşterilerinize sergileyin.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                {formData.gallery && formData.gallery.map((img, index) => (
                  <div key={index} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                    <img src={img} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button 
                      type="button"
                      onClick={() => {
                        const newGallery = formData.gallery.filter((_, i) => i !== index);
                        setFormData({ ...formData, gallery: newGallery });
                      }}
                      style={{
                        position: "absolute", top: "5px", right: "5px", background: "rgba(239, 68, 68, 0.9)", 
                        color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", 
                        cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {/* Yeni Ekleme Butonu */}
                <label style={{
                  width: "120px", height: "120px", borderRadius: "12px", border: `2px dashed ${theme.secondary}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: theme.primary, transition: "0.2s", background: "rgba(142, 74, 93, 0.05)"
                }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(142, 74, 93, 0.1)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(142, 74, 93, 0.05)"}
                >
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>+</span>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>Ekle</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), reader.result] }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: "100%", padding: "16px", borderRadius: "14px", border: "none",
              background: theme.primary, color: "#fff", fontSize: "16px", fontWeight: "700",
              cursor: isLoading ? "not-allowed" : "pointer", marginTop: "10px",
              boxShadow: "0 8px 20px rgba(142, 74, 93, 0.3)", transition: "all 0.2s"
            }}
              onMouseOver={(e) => { e.currentTarget.style.background = theme.primaryHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = theme.primary; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            >
              {isLoading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </button>
            
            {message && (
              <div style={{
                padding: "16px", borderRadius: "12px",
                fontSize: "14px", fontWeight: "600", textAlign: "center",
                background: isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                color: isError ? theme.error : theme.success,
                border: `1px solid ${isError ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
              }}>
                {message}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
