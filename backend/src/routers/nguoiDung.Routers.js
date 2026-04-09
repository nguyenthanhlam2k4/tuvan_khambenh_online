import express from "express";
import { taoNguoiDungController,layDanhSachNguoiDung } from "../controllers/nguoiDung.controller.js";

const router = express.Router();

// router.post("/", taoNguoiDungController);
router.get("/", layDanhSachNguoiDung);

export default router;