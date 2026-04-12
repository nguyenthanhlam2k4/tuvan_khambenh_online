import { xacMinhAccessToken } from "../utils/jwt.js";

// ─── Middleware 1: Xác thực JWT ─────────────────────────────────────────────
// Dùng cho mọi route cần đăng nhập
// Gắn req.nguoiDung = { id, vaiTro } nếu token hợp lệ
export const xacThuc = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Không có token xác thực",
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = xacMinhAccessToken(token);

        req.nguoiDung = {
            id: payload.id,
            vaiTro: payload.vaiTro,
        };

        next();
    } catch (err) {
        const hetHan = err.name === "TokenExpiredError";
        return res.status(401).json({
            success: false,
            message: hetHan ? "Token đã hết hạn, vui lòng làm mới" : "Token không hợp lệ",
            hetHan,
        });
    }
};

// ─── Middleware 2: Phân quyền theo vai trò ──────────────────────────────────
// Dùng SAU xacThuc
// Ví dụ: router.delete("/:id", xacThuc, phanQuyen("admin"), handler)
//        router.put("/lich", xacThuc, phanQuyen("bacsi", "admin"), handler)
export const phanQuyen = (...vaiTroChoPhep) => {
    return (req, res, next) => {
        if (!vaiTroChoPhep.includes(req.nguoiDung.vaiTro)) {
            return res.status(403).json({
                success: false,
                message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${vaiTroChoPhep.join(" hoặc ")}`,
            });
        }
        next();
    };
};

// ─── Middleware 3: Chủ sở hữu hoặc admin ────────────────────────────────────
// Dùng khi người dùng chỉ được sửa/xóa dữ liệu của chính mình
// Lấy userId từ req.params.id hoặc req.params.nguoiDungId
export const chuSoHuuHoacAdmin = (req, res, next) => {
    const targetId = req.params.id || req.params.nguoiDungId;
    const { id: currentId, vaiTro } = req.nguoiDung;

    if (vaiTro === "admin" || currentId === targetId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể thao tác với dữ liệu của chính mình",
    });
};