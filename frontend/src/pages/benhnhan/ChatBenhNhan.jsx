import { useState, useEffect } from "react";
import { useNavigate }          from "react-router";
import { useSocketContext }     from "../../context/SocketContext";
import { useAuth }              from "../../context/AuthContext";
import { layHoacTaoPhong }      from "../../api/chatApi";
import DanhSachPhong            from "../../components/chat/DanhSachPhong";
import ChatBox                  from "../../components/chat/ChatBox";

export default function ChatBenhNhan({ bacSiIdKhoiTao, lichKhamId }) {
    const navigate              = useNavigate();
    const { socket, connected } = useSocketContext();
    const { nguoiDung }         = useAuth();
    const [phongChon, setPhong] = useState(null);
    const [doiPhuong, setDoi]   = useState(null);
    const [creating, setCreate] = useState(false);

    // Nếu được truyền bacSiIdKhoiTao → tự tạo/lấy phòng ngay
    useEffect(() => {
        if (!bacSiIdKhoiTao) return;
        setCreate(true);
        layHoacTaoPhong(bacSiIdKhoiTao, lichKhamId)
            .then(r => {
                const phong = r.data.data;
                setPhong(phong);
                setDoi(phong.bacSiId?.nguoiDungId);
            })
            .catch(() => {})
            .finally(() => setCreate(false));
    }, [bacSiIdKhoiTao]);

    const onChonPhong = (phong) => {
        setPhong(phong);
        setDoi(phong.bacSiId?.nguoiDungId);
    };

    return (
        <div style={s.wrap}>
            {/* Cột trái */}
            <div style={s.left}>
                <DanhSachPhong
                    phongChon={phongChon?._id}
                    onChonPhong={onChonPhong}
                />
            </div>

            {/* Cột phải */}
            <div style={s.right}>
                {creating ? (
                    <div style={s.placeholder}>
                        <div style={s.spinner} />
                        <div style={{ marginTop: 12, fontSize: 13, color: "#9CA3AF" }}>Đang kết nối...</div>
                    </div>
                ) : !phongChon ? (
                    <div style={s.placeholder}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
                        <div style={s.phTitle}>Tư vấn với bác sĩ</div>
                        <p style={s.phSub}>
                            Nhấn để xem cuộc trò chuyện
                        </p>
                        <button onClick={() => navigate("/benh-nhan?tab=tim-bac-si")} style={s.findBtn}>
                            Tìm bác sĩ
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={s.chatHeader}>
                            <div style={s.headerAv}>{(doiPhuong?.ten || "B")[0]}</div>
                            <div>
                                <div style={s.headerName}>BS. {doiPhuong?.ten || "Bác sĩ"}</div>
                                <div style={s.headerSub}>
                                    {connected
                                        ? <><span style={s.onlineDot} /> Đang kết nối</>
                                        : "Đang kết nối lại..."
                                    }
                                    {phongChon.lichKhamId && (
                                        <span style={s.lichTag}>· Lịch khám #{String(phongChon.lichKhamId).slice(-6)}</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => { setPhong(null); setDoi(null); }} style={s.closeBtn}>✕</button>
                        </div>

                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <ChatBox
                                socket={socket}
                                phongId={phongChon._id}
                                doiPhuong={doiPhuong}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const s = {
    wrap:        { display: "flex", height: "100%", overflow: "hidden", background: "#fff", borderRadius: 12, border: "0.5px solid #E5E7EB" },
    left:        { width: 280, borderRight: "0.5px solid #E5E7EB", overflow: "hidden", flexShrink: 0 },
    right:       { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40, textAlign: "center" },
    spinner:     { width: 28, height: 28, border: "2px solid #E5E7EB", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin .7s linear infinite" },
    phTitle:     { fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 8 },
    phSub:       { fontSize: 13, color: "#9CA3AF", lineHeight: 1.6, margin: "0 0 20px" },
    findBtn:     { height: 38, padding: "0 20px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer" },
    chatHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "0.5px solid #E5E7EB", flexShrink: 0 },
    headerAv:    { width: 36, height: 36, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    headerName:  { fontSize: 14, fontWeight: 600, color: "#111" },
    headerSub:   { fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 },
    onlineDot:   { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" },
    lichTag:     { color: "#D1D5DB" },
    closeBtn:    { marginLeft: "auto", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9CA3AF" },
};