import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

// Vòng xoay chờ khi đang kiểm tra session
function Loading() {
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "3px solid #e5e7eb", borderTopColor: "#1D9E75",
                animation: "spin .7s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}

// Bọc route cần đăng nhập
export function CanDangNhap({ children }) {
    const { daDangNhap, dangTai } = useAuth();
    const location = useLocation();
    if (dangTai) return <Loading />;
    if (!daDangNhap) return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
    return children;
}

// Bọc route cần vai trò cụ thể
// Dùng: <CanVaiTro vaiTro={["admin"]}> hoặc <CanVaiTro vaiTro={["bacsi","admin"]}>
export function CanVaiTro({ children, vaiTro = [] }) {
    const { nguoiDung, dangTai } = useAuth();
    if (dangTai) return <Loading />;
    if (!nguoiDung || !vaiTro.includes(nguoiDung.vaiTro)) {
        return <Navigate to="/khong-co-quyen" replace />;
    }
    return children;
}

// Bọc /dang-nhap và /dang-ky — nếu đã login thì redirect về đúng dashboard
export function DaCoTaiKhoan({ children }) {
    const { daDangNhap, dangTai, nguoiDung } = useAuth();
    if (dangTai) return <Loading />;
    if (daDangNhap) {
        const map = { admin: "/admin", bacsi: "/bac-si", benhnhan: "/benh-nhan" };
        return <Navigate to={map[nguoiDung.vaiTro] || "/"} replace />;
    }
    return children;
}