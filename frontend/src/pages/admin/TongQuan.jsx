import { useState, useEffect } from "react";
import { thongKeLich, layTatCaLich } from "../../api/lichKhamApi";
import { layDanhSachBacSi } from "../../api/bacSiApi";

const TRANG_THAI = {
    choduyet:  { label: "Chờ duyệt",   bg: "#FEF3C7", color: "#92400E" },
    daxacnhan: { label: "Đã xác nhận", bg: "#D1FAE5", color: "#065F46" },
    dakham:    { label: "Đã khám",     bg: "#E0E7FF", color: "#3730A3" },
    dahuy:     { label: "Đã huỷ",      bg: "#FEE2E2", color: "#DC2626" },
};

function fmtNgay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
}

export default function TongQuan() {
    const [stats, setStats]   = useState(null);
    const [lich, setLich]     = useState([]);
    const [choduyet, setChod] = useState([]);
    const [loading, setLoad]  = useState(true);

    useEffect(() => {
        Promise.all([
            thongKeLich(),
            layTatCaLich({ gioiHan: 5 }),
            layDanhSachBacSi({ daXacMinh: false, gioiHan: 3 }),
        ]).then(([rStats, rLich, rBs]) => {
            setStats(rStats.data.data);
            setLich(rLich.data.data.danhSach);
            setChod(rBs.data.data.danhSach);
        }).catch(() => {})
          .finally(() => setLoad(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Đang tải...</div>;

    return (
        <div>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                <StatCard label="Tổng lịch khám"    value={stats?.tongLich ?? "—"} />
                <StatCard label="Lịch hôm nay"      value={stats?.homNay ?? "—"}   color="#1D9E75" bg="#ECFDF5" />
                <StatCard label="Chờ duyệt"         value={stats?.choduyet ?? "—"} color="#92400E" bg="#FEF3C7" />
                <StatCard label="Đã xác nhận"       value={stats?.daxacnhan ?? "—"} color="#065F46" bg="#D1FAE5" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
                {/* Lịch khám gần đây */}
                <div style={s.card}>
                    <div style={s.cardTitle}>Lịch khám gần đây</div>
                    {lich.length === 0 ? (
                        <div style={s.empty}>Chưa có dữ liệu</div>
                    ) : lich.map(l => {
                        const ts = TRANG_THAI[l.trangThai];
                        const tenBn = l.benhNhanId?.nguoiDungId?.ten || "Bệnh nhân";
                        const tenBs = l.bacSiId?.nguoiDungId?.ten || "Bác sĩ";
                        return (
                            <div key={l._id} style={s.row}>
                                <div style={s.timeWrap}>
                                    <div style={s.rowNgay}>{fmtNgay(l.ngay)}</div>
                                    <div style={s.rowGio}>{l.gio}</div>
                                </div>
                                <div style={s.rowInfo}>
                                    <div style={s.rowTen}>{tenBn}</div>
                                    <div style={s.rowSub}>BS. {tenBs} · {l.bacSiId?.chuyenKhoa}</div>
                                </div>
                                <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>{ts.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Bác sĩ chờ duyệt */}
                <div style={s.card}>
                    <div style={s.cardTitle}>Bác sĩ chờ duyệt ({choduyet.length})</div>
                    {choduyet.length === 0 ? (
                        <div style={s.empty}>Không có hồ sơ chờ duyệt</div>
                    ) : choduyet.map(bs => (
                        <div key={bs._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "0.5px solid #F3F4F6" }}>
                            <div style={s.bsAvatar}>{bs.nguoiDungId?.ten?.[0] || "B"}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{bs.nguoiDungId?.ten}</div>
                                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{bs.chuyenKhoa}</div>
                            </div>
                            <span style={{ ...s.badge, background: "#FEF3C7", color: "#92400E" }}>Chờ duyệt</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "#111", bg = "#F8F9FA" }) {
    return (
        <div style={{ background: bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}

const s = {
    card:     { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "14px 16px" },
    cardTitle:{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 10, paddingBottom: 8, borderBottom: "0.5px solid #F3F4F6" },
    row:      { display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "0.5px solid #F3F4F6" },
    timeWrap: { minWidth: 64 },
    rowNgay:  { fontSize: 10, color: "#9CA3AF" },
    rowGio:   { fontSize: 14, fontWeight: 700, color: "#1D9E75" },
    rowInfo:  { flex: 1, minWidth: 0 },
    rowTen:   { fontSize: 13, fontWeight: 500, color: "#111" },
    rowSub:   { fontSize: 11, color: "#9CA3AF" },
    badge:    { padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500, flexShrink: 0 },
    bsAvatar: { width: 28, height: 28, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    empty:    { padding: "16px 0", color: "#9CA3AF", fontSize: 13, textAlign: "center" },
};