import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export function SocketProvider({ children }) {
    const { daDangNhap } = useAuth();
    const socketRef      = useRef(null);
    const [connected, setConnected]     = useState(false);
    const [onlineMap, setOnlineMap]     = useState({}); // { nguoiDungId: true }

    useEffect(() => {
        if (!daDangNhap) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
            return;
        }

        const token = sessionStorage.getItem("accessToken");
        if (!token || socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect",    () => { setConnected(true);  console.log("🟢 Socket connected"); });
        socket.on("disconnect", () => { setConnected(false); console.log("🔴 Socket disconnected"); });
        socket.on("connect_error", (e) => console.warn("Socket error:", e.message));

        socket.on("nguoi-dung-online",  ({ nguoiDungId }) =>
            setOnlineMap(p => ({ ...p, [nguoiDungId]: true })));
        socket.on("nguoi-dung-offline", ({ nguoiDungId }) =>
            setOnlineMap(p => ({ ...p, [nguoiDungId]: false })));

        return () => { socket.disconnect(); };
    }, [daDangNhap]);

    const laOnline = (id) => !!onlineMap[id];

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, laOnline }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocketContext = () => useContext(SocketContext);