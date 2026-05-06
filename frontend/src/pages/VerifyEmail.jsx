import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function VerifyEmail() {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Kayıt sayfasından gelen emaili alıyoruz
    const email = location.state?.email;
    const type = location.state?.type || "customer"; // "customer" veya "business"

    useEffect(() => {
        if (!email) {
            navigate("/");
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const endpoint = type === "customer" ? "/customers/verify-email" : "/businesses/verify-email";
            const res = await axios.post(`${API_URL}${endpoint}`, { email, code });
            
            setMessage("E-posta başarıyla doğrulandı! Giriş yapabilirsiniz.");
            setIsError(false);
            
            setTimeout(() => {
                navigate(type === "customer" ? "/customer-login" : "/login");
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "Doğrulama başarısız.");
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
                <h2 style={{ color: "#8E4A5D", marginBottom: "16px" }}>E-posta Doğrulama</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "32px" }}>
                    <b>{email}</b> adresine gönderilen 6 haneli doğrulama kodunu girin.
                </p>

                <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <input
                        type="text"
                        placeholder="000000"
                        maxLength="6"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            border: "2px solid #f3f4f6",
                            fontSize: "24px",
                            textAlign: "center",
                            letterSpacing: "8px",
                            fontWeight: "bold",
                            color: "#8E4A5D",
                            outline: "none"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#8E4A5D"}
                        onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || code.length !== 6}
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#8E4A5D",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: (isLoading || code.length !== 6) ? "not-allowed" : "pointer",
                            opacity: (isLoading || code.length !== 6) ? 0.7 : 1,
                            boxShadow: "0 8px 20px rgba(142, 74, 93, 0.3)"
                        }}
                    >
                        {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                    </button>
                </form>

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
            </div>
        </div>
    );
}
