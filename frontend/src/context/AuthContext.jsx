import { createContext, useContext, useState, useEffect } from "react";
import { dangNhapAPI, dangKyAPI, dangXuatAPI, layCaNhanAPI, lamMoiTokenAPI } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [nguoiDung, setNguoiDung] = useState(null);
    const [dangTai, setDangTai] = useState(true);

    useEffect(() => {
        const khoiPhuc = async () => {
            try {
                const token = sessionStorage.getItem("accessToken");
                if (!token) {
                    const res = await lamMoiTokenAPI();
                    sessionStorage.setItem("accessToken", res.data.data.accessToken);
                }
                const res = await layCaNhanAPI();
                setNguoiDung(res.data.data);
            } catch {
                sessionStorage.removeItem("accessToken");
            } finally {
                setDangTai(false);
            }
        };
        khoiPhuc();
    }, []);

    const dangNhap = async (email, matKhau) => {
        const res = await dangNhapAPI({ email, matKhau });
        const { nguoiDung: user, accessToken } = res.data.data;
        sessionStorage.setItem("accessToken", accessToken);
        setNguoiDung(user);
        return user;
    };

    const dangKy = async (data) => {
        const res = await dangKyAPI(data);
        return res.data;
    };

    const dangXuat = async () => {
        try { await dangXuatAPI(); } catch { }
        sessionStorage.removeItem("accessToken");
        setNguoiDung(null);
        // Redirect về trang chủ sau khi đăng xuất
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{
            nguoiDung,
            dangTai,
            daDangNhap: !!nguoiDung,
            laAdmin:    nguoiDung?.vaiTro === "admin",
            laBacSi:    nguoiDung?.vaiTro === "bacsi",
            laBenhNhan: nguoiDung?.vaiTro === "benhnhan",
            dangNhap,
            dangKy,
            dangXuat,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);