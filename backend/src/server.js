import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connecDB } from "./config/db.js";

import authRouter      from "./routers/auth.Routers.js";
import bacSiRouter     from "./routers/bacSi.Routers.js";
import nguoiDungRouter from "./routers/nguoiDung.Routers.js";
import lichKhamRouter from "./routers/lichKham.Routers.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5001;

// Kết nối DB
connecDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",       authRouter);
app.use("/api/bac-si",     bacSiRouter);
app.use("/api/nguoi-dung", nguoiDungRouter);
app.use("/api/lich-kham", lichKhamRouter)

// Health check
app.get("/", (_req, res) => res.json({ message: "🚀 Server đang chạy", version: "2.0" }));

// Global error handler
app.use((err, _req, res, _next) => {
    console.error("Lỗi không xử lý được:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
});

app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));