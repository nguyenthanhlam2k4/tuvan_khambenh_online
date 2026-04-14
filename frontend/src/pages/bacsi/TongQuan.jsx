import { useState, useEffect } from "react";
import { layHoSoCaNhan } from "../../api/bacSiApi";

export default function TongQuan() {
    const [hoSo, setHoSo]     = useState(null);
    const [loading, setLoad]  = useState(true);

    useEffect(() => {
        layHoSoCaNhan()
            .then(r => setHoSo(r.data.data))
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    if (loading) return <div style={s.center}>Đang tải...</div>;

    if (!hoSo) return (
        <div style={s.noProfile}>
            <div style={s.noProfileIcon}>📋</div>
            <div style={s.noProfileTitle}>Chưa có hồ sơ bác sĩ</div>
            <p style={s.noProfileSub}>Vào <strong>Hồ sơ cá nhân</strong> để tạo hồ sơ và bắt đầu nhận bệnh nhân.</p>
        </div>
    );

    return (
        <div>
            {/* Trạng thái xác minh */}
            {!hoSo.daXacMinh && (
                <div style={s.warnBanner}>
                    Hồ sơ đang chờ admin xác minh. Bạn chưa thể xuất hiện trong danh sách bác sĩ.
                </div>
            )}

            {/* Stat cards */}
            <div style={s.grid4}>
                <StatCard label="Lịch hôm nay"     value="—" sub="Chưa có dữ liệu" />
                <StatCard label="Tổng lịch tháng"  value="—" sub="Chưa có dữ liệu" />
                <StatCard label="Điểm đánh giá"    value={hoSo.diemDanhGia > 0 ? `${hoSo.diemDanhGia.toFixed(1)} ★` : "—"} sub={`${hoSo.tongDanhGia} lượt đánh giá`} />
                <StatCard label="Ngày đã đăng ký"  value={hoSo.lichLamViec?.length || 0} sub="ngày trong lịch" />
            </div>

            {/* Lịch làm việc sắp tới */}
            <div style={s.card}>
                <div style={s.cardTitle}>Lịch làm việc sắp tới</div>
                {hoSo.lichLamViec?.length > 0 ? (
                    hoSo.lichLamViec
                        .filter(n => n.ngay >= new Date().toISOString().slice(0, 10))
                        .slice(0, 5)
                        .map(n => (
                            <div key={n.ngay} style={s.ngayRow}>
                                <div style={s.ngayLabel}>{formatNgay(n.ngay)}</div>
                                <div style={s.slotList}>
                                    {n.khungGios?.map(k => (
                                        <span key={k._id} style={{ ...s.slot, background: k.daDat ? "#FEF3C7" : "#D1FAE5", color: k.daDat ? "#92400E" : "#065F46" }}>
                                            {k.gio}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                ) : (
                    <div style={s.empty}>Chưa có lịch làm việc. Vào <strong>Lịch làm việc</strong> để đăng ký.</div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, sub }) {
    return (
        <div style={{ background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#111" }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

function formatNgay(str) {
    const [y, m, d] = str.split("-");
    const thu = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][new Date(str).getDay()];
    return `${thu}, ${d}/${m}/${y}`;
}

const s = {
    center:         { padding: 40, textAlign: "center", color: "#9CA3AF" },
    noProfile:      { textAlign: "center", padding: "60px 20px" },
    noProfileIcon:  { fontSize: 40, marginBottom: 12 },
    noProfileTitle: { fontSize: 18, fontWeight: 600, color: "#111", marginBottom: 8 },
    noProfileSub:   { fontSize: 14, color: "#6B7280" },
    warnBanner:     { background: "#FEF3C7", border: "0.5px solid #FCD34D", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400E", marginBottom: 16 },
    grid4:          { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 },
    card:           { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "16px 18px" },
    cardTitle:      { fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 12, paddingBottom: 8, borderBottom: "0.5px solid #F3F4F6" },
    ngayRow:        { display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: "0.5px solid #F9FAFB" },
    ngayLabel:      { fontSize: 12, fontWeight: 500, color: "#374151", minWidth: 110 },
    slotList:       { display: "flex", gap: 6, flexWrap: "wrap" },
    slot:           { padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
    empty:          { fontSize: 13, color: "#9CA3AF", padding: "12px 0" },
};