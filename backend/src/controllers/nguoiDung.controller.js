import * as s from "../services/nguoiDung.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const err = (res, msg,  status = 500) => res.status(status).json({ success: false, message: msg });

export const taoNguoiDung = async (req, res) => {
    try { ok(res, await s.taoNguoiDung(req.body), 201); }
    catch (e) { err(res, e.message, e.message.includes("Email") ? 409 : 400); }
};

export const layDanhSach = async (req, res) => {
    try { ok(res, await s.layDanhSachNguoiDung(req.query)); }
    catch (e) { err(res, e.message); }
};

export const layChiTiet = async (req, res) => {
    try { ok(res, await s.layChiTietNguoiDung(req.params.id)); }
    catch (e) { err(res, e.message, 404); }
};

export const capNhat = async (req, res) => {
    try {
        // Kiểm tra chủ sở hữu: chỉ chính mình hoặc admin mới được sửa
        const { id: targetId } = req.params;
        const { id: currentId, vaiTro } = req.nguoiDung;
        if (vaiTro !== "admin" && currentId !== targetId) {
            return err(res, "Bạn không có quyền chỉnh sửa tài khoản này", 403);
        }
        ok(res, await s.capNhatNguoiDung(targetId, req.body, req.nguoiDung));
    } catch (e) { err(res, e.message, 400); }
};

export const xoa = async (req, res) => {
    try { ok(res, await s.xoaNguoiDung(req.params.id)); }
    catch (e) { err(res, e.message, 404); }
};