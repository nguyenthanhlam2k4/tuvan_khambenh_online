import express from "express";
import {
    layHoacTaoPhong,
    layDanhSachPhong,
    layChiTietPhong,
    layTinNhan,
    danhDauDaDoc,
} from "../controllers/chat.controller.js";
import { xacThuc, phanQuyen } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Tất cả route đều cần đăng nhập
router.use(xacThuc);

// Phòng chat
router.post("/phong",              phanQuyen("benhnhan"), layHoacTaoPhong);    // bệnh nhân tạo/lấy phòng
router.get("/phong",               layDanhSachPhong);                          // mọi vai trò xem danh sách của mình
router.get("/phong/:phongId",      layChiTietPhong);                           // chi tiết phòng
router.get("/phong/:phongId/tin-nhan", layTinNhan);                            // load lịch sử
router.patch("/phong/:phongId/da-doc", danhDauDaDoc);                          // đánh dấu đã đọc

export default router;