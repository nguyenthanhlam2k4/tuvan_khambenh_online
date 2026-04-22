import express        from "express";
import { createServer } from "http";
import { Server }     from "socket.io";
import dotenv         from "dotenv";
import cors           from "cors";
import cookieParser   from "cookie-parser";
import { connecDB }   from "./config/db.js";
import { khoiTaoSocket } from "./socket/socketHandler.js";

import authRouter      from "./routers/auth.Routers.js";
import bacSiRouter     from "./routers/bacSi.Routers.js";
import nguoiDungRouter from "./routers/nguoiDung.Routers.js";
import lichKhamRouter  from "./routers/lichKham.Routers.js";
import chatRouter      from "./routers/chat.Routers.js";
import danhGiaRouter   from "./routers/danhGia.Routers.js";

dotenv.config();

const app    = express();
const server = createServer(app);       // HTTP server bọc Express
const PORT   = process.env.PORT || 5001;
const CLIENT = process.env.CLIENT_URL  || "http://localhost:5173";

// ── Kết nối DB ────────────────────────────────────────────────────────────────
connecDB();

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: CLIENT, credentials: true },
    // Tự động fallback polling nếu WebSocket không khả dụng
    transports: ["websocket", "polling"],
});
khoiTaoSocket(io);

// ── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Đính kèm io vào request để controller dùng nếu cần
app.use((req, _res, next) => { req.io = io; next(); });

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",       authRouter);
app.use("/api/bac-si",     bacSiRouter);
app.use("/api/nguoi-dung", nguoiDungRouter);
app.use("/api/lich-kham",  lichKhamRouter);
app.use("/api/chat",       chatRouter);
app.use("/api/danh-gia", danhGiaRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.json({
    message: "🚀 Server đang chạy",
    version: "3.0",
    socket:  "Socket.IO enabled",
}));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("Lỗi:", err.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
});

// ── Start (dùng server.listen thay vì app.listen) ────────────────────────────
server.listen(PORT, () => {
    console.log(`✅ HTTP + Socket.IO chạy tại http://localhost:${PORT}`);
});