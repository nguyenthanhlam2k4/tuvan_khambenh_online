import { useState } from "react";
import { taoDanhGia } from "../api/danhGiaApi";

export default function DanhGiaModal({ lich, onClose, onSuccess }) {
    const [soSao, setSoSao]     = useState(0);
    const [hover, setHover]     = useState(0);
    const [nhanXet, setNhanXet] = useState("");
    const [saving, setSave]     = useState(false);
    const [loi, setLoi]         = useState("");

    const tenBs = lich.bacSiId?.nguoiDungId?.ten || "Bác sĩ";

    const onGui = async () => {
        if (!soSao) return setLoi("Vui lòng chọn số sao");
        setSave(true);
        setLoi("");
        try {
            await taoDanhGia({ lichKhamId: lich._id, soSao, nhanXet });
            onSuccess?.();
            onClose();
        } catch (e) {
            setLoi(e.response?.data?.message || "Gửi đánh giá thất bại");
        } finally {
            setSave(false);
        }
    };

    const SAO_LABEL = { 1: "Rất tệ", 2: "Tệ", 3: "Bình thường", 4: "Tốt", 5: "Xuất sắc" };
    const hienSao = hover || soSao;

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={s.header}>
                    <div style={s.title}>Đánh giá bác sĩ</div>
                    <button onClick={onClose} style={s.closeBtn}>✕</button>
                </div>

                <div style={s.body}>
                    {/* Thông tin bác sĩ */}
                    <div style={s.docRow}>
                        <div style={s.docAv}>{tenBs[0]}</div>
                        <div>
                            <div style={s.docName}>BS. {tenBs}</div>
                            <div style={s.docSpec}>{lich.bacSiId?.chuyenKhoa}</div>
                        </div>
                    </div>

                    {/* Chọn sao */}
                    <div style={s.starSection}>
                        <div style={s.starLabel}>Bạn cảm thấy thế nào?</div>
                        <div style={s.stars}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <button key={i}
                                    onClick={() => setSoSao(i)}
                                    onMouseEnter={() => setHover(i)}
                                    onMouseLeave={() => setHover(0)}
                                    style={{ ...s.star, color: i <= hienSao ? "#FBBF24" : "#E5E7EB" }}>
                                    ★
                                </button>
                            ))}
                        </div>
                        {hienSao > 0 && (
                            <div style={s.starText}>{SAO_LABEL[hienSao]}</div>
                        )}
                    </div>

                    {/* Nhận xét */}
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Nhận xét <span style={{ color: "#9CA3AF" }}>(tùy chọn)</span></label>
                        <textarea
                            value={nhanXet}
                            onChange={e => setNhanXet(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về bác sĩ này..."
                            style={s.textarea}
                            rows={3}
                            maxLength={500}
                        />
                        <div style={s.charCount}>{nhanXet.length}/500</div>
                    </div>

                    {loi && <div style={s.error}>{loi}</div>}

                    {/* Actions */}
                    <div style={s.actions}>
                        <button onClick={onClose} style={s.cancelBtn}>Để sau</button>
                        <button
                            onClick={onGui}
                            disabled={saving || !soSao}
                            style={{ ...s.submitBtn, opacity: (saving || !soSao) ? 0.6 : 1 }}>
                            {saving ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const s = {
    overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal:       { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    header:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid #E5E7EB" },
    title:       { fontSize: 16, fontWeight: 600, color: "#111" },
    closeBtn:    { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9CA3AF" },
    body:        { padding: "20px" },
    docRow:      { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F8FAFC", borderRadius: 10, marginBottom: 20 },
    docAv:       { width: 40, height: 40, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    docName:     { fontSize: 14, fontWeight: 600, color: "#111" },
    docSpec:     { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    starSection: { textAlign: "center", marginBottom: 20 },
    starLabel:   { fontSize: 13, color: "#374151", marginBottom: 10 },
    stars:       { display: "flex", justifyContent: "center", gap: 6 },
    star:        { background: "none", border: "none", fontSize: 40, cursor: "pointer", padding: "0 2px", transition: "transform .1s", lineHeight: 1 },
    starText:    { fontSize: 13, fontWeight: 500, color: "#374151", marginTop: 8, height: 20 },
    fieldWrap:   { display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 },
    label:       { fontSize: 13, fontWeight: 500, color: "#374151" },
    textarea:    { border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#111", resize: "none", fontFamily: "inherit", lineHeight: 1.5 },
    charCount:   { fontSize: 11, color: "#D1D5DB", textAlign: "right" },
    error:       { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#DC2626", marginBottom: 12 },
    actions:     { display: "flex", gap: 8, justifyContent: "flex-end" },
    cancelBtn:   { height: 38, padding: "0 16px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B7280" },
    submitBtn:   { height: 38, padding: "0 20px", border: "none", borderRadius: 8, background: "#1D9E75", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};