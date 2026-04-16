import express from "express";
import { taoNguoiDung, layDanhSach, layChiTiet, capNhat, xoa } from "../controllers/nguoiDung.controller.js";
import { xacThuc, phanQuyen } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/",   taoNguoiDung);                                    // public — đăng ký
router.get("/",    xacThuc, phanQuyen("admin"), layDanhSach);        // admin
router.get("/:id", xacThuc, layChiTiet);
router.put("/:id", xacThuc, capNhat);
router.delete("/:id", xacThuc, phanQuyen("admin"), xoa);

export default router;