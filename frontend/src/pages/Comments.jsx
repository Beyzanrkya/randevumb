import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const inputStyle = {
  display: "block", width: "100%", marginBottom: "12px",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "14px",
  outline: "none", boxSizing: "border-box"
};

const btnStyle = (color) => ({
  padding: "10px 20px", borderRadius: "8px", border: "none",
  cursor: "pointer", fontSize: "14px", fontWeight: "600",
  background: color, color: "#fff"
});

const cardStyle = {
  background: "#fff", borderRadius: "12px", padding: "28px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "20px"
};

export default function Comments() {
  const [addForm, setAddForm] = useState({ businessId: "", text: "", rating: 5 });
  const [updateForm, setUpdateForm] = useState({ id: "", text: "", rating: 5 });
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem("token");

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/comments`, addForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  const updateComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/comments/${updateForm.id}`,
        { text: updateForm.text, rating: updateForm.rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  const deleteComment = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`${API_URL}/comments/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Yorum silindi");
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hata oluştu");
      setIsError(true);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Yorum Ekle</h2>
        <form onSubmit={addComment}>
          <input placeholder="İşletme ID" value={addForm.businessId}
            onChange={(e) => setAddForm({ ...addForm, businessId: e.target.value })} style={inputStyle} />
          <input placeholder="Yorum" value={addForm.text}
            onChange={(e) => setAddForm({ ...addForm, text: e.target.value })} style={inputStyle} />
          <input type="number" min="1" max="5" placeholder="Puan (1-5)" value={addForm.rating}
            onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })} style={inputStyle} />
          <button type="submit" style={btnStyle("#16a34a")}>Yorum Ekle</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Yorum Güncelle</h2>
        <form onSubmit={updateComment}>
          <input placeholder="Yorum ID" value={updateForm.id}
            onChange={(e) => setUpdateForm({ ...updateForm, id: e.target.value })} style={inputStyle} />
          <input placeholder="Yeni Yorum" value={updateForm.text}
            onChange={(e) => setUpdateForm({ ...updateForm, text: e.target.value })} style={inputStyle} />
          <input type="number" min="1" max="5" placeholder="Puan (1-5)" value={updateForm.rating}
            onChange={(e) => setUpdateForm({ ...updateForm, rating: e.target.value })} style={inputStyle} />
          <button type="submit" style={btnStyle("#f59e0b")}>Güncelle</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Yorum Sil</h2>
        <form onSubmit={deleteComment}>
          <input placeholder="Yorum ID" value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)} style={inputStyle} />
          <button type="submit" style={btnStyle("#ef4444")}>Sil</button>
        </form>
      </div>

      {message && (
        <p style={{ fontSize: "13px", color: isError ? "#ef4444" : "#16a34a", textAlign: "center" }}>
          {isError ? "❌ " : "✅ "}{message}
        </p>
      )}
    </div>
  );
}