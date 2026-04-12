import * as authService from "../services/auth.service.js";

// Cấu hình cookie an toàn cho refresh token
const COOKIE_OPTS = {
    httpOnly: true,        // JS phía client không đọc được
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
    path: "/api/auth",     // Chỉ gửi lên các route /api/auth/*
};

// POST /api/auth/dang-ky
export const dangKyController = async (req, res) => {
    try {
        const nguoiDung = await authService.dangKy(req.body);
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: nguoiDung,
        });
    } catch (err) {
        const status = err.message.includes("Email đã") ? 409 : 400;
        res.status(status).json({ success: false, message: err.message });
    }
};

// POST /api/auth/dang-nhap
export const dangNhapController = async (req, res) => {
    try {
        const { nguoiDung, accessToken, refreshToken } = await authService.dangNhap(req.body);

        // Gửi refreshToken qua HttpOnly cookie (không lộ ra JS)
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                nguoiDung,
                accessToken, // Frontend lưu vào memory (không localStorage)
            },
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// POST /api/auth/lam-moi-token
export const lamMoiTokenController = async (req, res) => {
    try {
        // Ưu tiên lấy từ cookie; fallback body (cho client không hỗ trợ cookie)
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        const { accessToken, refreshToken } = await authService.lamMoiToken(token);

        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);

        res.json({
            success: true,
            data: { accessToken },
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// POST /api/auth/dang-xuat
export const dangXuatController = async (req, res) => {
    try {
        await authService.dangXuat(req.nguoiDung.id);
        res.clearCookie("refreshToken", { ...COOKIE_OPTS, maxAge: 0 });
        res.json({ success: true, message: "Đăng xuất thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/ca-nhan
export const caNhanController = async (req, res) => {
    try {
        const nguoiDung = await authService.layCaNhan(req.nguoiDung.id);
        res.json({ success: true, data: nguoiDung });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};