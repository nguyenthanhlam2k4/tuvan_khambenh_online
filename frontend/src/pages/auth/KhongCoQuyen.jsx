import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";

export default function KhongCoQuyen() {
    const { nguoiDung } = useAuth();
    const navigate = useNavigate();

    const dashboardMap = {
        admin:    "/admin",
        bacsi:    "/bac-si",
        benhnhan: "/benh-nhan",
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            justifyContent: "center", background: "#F8FAFC", padding: 20,
        }}>
            <div style={{
                textAlign: "center", maxWidth: 380,
                background: "#fff", border: "0.5px solid #E5E7EB",
                borderRadius: 16, padding: "40px 32px",
            }}>
                <div style={{
                    fontSize: 48, marginBottom: 16,
                    width: 72, height: 72, borderRadius: "50%",
                    background: "#FEF3C7", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111", margin: "0 0 8px" }}>
                    Không có quyền truy cập
                </h2>
                <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
                    Bạn không có quyền xem trang này.
                    {nguoiDung && ` Tài khoản của bạn là "${nguoiDung.vaiTro}".`}
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            height: 38, padding: "0 16px",
                            border: "0.5px solid #D1D5DB", borderRadius: 8,
                            background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151",
                        }}
                    >
                        Quay lại
                    </button>
                    {nguoiDung && (
                        <Link
                            to={dashboardMap[nguoiDung.vaiTro] || "/"}
                            style={{
                                height: 38, padding: "0 16px",
                                background: "#1D9E75", borderRadius: 8,
                                fontSize: 13, color: "#fff", textDecoration: "none",
                                display: "flex", alignItems: "center", fontWeight: 500,
                            }}
                        >
                            Về dashboard
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}