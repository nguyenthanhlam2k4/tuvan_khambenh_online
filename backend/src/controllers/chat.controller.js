import * as chatService from "../services/chat.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const err = (res, msg,  status = 500) => res.status(status).json({ success: false, message: msg });

// POST /api/chat/phong  — tạo hoặc lấy phòng chat
// body: { bacSiNguoiDungId, lichKhamId? }
export const layHoacTaoPhong = async (req, res) => {
    try {
        const { bacSiNguoiDungId, lichKhamId } = req.body;
        if (!bacSiNguoiDungId) return err(res, "Thiếu bacSiNguoiDungId", 400);
        const phong = await chatService.layHoacTaoPhong(
            req.nguoiDung.id, bacSiNguoiDungId, lichKhamId
        );
        ok(res, phong);
    } catch (e) { err(res, e.message, 400); }
};

// GET /api/chat/phong  — danh sách phòng của mình
export const layDanhSachPhong = async (req, res) => {
    try {
        const phongs = await chatService.layDanhSachPhong(
            req.nguoiDung.id, req.nguoiDung.vaiTro
        );
        ok(res, phongs);
    } catch (e) { err(res, e.message); }
};

// GET /api/chat/phong/:phongId  — chi tiết phòng
export const layChiTietPhong = async (req, res) => {
    try { ok(res, await chatService.layChiTietPhong(req.params.phongId)); }
    catch (e) { err(res, e.message, 404); }
};

// GET /api/chat/phong/:phongId/tin-nhan  — lịch sử chat
export const layTinNhan = async (req, res) => {
    try {
        ok(res, await chatService.layTinNhan(req.params.phongId, req.query));
    } catch (e) { err(res, e.message); }
};

// PATCH /api/chat/phong/:phongId/da-doc  — đánh dấu đã đọc
export const danhDauDaDoc = async (req, res) => {
    try {
        ok(res, await chatService.danhDauDaDoc(
            req.params.phongId, req.nguoiDung.id, req.nguoiDung.vaiTro
        ));
    } catch (e) { err(res, e.message); }
};