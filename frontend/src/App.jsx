import { Routes, Route, Navigate } from "react-router";
import { AuthProvider }            from "./context/AuthContext";
import { CanDangNhap, CanVaiTro, DaCoTaiKhoan } from "./components/RouteGuard";

// Pages — auth
import DangNhap     from "./pages/DangNhap";
import DangKy       from "./pages/DangKy";
import KhongCoQuyen from "./pages/KhongCoQuyen";

// Pages — dashboard từng vai trò
import AdminDashboard    from "./pages/admin/Dashboard";
import BacSiDashboard    from "./pages/bacsi/Dashboard";
import BenhNhanDashboard from "./pages/benhnhan/Dashboard";

export default function App() {
    return (
        <AuthProvider>
            <Routes>

                {/* Trang chủ → đăng nhập */}
                <Route path="/" element={<Navigate to="/dang-nhap" replace />} />

                {/* Auth */}
                <Route path="/dang-nhap" element={<DaCoTaiKhoan><DangNhap /></DaCoTaiKhoan>} />
                <Route path="/dang-ky"   element={<DaCoTaiKhoan><DangKy /></DaCoTaiKhoan>} />
                <Route path="/khong-co-quyen" element={<KhongCoQuyen />} />

                {/* Admin */}
                <Route path="/admin/*" element={
                    <CanDangNhap><CanVaiTro vaiTro={["admin"]}><AdminDashboard /></CanVaiTro></CanDangNhap>
                } />

                {/* Bác sĩ */}
                <Route path="/bac-si/*" element={
                    <CanDangNhap><CanVaiTro vaiTro={["bacsi"]}><BacSiDashboard /></CanVaiTro></CanDangNhap>
                } />

                {/* Bệnh nhân */}
                <Route path="/benh-nhan/*" element={
                    <CanDangNhap><CanVaiTro vaiTro={["benhnhan"]}><BenhNhanDashboard /></CanVaiTro></CanDangNhap>
                } />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </AuthProvider>
    );
}