import { useState, useEffect } from "react";
import { layHoSoCaNhan } from "../../api/bacSiApi";

const TRANG_THAI = {
    choduyet:   { label: "Chờ duyệt",   bg: "#FEF3C7", color: "#92400E" },
    daxacnhan:  { label: "Đã xác nhận", bg: "#D1FAE5", color: "#065F46" },
    dakham:     { label: "Đã khám",     bg: "#E0E7FF", color: "#3730A3" },
    dahuy:      { label: "Đã huỷ",      bg: "#FEE2E2", color: "#DC2626" },
};

function formatNgay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    const thu = ["CN","T2","T3","T4","T5","T6","T7"][new Date(str).getDay()];
    return `${thu}, ${d}/${m}/${y}`;
}

export default function LichHen() {
    const [hoSo, setHoSo]       = useState(null);
    const [loading, setLoad]    = useState(true);
    const [filter, setFilter]   = useState("tat-ca");
    const [tuKhoa, setTuKhoa]   = useState("");

    useEffect(() => {
        layHoSoCaNhan()
            .then(r => setHoSo(r.data.data))
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    // Lấy tất cả slot đã được đặt từ lichLamViec
    const tatCaSlot = (hoSo?.lichLamViec || []).flatMap(ngay =>
        ngay.khungGio
            .filter(k => k.daDat)
            .map(k => ({
                ngay: ngay.ngay,
                gio: k.gio,
                slotId: k._id,
                // Phase 3 sẽ có thêm thông tin bệnh nhân từ LichKham
                trangThai: "daxacnhan",
            }))
    ).sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio));

    const hienThi = tatCaSlot.filter(item => {
        const khopFilter = filter === "tat-ca" || item.trangThai === filter;
        const khopTuKhoa = !tuKhoa || item.ngay.includes(tuKhoa) || item.gio.includes(tuKhoa);
        return khopFilter && khopTuKhoa;
    });

    const today = new Date().toISOString().slice(0, 10);
    const sapToi  = tatCaSlot.filter(s => s.ngay >= today).length;
    const daQua   = tatCaSlot.filter(s => s.ngay < today).length;

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Đang tải...</div>;

    if (!hoSo) return (
        <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
            Chưa có hồ sơ bác sĩ. Vào <strong>Hồ sơ cá nhân</strong> để tạo.
        </div>
    );

    return (
        <div style={{ maxWidth: 800 }}>

            {/* Thống kê nhanh */}
            <div style={s.statRow}>
                <StatCard label="Tổng lịch hẹn"   value={tatCaSlot.length} />
                <StatCard label="Sắp tới"          value={sapToi}  color="#065F46" bg="#D1FAE5" />
                <StatCard label="Đã qua"           value={daQua}   color="#6B7280" bg="#F3F4F6" />
            </div>

            {/* Toolbar */}
            <div style={s.toolbar}>
                <input
                    placeholder="Tìm ngày (vd: 2026-04)..."
                    value={tuKhoa}
                    onChange={e => setTuKhoa(e.target.value)}
                    style={s.searchInput}
                />
                <div style={s.filterGroup}>
                    {[
                        { key: "tat-ca",    label: "Tất cả" },
                        { key: "daxacnhan", label: "Đã xác nhận" },
                        { key: "choduyet",  label: "Chờ duyệt" },
                        { key: "dahuy",     label: "Đã huỷ" },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Danh sách lịch */}
            {hienThi.length === 0 ? (
                <div style={s.empty}>
                    {tatCaSlot.length === 0
                        ? "Chưa có lịch hẹn nào. Bệnh nhân sẽ xuất hiện ở đây sau khi đặt lịch."
                        : "Không có kết quả phù hợp."
                    }
                </div>
            ) : (
                <div style={s.list}>
                    {hienThi.map((item, i) => {
                        const ts = TRANG_THAI[item.trangThai] || TRANG_THAI.daxacnhan;
                        const laSapToi = item.ngay >= today;
                        return (
                            <div key={`${item.ngay}-${item.gio}-${i}`} style={s.row}>
                                {/* Cột ngày giờ */}
                                <div style={s.timeCol}>
                                    <div style={s.timeNgay}>{formatNgay(item.ngay)}</div>
                                    <div style={s.timeGio}>{item.gio}</div>
                                    {laSapToi && <div style={s.sapToiBadge}>Sắp tới</div>}
                                </div>

                                {/* Cột thông tin — Phase 3 sẽ có tên bệnh nhân */}
                                <div style={s.infoCol}>
                                    <div style={s.benhNhanName}>— Chưa có thông tin bệnh nhân</div>
                                    <div style={s.benhNhanSub}>Tích hợp sau khi hoàn thành API lịch khám</div>
                                </div>

                                {/* Trạng thái */}
                                <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>
                                    {ts.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>
                Hiển thị {hienThi.length} / {tatCaSlot.length} lịch hẹn.
                Thông tin bệnh nhân sẽ có sau Phase 3.
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "#111", bg = "#F8F9FA" }) {
    return (
        <div style={{ flex: 1, background: bg, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
        </div>
    );
}

const s = {
    statRow:      { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 },
    toolbar:      { display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" },
    searchInput:  { height: 32, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 12, color: "#111", width: 200 },
    filterGroup:  { display: "flex", gap: 4 },
    filterBtn:    { height: 30, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 11, background: "#fff", color: "#6B7280", cursor: "pointer" },
    filterActive: { background: "#111", color: "#fff", border: "0.5px solid #1D9E75" },
    empty:        { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "40px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" },
    list:         { display: "flex", flexDirection: "column", gap: 6 },
    row:          { display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "12px 16px" },
    timeCol:      { minWidth: 120 },
    timeNgay:     { fontSize: 12, fontWeight: 500, color: "#111" },
    timeGio:      { fontSize: 18, fontWeight: 600, color: "#1D9E75", lineHeight: 1.2 },
    sapToiBadge:  { display: "inline-block", marginTop: 3, fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "1px 7px", borderRadius: 20 },
    infoCol:      { flex: 1 },
    benhNhanName: { fontSize: 13, fontWeight: 500, color: "#374151" },
    benhNhanSub:  { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    badge:        { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 },
};