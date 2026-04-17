import { xacMinhAccessToken } from "../utils/jwt.js";
import { luuTinNhan, danhDauDaDoc } from "../services/chat.service.js";

/**
 * Khởi tạo Socket.IO và đăng ký tất cả event handler.
 * Gọi hàm này từ server.js sau khi tạo httpServer.
 *
 * Luồng:
 *   Client kết nối → gửi token qua handshake.auth.token
 *   → xác minh JWT → lưu thông tin user vào socket
 *   → join room cá nhân "user:<id>"
 *
 * Events client → server:
 *   join-phong   { phongId }
 *   gui-tin-nhan { phongId, noiDung }
 *   da-doc       { phongId }
 *   dang-nhap    (không cần data)
 *   dang-xuat    (không cần data)
 *
 * Events server → client:
 *   tin-nhan-moi       { tin, phongId }
 *   da-doc             { phongId }
 *   nguoi-dung-online  { nguoiDungId }
 *   nguoi-dung-offline { nguoiDungId }
 *   loi                { message }
 */
export const khoiTaoSocket = (io) => {

    // ── Middleware xác thực JWT ───────────────────────────────────────────────
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Không có token xác thực"));

            const payload = xacMinhAccessToken(token);
            socket.nguoiDung = { id: payload.id, vaiTro: payload.vaiTro };
            next();
        } catch {
            next(new Error("Token không hợp lệ hoặc hết hạn"));
        }
    });

    // Lưu danh sách user đang online: Map<nguoiDungId, Set<socketId>>
    const online = new Map();

    const themOnline = (nguoiDungId, socketId) => {
        if (!online.has(nguoiDungId)) online.set(nguoiDungId, new Set());
        online.get(nguoiDungId).add(socketId);
    };

    const xoaOnline = (nguoiDungId, socketId) => {
        online.get(nguoiDungId)?.delete(socketId);
        if (online.get(nguoiDungId)?.size === 0) online.delete(nguoiDungId);
    };

    const laOnline = (nguoiDungId) => online.has(nguoiDungId);

    // ── Kết nối ──────────────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const { id: nguoiDungId, vaiTro } = socket.nguoiDung;

        // Join room cá nhân để nhận thông báo riêng
        socket.join(`user:${nguoiDungId}`);
        themOnline(nguoiDungId, socket.id);

        // Thông báo online cho tất cả
        socket.broadcast.emit("nguoi-dung-online", { nguoiDungId });

        console.log(`✅ Socket: ${vaiTro} ${nguoiDungId} kết nối (${socket.id})`);

        // ── join-phong: vào phòng chat cụ thể ────────────────────────────────
        socket.on("join-phong", ({ phongId }) => {
            if (!phongId) return;
            socket.join(`phong:${phongId}`);
            console.log(`   → ${nguoiDungId} vào phòng ${phongId}`);
        });

        // ── gui-tin-nhan: gửi tin nhắn ────────────────────────────────────────
        socket.on("gui-tin-nhan", async ({ phongId, noiDung }) => {
            try {
                if (!phongId || !noiDung?.trim()) return;

                // Lưu vào DB
                const tin = await luuTinNhan(phongId, nguoiDungId, noiDung.trim());

                // Phát đến tất cả trong phòng (kể cả người gửi)
                io.to(`phong:${phongId}`).emit("tin-nhan-moi", {
                    tin,
                    phongId,
                });

                // Nếu người nhận không trong phòng → vẫn push vào room cá nhân
                // để cập nhật badge chưa đọc
                io.to(`phong:${phongId}`).emit("cap-nhat-phong", { phongId });

            } catch (e) {
                socket.emit("loi", { message: e.message });
            }
        });

        // ── da-doc: đánh dấu đã đọc ──────────────────────────────────────────
        socket.on("da-doc", async ({ phongId }) => {
            try {
                if (!phongId) return;
                await danhDauDaDoc(phongId, nguoiDungId, vaiTro);
                // Thông báo cho đối phương biết tin đã được đọc
                socket.to(`phong:${phongId}`).emit("da-doc", { phongId, nguoiDungId });
            } catch (e) {
                socket.emit("loi", { message: e.message });
            }
        });

        // ── Đang nhập / ngừng nhập ────────────────────────────────────────────
        socket.on("dang-nhap", ({ phongId }) => {
            socket.to(`phong:${phongId}`).emit("dang-nhap", { nguoiDungId, phongId });
        });

        socket.on("ngung-nhap", ({ phongId }) => {
            socket.to(`phong:${phongId}`).emit("ngung-nhap", { nguoiDungId, phongId });
        });

        // ── Kiểm tra online ───────────────────────────────────────────────────
        socket.on("kiem-tra-online", ({ nguoiDungIds }) => {
            const ketQua = {};
            (nguoiDungIds || []).forEach(id => {
                ketQua[id] = laOnline(id);
            });
            socket.emit("trang-thai-online", ketQua);
        });

        // ── Ngắt kết nối ─────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            xoaOnline(nguoiDungId, socket.id);
            if (!laOnline(nguoiDungId)) {
                socket.broadcast.emit("nguoi-dung-offline", { nguoiDungId });
            }
            console.log(`❌ Socket: ${nguoiDungId} ngắt kết nối`);
        });
    });
};