/**
 * useSocket — hook quản lý kết nối Socket.IO
 *
 * Cách dùng:
 *   const { socket, online } = useSocket();
 *
 * socket sẽ là null nếu chưa đăng nhập hoặc đang kết nối.
 * Hook tự kết nối khi user đăng nhập và tự ngắt khi đăng xuất.
 */
import { useEffect, useState } from "react";
import { io }      from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export const useSocket = () => {
    const { daDangNhap } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [online, setOnline]       = useState({}); // { nguoiDungId: true/false }

    const [prevDaDangNhap, setPrevDaDangNhap] = useState(daDangNhap);

    if (daDangNhap !== prevDaDangNhap) {
        setPrevDaDangNhap(daDangNhap);
        if (!daDangNhap) {
            setSocket(null);
            setConnected(false);
        }
    }

    useEffect(() => {
        if (!daDangNhap) {
            socket?.disconnect();
            return;
        }

        const token = sessionStorage.getItem("accessToken");
        // Nếu đã có socket thì không tạo mới
        if (!token || socket) return;

        // Tạo kết nối mới
        const s = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(s);

        s.on("connect",    () => setConnected(true));
        s.on("disconnect", () => setConnected(false));

        s.on("nguoi-dung-online",  ({ nguoiDungId }) =>
            setOnline(p => ({ ...p, [nguoiDungId]: true })));
        s.on("nguoi-dung-offline", ({ nguoiDungId }) =>
            setOnline(p => ({ ...p, [nguoiDungId]: false })));

        return () => {
            s.disconnect();
        };
    }, [daDangNhap, socket]);

    return { socket, connected, online };
};