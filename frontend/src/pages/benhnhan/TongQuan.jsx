import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { layLichCuaBenhNhan } from "../../api/lichKhamApi";

const TRANG_THAI = {
    choduyet:  { label: "Chờ duyệt",   bg: "#FEF3C7", color: "#92400E" },
    daxacnhan: { label: "Đã xác nhận", bg: "#D1FAE5", color: "#065F46" },
    dakham:    { label: "Đã khám",     bg: "#E0E7FF", color: "#3730A3" },
    dahuy:     { label: "Đã huỷ",      bg: "#FEE2E2", color: "#DC2626" },
};

function fmtNgay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    const thu = ["CN","T2","T3","T4","T5","T6","T7"][new Date(str).getDay()];
    return `${thu}, ${d}/${m}/${y}`;
}

export default function TongQuan() {
    const navigate = useNavigate();
    const [lich, setLich]    = useState([]);
    const [stats, setStats]  = useState({ tong: 0, sapToi: 0, daKham: 0 });
    const [loading, setLoad] = useState(true);

    useEffect(() => {
        layLichCuaBenhNhan({ gioiHan: 20 })
            .then(r => {
                const ds = r.data.data.danhSach;
                const today = new Date().toISOString().slice(0, 10);
                setLich(ds.slice(0, 3));
                setStats({
                    tong:   ds.length,
                    sapToi: ds.filter(l => l.ngay >= today && l.trangThai !== "dahuy").length,
                    daKham: ds.filter(l => l.trangThai === "dakham").length,
                });
            })
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Đang tải...</div>;

    return (
        <div style={{ maxWidth: 720 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                <StatCard label="Tổng lịch khám"  value={stats.tong}   />
                <StatCard label="Sắp tới"          value={stats.sapToi} color="#1D9E75" bg="#ECFDF5" />
                <StatCard label="Đã khám"          value={stats.daKham} color="#6D28D9" bg="#EDE9FE" />
            </div>

            {/* Lịch sắp tới */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div style={s.cardTitle}>Lịch khám gần đây</div>
                    <button onClick={() => navigate("/benh-nhan?tab=lich-kham")} style={s.xemTat}>Xem tất cả →</button>
                </div>
                {lich.length === 0 ? (
                    <div style={s.empty}>
                        Chưa có lịch khám nào.
                        <button onClick={() => navigate("/benh-nhan?tab=tim-bac-si")} style={s.timBtn}>Tìm bác sĩ ngay</button>
                    </div>
                ) : lich.map(l => {
                    const ts = TRANG_THAI[l.trangThai];
                    const tenBs = l.bacSiId?.nguoiDungId?.ten || "Bác sĩ";
                    return (
                        <div key={l._id} style={s.lichRow}>
                            <div style={s.lichTime}>
                                <div style={s.lichNgay}>{fmtNgay(l.ngay)}</div>
                                <div style={s.lichGio}>{l.gio}</div>
                            </div>
                            <div style={s.lichInfo}>
                                <div style={s.lichBs}>BS. {tenBs}</div>
                                <div style={s.lichSpec}>{l.bacSiId?.chuyenKhoa}</div>
                            </div>
                            <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>{ts.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* CTA */}
            <div style={s.cta}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Cần khám bệnh?</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Tìm bác sĩ và đặt lịch ngay hôm nay</div>
                </div>
                <button onClick={() => navigate("/benh-nhan?tab=tim-bac-si")} style={s.ctaBtn}>Tìm bác sĩ</button>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "#111", bg = "#F8F9FA" }) {
    return (
        <div style={{ background: bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{label}</div>
        </div>
    );
}

const s = {
    card:       { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "16px 18px", marginBottom: 14 },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cardTitle:  { fontSize: 13, fontWeight: 600, color: "#111" },
    xemTat:     { fontSize: 12, color: "#1D9E75", background: "none", border: "none", cursor: "pointer" },
    lichRow:    { display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: "0.5px solid #F3F4F6" },
    lichTime:   { minWidth: 100 },
    lichNgay:   { fontSize: 11, color: "#9CA3AF" },
    lichGio:    { fontSize: 16, fontWeight: 700, color: "#1D9E75" },
    lichInfo:   { flex: 1 },
    lichBs:     { fontSize: 13, fontWeight: 500, color: "#111" },
    lichSpec:   { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
    badge:      { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 },
    empty:      { padding: "20px 0", color: "#9CA3AF", fontSize: 13, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
    timBtn:     { height: 32, padding: "0 16px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" },
    cta:        { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    ctaBtn:     { height: 34, padding: "0 16px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" },
};