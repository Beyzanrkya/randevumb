import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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

// --- Styles ---
const inputStyle = {
  display: "block", width: "100%", marginBottom: "16px",
  padding: "12px 16px", borderRadius: "10px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box", background: "#f9fafb", fontFamily: "inherit"
};

const labelStyle = {
  fontSize: "13px", color: "#4b5563", fontWeight: "700", marginBottom: "6px", display: "block"
};

const btnStyle = {
  width: "100%", padding: "14px", borderRadius: "10px",
  border: "none", cursor: "pointer", fontSize: "15px",
  fontWeight: "700", background: "#529689", color: "#fff", transition: "0.2s"
};

export default function CustomerProfile() {
  const [form, setForm] = useState({ name: "", phone: "", birthDate: "", profilePicture: "", email: "" });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState([]);

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "Giriş yapmanız gerekiyor.", isError: true });
        setFetching(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/customers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          birthDate: res.data.birthDate || "",
          profilePicture: res.data.profilePicture || "",
          email: res.data.email || ""
        });
      } catch (err) {
        setMessage({ text: err.response?.data?.message || "Profil bilgileri alınamadı.", isError: true });
      } finally {
        setFetching(false);
      }
    };
    const fetchLoyalty = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/loyalty/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoyaltyPoints(res.data || []);
      } catch (error) {
        console.error("Sadakat puanları alınamadı", error);
      }
    };
    fetchProfile();
    fetchLoyalty();
  }, [API_URL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Lütfen 5MB'dan daha küçük bir fotoğraf seçin.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result); // Show cropper
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setForm({ ...form, profilePicture: croppedImage });
      setImageSrc(null); // Hide cropper
    } catch (e) {
      console.error(e);
      alert("Fotoğraf kırpılırken hata oluştu.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`${API_URL}/customers/me`, {
        name: form.name,
        phone: form.phone,
        birthDate: form.birthDate,
        profilePicture: form.profilePicture
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.customer?.name) {
        localStorage.setItem("customerName", res.data.customer.name);
      }
      setMessage({ text: "Profiliniz başarıyla güncellendi!", isError: false });
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Güncelleme başarısız", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#faf8f5", minHeight: "calc(100vh - 60px)", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>

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
                aspect={1} // 1:1 square crop for profile picture
                cropShape="round"
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
                style={{ flex: 1, padding: "12px", background: "#f3f4f6", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
              >
                İptal
              </button>
              <button
                onClick={showCroppedImage}
                style={{ flex: 1, padding: "12px", background: "#529689", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>

        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "32px", color: "#111", textAlign: "center" }}>
          Profilim
        </h2>

        {fetching ? (
          <p style={{ color: "#6b7280", textAlign: "center" }}>Bilgileriniz yükleniyor...</p>
        ) : (
          <form onSubmit={handleUpdate}>

            {/* Profil Fotoğrafı Alanı */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
              <div style={{
                width: "120px", height: "120px", borderRadius: "50%", background: "#f3f4f6",
                marginBottom: "16px", overflow: "hidden", display: "flex", alignItems: "center",
                justifyContent: "center", border: "4px solid #fff", boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
              }}>
                {form.profilePicture ? (
                  <img src={form.profilePicture} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <span style={{ fontSize: "48px" }}>👤</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="customer-photo-upload"
                style={{ display: "none" }}
              />
              <label
                htmlFor="customer-photo-upload"
                style={{
                  display: "inline-block", padding: "8px 16px", background: "#f3f4f6", color: "#4b5563",
                  borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  transition: "0.2s", border: "1px solid #e5e7eb"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
              >
                Galeriden Seç
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Ad Soyad</label>
                <input
                  placeholder="Örn: Ayşe Yılmaz"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>E-posta Adresi (Değiştirilemez)</label>
                <input
                  value={form.email}
                  disabled
                  style={{ ...inputStyle, background: "#e5e7eb", color: "#6b7280", cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label style={labelStyle}>Telefon Numarası</label>
                <input
                  placeholder="05XX XXX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Doğum Tarihi</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={btnStyle}
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.background = "#438074"}
              onMouseOut={(e) => e.currentTarget.style.background = "#529689"}
            >
              {loading ? "Kaydediliyor..." : "Bilgilerimi Kaydet"}
            </button>
          </form>
        )}

        {message.text && (
          <div style={{
            marginTop: "20px", padding: "16px", borderRadius: "12px", textAlign: "center",
            fontWeight: "600", fontSize: "14px",
            background: message.isError ? "#fef2f2" : "#ecfdf5",
            color: message.isError ? "#ef4444" : "#10b981"
          }}>
            {message.isError ? "❌ " : "✅ "}{message.text}
          </div>
        )}

        {/* Sadakat Puanları Bölümü */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #f3f4f6", paddingTop: "32px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", marginBottom: "20px" }}>MBrandev Puanlarım</h3>
          {loyaltyPoints.length === 0 ? (
            <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "16px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
              Henüz puanınız bulunmuyor. Randevularınızı tamamlayarak puan kazanabilirsiniz!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loyaltyPoints.map(lp => (
                <div key={lp._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#fdf2f8", borderRadius: "16px", border: "1px solid #fce7f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", background: "#8E4A5D", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>
                      {lp.businessId?.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#111", fontSize: "14px" }}>{lp.businessId?.name}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>100 puana ulaşınca 1 ücretsiz hizmet!</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#8E4A5D" }}>{lp.points} Puan</div>
                    <div style={{ width: "100px", height: "6px", background: "#f3f4f6", borderRadius: "3px", marginTop: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(lp.points, 100)}%`, height: "100%", background: "#8E4A5D" }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}