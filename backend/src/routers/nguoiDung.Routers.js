import express from "express";
import {
    taoNguoiDungController,
    layDanhSachNguoiDungController,
    capNhatNguoiDungController,
    xoaNguoiDungController,
    layChiTietNguoiDungController,
    layDanhSachNguoiDungTheoVaiTroController
} from "../controllers/nguoiDung.controller.js";

const router = express.Router();

router.post("/", taoNguoiDungController);
router.get("/", layDanhSachNguoiDungController);
router.get("/theo-vai-tro", layDanhSachNguoiDungTheoVaiTroController);
router.get("/:id", layChiTietNguoiDungController);
router.put("/:id", capNhatNguoiDungController);
router.delete("/:id", xoaNguoiDungController);

export default router;