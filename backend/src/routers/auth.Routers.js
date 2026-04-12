import express from "express";
import {
    dangKyController,
    dangNhapController,
    lamMoiTokenController,
    dangXuatController,
    caNhanController,
} from "../controllers/auth.controller.js";
import { xacThuc } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (không cần token)
router.post("/dang-ky",         dangKyController);
router.post("/dang-nhap",       dangNhapController);
router.post("/lam-moi-token",   lamMoiTokenController);

// Protected routes (cần token)
router.post("/dang-xuat",  xacThuc, dangXuatController);
router.get("/ca-nhan",     xacThuc, caNhanController);

export default router;