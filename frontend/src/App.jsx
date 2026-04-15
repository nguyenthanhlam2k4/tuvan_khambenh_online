import { Routes, Route, Navigate } from "react-router";
import { AuthProvider }            from "./context/AuthContext";
import { CanDangNhap, CanVaiTro, DaCoTaiKhoan } from "./components/RouteGuard";

// Public
import TrangChu     from "./pages/public/TrangChu.jsx";
import TimBacSi     from "./pages/public/TimBacSi.jsx";
import ChiTietBacSi from "./pages/public/ChiTietBacSi.jsx";
import DatLich      from "./pages/public/Datlich.jsx";

// Auth
import DangNhap     from "./pages/auth/DangNhap.jsx";
import DangKy       from "./pages/auth/DangKy.jsx";
import KhongCoQuyen from "./pages/auth/KhongCoQuyen.jsx";

// Dashboards
import AdminDashboard    from "./pages/admin/AdminDashboard.jsx";
import BacSiDashboard    from "./pages/bacsi/BacSiDashboard.jsx";
import BenhNhanDashboard from "./pages/benhnhan/BenhNhanDashboard.jsx";

export default function App() {
    return (
        <AuthProvider>
            <Routes>

                {/* Public */}
                <Route path="/"               element={<TrangChu />} />
                <Route path="/tim-bac-si"     element={<TimBacSi />} />
                <Route path="/tim-bac-si/:id" element={<ChiTietBacSi />} />

                {/* Đặt lịch — cần đăng nhập, chỉ bệnh nhân */}
                <Route path="/dat-lich/:id" element={
                    <CanDangNhap>
                        <CanVaiTro vaiTro={["benhnhan"]}>
                            <DatLich />
                        </CanVaiTro>
                    </CanDangNhap>
                } />

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

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </AuthProvider>
    );
}