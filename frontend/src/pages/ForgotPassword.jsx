import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Hangi tür kullanıcının şifre sıfırladığını state'ten alıyoruz
    const userType = location.state?.type || "customer"; // "customer" veya "business"

    const handleSendCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        try {
            const endpoint = userType === "customer" ? "/customers/forgot-password" : "/businesses/forgot-password";
            const res = await axios.post(`${API_URL}${endpoint}`, { email });
            setMessage(res.data.message);
            setIsError(false);
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.message || "Kod gönderilemedi.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        try {
            const endpoint = userType === "customer" ? "/customers/reset-password" : "/businesses/reset-password";
            const res = await axios.post(`${API_URL}${endpoint}`, { email, code, newPassword });
            setMessage(res.data.message);
            setIsError(false);
            setTimeout(() => {
                navigate(userType === "customer" ? "/customer-login" : "/login");
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "Şifre güncellenemedi.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #FAF7F8 0%, #F3EBED 100%)",
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.9)",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(142, 74, 93, 0.1)",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center"
            }}>
                <h2 style={{ color: "#8E4A5D", marginBottom: "16px" }}>Şifremi Unuttum</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "32px" }}>
                    {step === 1 
                        ? "Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin." 
                        : "E-postanıza gelen 6 haneli kodu ve yeni şifrenizi girin."}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <input
                            type="email"
                            placeholder="E-posta Adresiniz"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                        <button type="submit" disabled={isLoading} style={buttonStyle}>
                            {isLoading ? "Gönderiliyor..." : "Kod Gönder"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <input
                            type="text"
                            placeholder="6 Haneli Kod"
                            required
                            maxLength="6"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{...inputStyle, letterSpacing: "4px", fontWeight: "bold", textAlign: "center"}}
                        />
                        <input
                            type="password"
                            placeholder="Yeni Şifre"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={inputStyle}
                        />
                        <button type="submit" disabled={isLoading} style={buttonStyle}>
                            {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </form>
                )}

                {message && (
                    <div style={{
                        marginTop: "24px",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: isError ? "#fee2e2" : "#d1fae5",
                        color: isError ? "#991b1b" : "#065f46"
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ marginTop: "24px" }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", textDecoration: "underline" }}
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: "14px 20px",
    borderRadius: "12px",
    border: "2px solid #f3f4f6",
    fontSize: "15px",
    outline: "none",
    transition: "0.2s"
};

const buttonStyle = {
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "#8E4A5D",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(142, 74, 93, 0.3)"
};
