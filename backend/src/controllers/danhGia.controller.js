import * as s from "../services/danhGia.service.js";

const ok  = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const err = (res, msg,  status = 500) => res.status(status).json({ success: false, message: msg });

// POST /api/danh-gia
export const taoDanhGia = async (req, res) => {
    try {
        const { soSao } = req.body;
        if (!soSao || soSao < 1 || soSao > 5)
            return err(res, "Điểm đánh giá phải từ 1 đến 5 sao", 400);
        ok(res, await s.taoDanhGia(req.nguoiDung.id, req.body), 201);
    } catch (e) {
        const status = e.message.includes("đã đánh giá") ? 409
                     : e.message.includes("quyền")       ? 403 : 400;
        err(res, e.message, status);
    }
};

// GET /api/danh-gia/bac-si/:bacSiId
export const layDanhGiaBacSi = async (req, res) => {
    try {
        ok(res, await s.layDanhGiaBacSi(req.params.bacSiId, req.query));
    } catch (e) { err(res, e.message); }
};

// GET /api/danh-gia/kiem-tra/:lichKhamId
export const kiemTraDaDanhGia = async (req, res) => {
    try {
        ok(res, await s.kiemTraDaDanhGia(req.params.lichKhamId));
    } catch (e) { err(res, e.message); }
};