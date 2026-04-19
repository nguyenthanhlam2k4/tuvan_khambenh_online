import { useState, useEffect, useCallback, useRef } from "react";
import { layTinNhan, danhDauDaDoc } from "../api/chatApi";

export const useChat = (socket, phongId, nguoiDungId) => {
    const [tinNhans, setTinNhans]  = useState([]);
    const [loading, setLoading]    = useState(false);
    const [doiDang, setDoiDang]    = useState(false);
    const typingTimer              = useRef(null);
    const emitTimer                = useRef(null);

    // Load lịch sử khi vào phòng
    useEffect(() => {
        if (!phongId) return;
        setLoading(true);
        layTinNhan(phongId, { trang: 1, gioiHan: 50 })
            .then(r => setTinNhans(r.data.data.danhSach))
            .catch(() => {})
            .finally(() => setLoading(false));
        danhDauDaDoc(phongId).catch(() => {});
    }, [phongId]);

    // Socket events
    useEffect(() => {
        if (!socket || !phongId) return;

        socket.emit("join-phong", { phongId });
        socket.emit("da-doc", { phongId });

        const onTinMoi = ({ tin, phongId: pid }) => {
            if (pid !== phongId) return;
            setTinNhans(prev => prev.find(t => t._id === tin._id) ? prev : [...prev, tin]);
            socket.emit("da-doc", { phongId });
        };
        const onDangNhap = ({ nguoiDungId: uid }) => {
            if (uid === nguoiDungId) return;
            setDoiDang(true);
            clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setDoiDang(false), 3000);
        };
        const onNgung = () => setDoiDang(false);

        socket.on("tin-nhan-moi", onTinMoi);
        socket.on("dang-nhap",    onDangNhap);
        socket.on("ngung-nhap",   onNgung);

        return () => {
            socket.off("tin-nhan-moi", onTinMoi);
            socket.off("dang-nhap",    onDangNhap);
            socket.off("ngung-nhap",   onNgung);
        };
    }, [socket, phongId, nguoiDungId]);

    const gui = useCallback((noiDung) => {
        if (!socket || !phongId || !noiDung?.trim()) return;
        socket.emit("gui-tin-nhan", { phongId, noiDung: noiDung.trim() });
        socket.emit("ngung-nhap", { phongId });
    }, [socket, phongId]);

    const onTyping = useCallback(() => {
        if (!socket || !phongId) return;
        socket.emit("dang-nhap", { phongId });
        clearTimeout(emitTimer.current);
        emitTimer.current = setTimeout(() => socket.emit("ngung-nhap", { phongId }), 2500);
    }, [socket, phongId]);

    return { tinNhans, loading, doiDang, gui, onTyping };
};