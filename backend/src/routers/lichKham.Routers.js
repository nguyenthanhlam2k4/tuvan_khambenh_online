import express from "express";
import {
    datLich, layLichCuaBenhNhan, huyLich,
    layLichCuaBacSi, doiTrangThai,
    layTatCa, thongKe,
} from "../controllers/lichKham.controller.js";
import { xacThuc, phanQuyen } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Bệnh nhân
router.post("/",            xacThuc, phanQuyen("benhnhan"),          datLich);
router.get("/benh-nhan",    xacThuc, phanQuyen("benhnhan"),          layLichCuaBenhNhan);
router.delete("/:id",       xacThuc, phanQuyen("benhnhan"),          huyLich);

// Bác sĩ
router.get("/bac-si",                xacThuc, phanQuyen("bacsi"),             layLichCuaBacSi);
router.patch("/:id/trang-thai",      xacThuc, phanQuyen("bacsi","admin"),     doiTrangThai);

// Admin
router.get("/admin",                 xacThuc, phanQuyen("admin"),             layTatCa);
router.get("/admin/thong-ke",        xacThuc, phanQuyen("admin"),             thongKe);

export default router;