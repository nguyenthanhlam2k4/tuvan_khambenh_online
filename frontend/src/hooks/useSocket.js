/**
 * useSocket — hook quản lý kết nối Socket.IO
 *
 * Cách dùng:
 *   const { socket, online } = useSocket();
 *
 * socket sẽ là null nếu chưa đăng nhập hoặc đang kết nối.
 * Hook tự kết nối khi user đăng nhập và tự ngắt khi đăng xuất.
 */
import { useEffect, useRef, useState } from "react";
import { io }      from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export const useSocket = () => {
    const { daDangNhap } = useAuth();
    const socketRef      = useRef(null);
    const [connected, setConnected] = useState(false);
    const [online, setOnline]       = useState({}); // { nguoiDungId: true/false }

    useEffect(() => {
        if (!daDangNhap) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
            return;
        }

        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        // Tạo kết nối mới
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect",    () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("nguoi-dung-online",  ({ nguoiDungId }) =>
            setOnline(p => ({ ...p, [nguoiDungId]: true })));
        socket.on("nguoi-dung-offline", ({ nguoiDungId }) =>
            setOnline(p => ({ ...p, [nguoiDungId]: false })));

        return () => {
            socket.disconnect();
        };
    }, [daDangNhap]);

    return { socket: socketRef.current, connected, online };
};