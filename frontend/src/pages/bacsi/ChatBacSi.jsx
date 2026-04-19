import { useState } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { useAuth }          from "../../context/AuthContext";
import DanhSachPhong        from "../../components/chat/DanhSachPhong";
import ChatBox              from "../../components/chat/ChatBox";

export default function ChatBacSi() {
    const { socket, connected } = useSocketContext();
    const { nguoiDung }         = useAuth();
    const [phongChon, setPhong] = useState(null); // phong object
    const [doiPhuong, setDoi]   = useState(null);

    const onChonPhong = (phong) => {
        setPhong(phong);
        setDoi(phong.benhNhanId?.nguoiDungId);
    };

    return (
        <div style={s.wrap}>
            {/* Cột trái — danh sách */}
            <div style={s.left}>
                <DanhSachPhong
                    phongChon={phongChon?._id}
                    onChonPhong={onChonPhong}
                />
            </div>

            {/* Cột phải — chat */}
            <div style={s.right}>
                {!phongChon ? (
                    <div style={s.placeholder}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                        <div style={s.phTitle}>Chọn cuộc trò chuyện</div>
                        <p style={s.phSub}>Nhấn để xem cuộc trò chuyện</p>
                    </div>
                ) : (
                    <>
                        {/* Header phòng */}
                        <div style={s.chatHeader}>
                            <div style={s.headerAv}>{(doiPhuong?.ten || "?")[0]}</div>
                            <div>
                                <div style={s.headerName}>{doiPhuong?.ten || "Bệnh nhân"}</div>
                                <div style={s.headerSub}>
                                    {connected ? (
                                        <><span style={s.onlineDot} /> Đang kết nối</>
                                    ) : "Đang kết nối lại..."}
                                </div>
                            </div>
                            <button onClick={() => { setPhong(null); setDoi(null); }} style={s.closeBtn}>✕</button>
                        </div>

                        {/* ChatBox */}
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
    placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9CA3AF", textAlign: "center", padding: 40 },
    phTitle:     { fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 8 },
    phSub:       { fontSize: 13, lineHeight: 1.6, margin: 0 },
    chatHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "0.5px solid #E5E7EB", flexShrink: 0 },
    headerAv:    { width: 36, height: 36, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    headerName:  { fontSize: 14, fontWeight: 600, color: "#111" },
    headerSub:   { fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 },
    onlineDot:   { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" },
    closeBtn:    { marginLeft: "auto", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9CA3AF" },
};