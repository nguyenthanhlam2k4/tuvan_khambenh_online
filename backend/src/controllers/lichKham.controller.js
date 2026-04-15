import * as s from "../services/lichKham.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const err = (res, msg,  status = 500) => res.status(status).json({ success: false, message: msg });

// POST /api/lich-kham
export const datLich = async (req, res) => {
    try {
        const data = await s.datLich(req.nguoiDung.id, req.body);
        ok(res, data, 201);
    } catch (e) {
        const status = e.message.includes("đã có người đặt") ? 409 : 400;
        err(res, e.message, status);
    }
};

// GET /api/lich-kham/benh-nhan?trangThai=&trang=1
export const layLichCuaBenhNhan = async (req, res) => {
    try { ok(res, await s.layLichCuaBenhNhan(req.nguoiDung.id, req.query)); }
    catch (e) { err(res, e.message); }
};

// DELETE /api/lich-kham/:id
export const huyLich = async (req, res) => {
    try { ok(res, await s.huyLich(req.params.id, req.nguoiDung.id)); }
    catch (e) {
        const status = e.message.includes("Không thể") ? 409 : 400;
        err(res, e.message, status);
    }
};

// GET /api/lich-kham/bac-si?trangThai=choduyet&tuNgay=&trang=1
export const layLichCuaBacSi = async (req, res) => {
    try { ok(res, await s.layLichCuaBacSi(req.nguoiDung.id, req.query)); }
    catch (e) { err(res, e.message, 404); }
};

// PATCH /api/lich-kham/:id/trang-thai
export const doiTrangThai = async (req, res) => {
    try {
        const { trangThai } = req.body;
        if (!trangThai) return err(res, "Thiếu trangThai", 400);
        ok(res, await s.doiTrangThai(req.params.id, req.nguoiDung.id, trangThai));
    } catch (e) {
        err(res, e.message, e.message.includes("Không thể") ? 409 : 400);
    }
};

// GET /api/lich-kham/admin?trangThai=&tuNgay=&trang=1
export const layTatCa = async (req, res) => {
    try { ok(res, await s.layTatCa(req.query)); }
    catch (e) { err(res, e.message); }
};

// GET /api/lich-kham/admin/thong-ke
export const thongKe = async (req, res) => {
    try { ok(res, await s.thongKe()); }
    catch (e) { err(res, e.message); }
};