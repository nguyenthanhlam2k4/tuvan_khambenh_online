import { useState, useEffect } from "react";
import { layHoSoCaNhan, dangKyLich, xoaSlot, xoaNgay } from "../../api/bacSiApi";

// Các khung giờ gợi ý
const KHUNG_GIO_GY = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
                       "11:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

// Lấy danh sách 7 ngày trong tuần tính từ thứ 2 của tuần offset
function layTuan(offset = 0) {
    const today = new Date();
    const thu2  = new Date(today);
    thu2.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(thu2);
        d.setDate(thu2.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

const THU = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function LichLamViec() {
    const [hoSo, setHoSo]           = useState(null);
    const [loading, setLoad]        = useState(true);
    const [offset, setOffset]       = useState(0);
    const [saving, setSave]         = useState(false);
    const [msg, setMsg]             = useState("");

    // Các slot đang được chọn để thêm mới: { "2026-04-14": Set(["08:00","09:30"]) }
    const [chonMoi, setChonMoi]     = useState({});

    const tuan = layTuan(offset);

    useEffect(() => {
        setLoad(true);
        layHoSoCaNhan()
            .then(r => setHoSo(r.data.data))
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    // Lấy dữ liệu lịch của 1 ngày từ hoSo
    const layLichNgay = (ngay) =>
        hoSo?.lichLamViec?.find(n => n.ngay === ngay);

    // Toggle chọn/bỏ slot mới
    const toggleChon = (ngay, gio) => {
        setChonMoi(prev => {
            const set = new Set(prev[ngay] || []);
            set.has(gio) ? set.delete(gio) : set.add(gio);
            return { ...prev, [ngay]: set };
        });
    };

    // Lưu tất cả slot đang chọn
    const luuLich = async () => {
        const lichTuan = Object.entries(chonMoi)
            .filter(([, set]) => set.size > 0)
            .map(([ngay, set]) => ({ ngay, khungGio: [...set] }));

        if (!lichTuan.length) return setMsg("Chưa chọn khung giờ nào");

        setSave(true);
        setMsg("");
        try {
            await dangKyLich(hoSo._id, lichTuan);
            // Reload hồ sơ để cập nhật lịch
            const r = await layHoSoCaNhan();
            setHoSo(r.data.data);
            setChonMoi({});
            setMsg("✓ Đã lưu lịch thành công");
        } catch (e) {
            setMsg(e.response?.data?.message || "Lưu thất bại");
        } finally {
            setSave(false);
        }
    };

    // Xoá 1 slot đã có
    const handleXoaSlot = async (ngay, slotId, daDat) => {
        if (daDat) return setMsg("Không thể xoá slot đã có người đặt");
        if (!confirm(`Xoá slot ngày ${ngay}?`)) return;
        try {
            await xoaSlot(hoSo._id, ngay, slotId);
            const r = await layHoSoCaNhan();
            setHoSo(r.data.data);
        } catch (e) {
            setMsg(e.response?.data?.message || "Xoá thất bại");
        }
    };

    // Xoá cả ngày
    const handleXoaNgay = async (ngay) => {
        if (!confirm(`Xoá toàn bộ lịch ngày ${ngay}?`)) return;
        try {
            await xoaNgay(hoSo._id, ngay);
            const r = await layHoSoCaNhan();
            setHoSo(r.data.data);
        } catch (e) {
            setMsg(e.response?.data?.message || "Xoá thất bại");
        }
    };

    const tongChon = Object.values(chonMoi).reduce((s, set) => s + set.size, 0);
    const today    = new Date().toISOString().slice(0, 10);

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Đang tải...</div>;
    if (!hoSo)   return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Chưa có hồ sơ. Vào <strong>Hồ sơ cá nhân</strong> để tạo.</div>;

    return (
        <div>
            {/* Toolbar tuần */}
            <div style={s.toolbar}>
                <button onClick={() => setOffset(o => o - 1)} style={s.navBtn}>← Tuần trước</button>
                <span style={s.tuanLabel}>
                    {fmtShort(tuan[0])} – {fmtShort(tuan[6])}
                    {offset === 0 && <span style={s.tuanBadge}>Tuần này</span>}
                </span>
                <button onClick={() => setOffset(o => o + 1)} style={s.navBtn}>Tuần sau →</button>

                <div style={{ flex: 1 }} />

                {tongChon > 0 && (
                    <button onClick={luuLich} style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                        {saving ? "Đang lưu..." : `Lưu ${tongChon} slot`}
                    </button>
                )}
            </div>

            {msg && (
                <div style={{ ...s.msg, background: msg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2", color: msg.startsWith("✓") ? "#065F46" : "#DC2626" }}>
                    {msg}
                </div>
            )}

            {/* Chú thích */}
            <div style={s.legend}>
                <LegendItem color="#D1FAE5" text="Còn trống" />
                <LegendItem color="#FEF3C7" text="Đã đặt" />
                <LegendItem color="#DBEAFE" text="Đang chọn" />
            </div>

            {/* Grid lịch tuần */}
            <div style={s.grid}>
                {tuan.map((ngay, idx) => {
                    const lichNgay  = layLichNgay(ngay);
                    const daChon    = chonMoi[ngay] || new Set();
                    const laDaQua   = ngay < today;

                    return (
                        <div key={ngay} style={{ ...s.col, opacity: laDaQua ? 0.5 : 1 }}>
                            {/* Tiêu đề cột */}
                            <div style={{ ...s.colHead, background: ngay === today ? "#ECFDF5" : "#F8F9FA" }}>
                                <div style={{ ...s.thuLabel, color: ngay === today ? "#065F46" : "#374151" }}>{THU[idx]}</div>
                                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ngay.slice(8)}/{ngay.slice(5, 7)}</div>
                                {lichNgay && !laDaQua && (
                                    <button onClick={() => handleXoaNgay(ngay)} style={s.xoaNgayBtn} title="Xoá cả ngày">✕</button>
                                )}
                            </div>

                            {/* Slot hiện có */}
                            {lichNgay?.khungGio?.map(k => (
                                <div key={k._id}
                                    style={{ ...s.slotExist, background: k.daDat ? "#FEF3C7" : "#D1FAE5", color: k.daDat ? "#92400E" : "#065F46" }}
                                    onClick={() => !laDaQua && handleXoaSlot(ngay, k._id, k.daDat)}
                                    title={k.daDat ? "Đã có người đặt" : "Click để xoá"}
                                >
                                    {k.gio}
                                    {!k.daDat && !laDaQua && <span style={s.xoaHint}>×</span>}
                                </div>
                            ))}

                            {/* Slot đang chọn mới */}
                            {!laDaQua && [...daChon].map(gio => (
                                <div key={gio} style={s.slotNew} onClick={() => toggleChon(ngay, gio)}>
                                    {gio} <span style={{ opacity: 0.6 }}>×</span>
                                </div>
                            ))}

                            {/* Nút thêm slot */}
                            {!laDaQua && (
                                <select
                                    value=""
                                    onChange={e => { if (e.target.value) toggleChon(ngay, e.target.value); }}
                                    style={s.addSelect}
                                >
                                    <option value="">+ Thêm giờ</option>
                                    {KHUNG_GIO_GY
                                        .filter(g => !lichNgay?.khungGio?.some(k => k.gio === g) && !daChon.has(g))
                                        .map(g => <option key={g} value={g}>{g}</option>)
                                    }
                                </select>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LegendItem({ color, text }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            {text}
        </div>
    );
}

const fmtShort = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;

const s = {
    toolbar:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
    navBtn:     { height: 32, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" },
    tuanLabel:  { fontSize: 13, fontWeight: 500, color: "#111", display: "flex", alignItems: "center", gap: 8 },
    tuanBadge:  { fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "2px 7px", borderRadius: 20 },
    saveBtn:    { height: 32, padding: "0 16px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
    msg:        { padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 10 },
    legend:     { display: "flex", gap: 14, marginBottom: 10 },
    grid:       { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 },
    col:        { display: "flex", flexDirection: "column", gap: 4 },
    colHead:    { borderRadius: 8, padding: "8px 6px", textAlign: "center", marginBottom: 2, position: "relative" },
    thuLabel:   { fontSize: 12, fontWeight: 600 },
    xoaNgayBtn: { position: "absolute", top: 4, right: 4, width: 16, height: 16, border: "none", background: "transparent", color: "#DC2626", fontSize: 10, cursor: "pointer", padding: 0, lineHeight: 1 },
    slotExist:  { borderRadius: 6, padding: "4px 0", textAlign: "center", fontSize: 11, fontWeight: 500, cursor: "pointer", position: "relative", userSelect: "none" },
    xoaHint:    { position: "absolute", top: 1, right: 3, fontSize: 10, opacity: 0 },
    slotNew:    { borderRadius: 6, padding: "4px 0", textAlign: "center", fontSize: 11, fontWeight: 500, background: "#DBEAFE", color: "#1D4ED8", cursor: "pointer", userSelect: "none" },
    addSelect:  { width: "100%", height: 28, border: "0.5px dashed #D1D5DB", borderRadius: 6, fontSize: 11, color: "#9CA3AF", background: "transparent", cursor: "pointer", textAlign: "center", marginTop: 2 },
};