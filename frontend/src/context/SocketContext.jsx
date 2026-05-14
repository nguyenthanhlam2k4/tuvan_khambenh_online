import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export function SocketProvider({ children }) {
    const { daDangNhap } = useAuth();
    const [socket, setSocket]           = useState(null);
    const [connected, setConnected]     = useState(false);
    const [onlineMap, setOnlineMap]     = useState({}); // { nguoiDungId: true }

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
        // Nếu đã có socket và đang kết nối/đã kết nối thì không tạo mới
        if (!token || socket) return;

        const s = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(s);

        s.on("connect",    () => { setConnected(true);  console.log("🟢 Socket connected"); });
        s.on("disconnect", () => { setConnected(false); console.log("🔴 Socket disconnected"); });
        s.on("connect_error", (e) => console.warn("Socket error:", e.message));

        s.on("nguoi-dung-online",  ({ nguoiDungId }) =>
            setOnlineMap(p => ({ ...p, [nguoiDungId]: true })));
        s.on("nguoi-dung-offline", ({ nguoiDungId }) =>
            setOnlineMap(p => ({ ...p, [nguoiDungId]: false })));

        return () => { s.disconnect(); };
    }, [daDangNhap, socket]);

    const laOnline = (id) => !!onlineMap[id];

    return (
        <SocketContext.Provider value={{ socket, connected, laOnline }}>
            {children}
        </SocketContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => useContext(SocketContext);