import express from "express";
import {
    taoBacSi,
    layDanhSach,
    layHoSoCaNhan,
    layChiTiet,
    capNhat,
    xoa,
    duyetBacSi,
    dangKyLich,
    xoaSlot,
    xoaNgay,
    layLichTrong,
} from "../controllers/bacSi.controller.js";
import { xacThuc, phanQuyen } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ── Public (không cần đăng nhập) ─────────────────────────────────────────────
router.get("/:id/lich-trong",      layLichTrong);      // slot còn trống
router.get("/:id",                 layChiTiet);        // chi tiết 1 bác sĩ
router.get("/",                    layDanhSach);       // danh sách + filter

// ── Bác sĩ (cần đăng nhập + role bacsi) ──────────────────────────────────────
router.get("/ho-so/ca-nhan",       xacThuc, phanQuyen("bacsi"),        layHoSoCaNhan);
router.post("/",                   xacThuc, phanQuyen("bacsi"),        taoBacSi);
router.put("/:id",                 xacThuc, phanQuyen("bacsi", "admin"), capNhat);
router.post("/:id/lich",           xacThuc, phanQuyen("bacsi"),        dangKyLich);
router.delete("/:id/lich/:ngay/:slotId", xacThuc, phanQuyen("bacsi"), xoaSlot);
router.delete("/:id/lich/:ngay",   xacThuc, phanQuyen("bacsi"),        xoaNgay);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.patch("/:id/duyet",         xacThuc, phanQuyen("admin"),        duyetBacSi);
router.delete("/:id",              xacThuc, phanQuyen("admin"),        xoa);

export default router;