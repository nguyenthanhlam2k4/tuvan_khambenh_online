import express from "express";
import { taoDanhGia, layDanhGiaBacSi, kiemTraDaDanhGia } from "../controllers/danhGia.controller.js";
import { xacThuc, phanQuyen } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Bệnh nhân tạo đánh giá
router.post("/", xacThuc, phanQuyen("benhnhan"), taoDanhGia);

// Public — xem đánh giá của bác sĩ (hiển thị trên trang chi tiết)
router.get("/bac-si/:bacSiId", layDanhGiaBacSi);

// Bệnh nhân kiểm tra lịch đã đánh giá chưa
router.get("/kiem-tra/:lichKhamId", xacThuc, phanQuyen("benhnhan"), kiemTraDaDanhGia);

export default router;