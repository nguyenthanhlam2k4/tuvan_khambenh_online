import express from "express";
import { taoBacSiController } from "../controllers/bacSi.controller.js";

const router = express.Router();

router.post("/", taoBacSiController);

export default router;