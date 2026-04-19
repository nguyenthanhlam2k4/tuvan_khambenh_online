import { useEffect, useState, useCallback } from "react";
import { layDanhSachPhong } from "../../api/chatApi";
import { useSocketContext } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

function fmtTime(str) {
    if (!str) return "";
    const d   = new Date(str);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000)    return "Vừa xong";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

export default function DanhSachPhong({ phongChon, onChonPhong }) {
    const { nguoiDung }            = useAuth();
    const { socket, laOnline }     = useSocketContext();
    const [phongs, setPhongs]      = useState([]);
    const [loading, setLoad]       = useState(true);

    const tai = useCallback(() => {
        layDanhSachPhong()
            .then(r => setPhongs(r.data.data))
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    useEffect(() => { tai(); }, []);

    useEffect(() => {
        if (!socket) return;

        // Cập nhật preview tin nhắn cuối ngay lập tức khi nhận tin mới
        // không cần gọi lại API
        const onTinMoi = ({ tin, phongId }) => {
            setPhongs(prev => prev.map(p => {
                if (p._id !== phongId) return p;
                return {
                    ...p,
                    tinNhanCuoi:  tin.noiDung,
                    thoiGianCuoi: tin.ngayGui || new Date().toISOString(),
                };
            }));
        };

        // Reload đầy đủ khi có thay đổi phòng (tạo phòng mới, đánh dấu đọc...)
        const onCapNhat = () => tai();

        socket.on("tin-nhan-moi", onTinMoi);
        socket.on("cap-nhat-phong", onCapNhat);

        return () => {
            socket.off("tin-nhan-moi", onTinMoi);
            socket.off("cap-nhat-phong", onCapNhat);
        };
    }, [socket, tai]);

    const laBacSi = nguoiDung?.vaiTro === "bacsi";

    // Sắp xếp: phòng có tin nhắn gần nhất lên đầu
    const phongsSorted = [...phongs].sort((a, b) => {
        const ta = a.thoiGianCuoi ? new Date(a.thoiGianCuoi) : new Date(a.createdAt);
        const tb = b.thoiGianCuoi ? new Date(b.thoiGianCuoi) : new Date(b.createdAt);
        return tb - ta;
    });

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.headerTitle}>Tin nhắn</div>
                <div style={s.headerCount}>{phongs.length}</div>
            </div>

            {loading ? (
                <div style={s.loading}>Đang tải...</div>
            ) : phongsSorted.length === 0 ? (
                <div style={s.empty}>Chưa có cuộc trò chuyện nào</div>
            ) : phongsSorted.map(phong => {
                const doiPhuong  = laBacSi
                    ? phong.benhNhanId?.nguoiDungId
                    : phong.bacSiId?.nguoiDungId;
                const tenDoi     = doiPhuong?.ten || "?";
                const doiPhuongId = doiPhuong?._id;
                const isChon     = phongChon === phong._id;
                const isOnline   = laOnline(doiPhuongId);
                const badge      = laBacSi ? phong.chuaDocBacSi : phong.chuaDocBenhNhan;
                const preview    = phong.tinNhanCuoi;

                return (
                    <div key={phong._id} onClick={() => onChonPhong(phong)}
                        style={{ ...s.item, ...(isChon ? s.itemActive : {}) }}>

                        {/* Avatar + online dot */}
                        <div style={s.avatarWrap}>
                            <div style={s.avatar}>{tenDoi[0]}</div>
                            {isOnline && <div style={s.onlineDot} />}
                        </div>

                        <div style={s.info}>
                            <div style={s.infoTop}>
                                <span style={{ ...s.ten, fontWeight: badge > 0 ? 600 : 500 }}>
                                    {laBacSi ? tenDoi : `BS. ${tenDoi}`}
                                </span>
                                <span style={s.time}>{fmtTime(phong.thoiGianCuoi)}</span>
                            </div>
                            <div style={{ ...s.preview, fontWeight: badge > 0 ? 500 : 400, color: badge > 0 ? "#374151" : "#9CA3AF" }}>
                                {preview
                                    ? (preview.length > 35 ? preview.slice(0, 35) + "..." : preview)
                                    : <em style={{ fontStyle: "italic", color: "#D1D5DB" }}>Chưa có tin nhắn</em>
                                }
                            </div>
                        </div>

                        {/* Badge chưa đọc */}
                        {badge > 0 && (
                            <div style={s.badge}>{badge > 99 ? "99+" : badge}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const s = {
    wrap:        { width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" },
    header:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "0.5px solid #E5E7EB", flexShrink: 0 },
    headerTitle: { fontSize: 14, fontWeight: 600, color: "#111" },
    headerCount: { fontSize: 12, color: "#9CA3AF" },
    loading:     { padding: 20, textAlign: "center", fontSize: 13, color: "#9CA3AF" },
    empty:       { padding: "32px 16px", textAlign: "center", fontSize: 13, color: "#9CA3AF" },
    item:        { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: "0.5px solid #F9FAFB", transition: "background .12s" },
    itemActive:  { background: "#F0FDF9" },
    avatarWrap:  { position: "relative", flexShrink: 0 },
    avatar:      { width: 38, height: 38, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
    onlineDot:   { position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#1D9E75", border: "1.5px solid #fff" },
    info:        { flex: 1, minWidth: 0 },
    infoTop:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
    ten:         { fontSize: 13, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    time:        { fontSize: 10, color: "#9CA3AF", flexShrink: 0, marginLeft: 6 },
    preview:     { fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    badge:       { minWidth: 18, height: 18, borderRadius: 9, background: "#1D9E75", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", flexShrink: 0 },
};