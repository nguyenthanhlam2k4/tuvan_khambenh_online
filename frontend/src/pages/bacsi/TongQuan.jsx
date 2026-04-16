import { useState, useEffect } from "react";
import { layHoSoCaNhan } from "../../api/bacSiApi";
import { layLichCuaBacSi, doiTrangThai } from "../../api/lichKhamApi";

const TRANG_THAI = {
    choduyet:  { label: "Chờ duyệt",   bg: "#FEF3C7", color: "#92400E" },
    daxacnhan: { label: "Đã xác nhận", bg: "#D1FAE5", color: "#065F46" },
    dakham:    { label: "Đã khám",     bg: "#E0E7FF", color: "#3730A3" },
    dahuy:     { label: "Đã huỷ",      bg: "#FEE2E2", color: "#DC2626" },
};

function formatNgay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    const thu = ["CN","T2","T3","T4","T5","T6","T7"][new Date(str).getDay()];
    return `${thu}, ${d}/${m}/${y}`;
}

export default function TongQuan() {
    const [hoSo, setHoSo]         = useState(null);
    const [lichHomNay, setLich]   = useState([]);
    const [stats, setStats]       = useState({ homNay: 0, sapToi: 0, choduyet: 0 });
    const [loading, setLoad]      = useState(true);
    const [msg, setMsg]           = useState("");

    const today = new Date().toISOString().slice(0, 10);

    const taiDuLieu = async () => {
        try {
            const [rHoSo, rLich] = await Promise.all([
                layHoSoCaNhan(),
                layLichCuaBacSi({ tuNgay: today, gioiHan: 20 }),
            ]);
            const hs = rHoSo.data.data;
            const ds = rLich.data.data.danhSach;
            setHoSo(hs);
            setLich(ds.filter(l => l.ngay === today).slice(0, 5));
            setStats({
                homNay:   ds.filter(l => l.ngay === today).length,
                sapToi:   ds.filter(l => l.ngay > today && l.trangThai !== "dahuy").length,
                choduyet: ds.filter(l => l.trangThai === "choduyet").length,
            });
        } catch { }
        finally { setLoad(false); }
    };

    useEffect(() => { taiDuLieu(); }, []);

    const onDoiTrangThai = async (id, trangThaiMoi) => {
        try {
            await doiTrangThai(id, trangThaiMoi);
            setMsg("✓ Đã cập nhật");
            taiDuLieu();
        } catch (e) {
            setMsg(e.response?.data?.message || "Thất bại");
        }
    };

    if (loading) return <div style={s.center}>Đang tải...</div>;

    if (!hoSo) return (
        <div style={s.noProfile}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111", marginBottom: 8 }}>Chưa có hồ sơ bác sĩ</div>
            <p style={{ fontSize: 14, color: "#6B7280" }}>Vào <strong>Hồ sơ cá nhân</strong> để tạo hồ sơ và bắt đầu nhận bệnh nhân.</p>
        </div>
    );

    return (
        <div>
            {!hoSo.daXacMinh && (
                <div style={s.warnBanner}>
                    Hồ sơ đang chờ admin xác minh. Bạn chưa xuất hiện trong danh sách bác sĩ.
                </div>
            )}

            {msg && (
                <div style={{ ...s.msgBox, background: msg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2", color: msg.startsWith("✓") ? "#065F46" : "#DC2626" }}>
                    {msg}
                </div>
            )}

            {/* Stat cards */}
            <div style={s.grid4}>
                <StatCard label="Lịch hôm nay"    value={stats.homNay}   color="#1D9E75" bg="#ECFDF5" />
                <StatCard label="Sắp tới"          value={stats.sapToi}   />
                <StatCard label="Chờ duyệt"        value={stats.choduyet} color="#92400E" bg="#FEF3C7" />
                <StatCard label="Điểm đánh giá"
                    value={hoSo.diemDanhGia > 0 ? `${hoSo.diemDanhGia.toFixed(1)} ★` : "—"}
                    sub={`${hoSo.tongDanhGia} đánh giá`} />
            </div>

            {/* Lịch hôm nay */}
            <div style={s.card}>
                <div style={s.cardTitle}>Lịch hẹn hôm nay — {formatNgay(today)}</div>
                {lichHomNay.length === 0 ? (
                    <div style={s.empty}>Không có lịch hẹn hôm nay.</div>
                ) : lichHomNay.map(l => {
                    const ts = TRANG_THAI[l.trangThai];
                    const tenBn = l.benhNhanId?.nguoiDungId?.ten || "Bệnh nhân";
                    return (
                        <div key={l._id} style={s.lichRow}>
                            {/* Giờ */}
                            <div style={s.gioCol}>
                                <div style={s.gio}>{l.gio}</div>
                            </div>

                            {/* Thông tin bệnh nhân */}
                            <div style={s.infoCol}>
                                <div style={s.bsName}>{tenBn}</div>
                                <div style={s.bsSub}>
                                    {l.benhNhanId?.nguoiDungId?.soDienThoai || ""}
                                    {l.ghiChu ? ` · ${l.ghiChu}` : ""}
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>{ts.label}</span>

                            {/* Nút hành động */}
                            <div style={{ display: "flex", gap: 4 }}>
                                {l.trangThai === "choduyet" && (
                                    <>
                                        <button onClick={() => onDoiTrangThai(l._id, "daxacnhan")} style={s.btnG}>Xác nhận</button>
                                        <button onClick={() => onDoiTrangThai(l._id, "dahuy")}     style={s.btnR}>Huỷ</button>
                                    </>
                                )}
                                {l.trangThai === "daxacnhan" && (
                                    <button onClick={() => onDoiTrangThai(l._id, "dakham")} style={s.btnG}>Đã khám</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, color = "#111", bg = "#F8F9FA" }) {
    return (
        <div style={{ background: bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

const s = {
    center:      { padding: 40, textAlign: "center", color: "#9CA3AF" },
    noProfile:   { textAlign: "center", padding: "60px 20px" },
    warnBanner:  { background: "#FEF3C7", border: "0.5px solid #FCD34D", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400E", marginBottom: 14 },
    msgBox:      { padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 12 },
    grid4:       { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 },
    card:        { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "14px 16px" },
    cardTitle:   { fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 10, paddingBottom: 8, borderBottom: "0.5px solid #F3F4F6" },
    lichRow:     { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid #F3F4F6" },
    gioCol:      { minWidth: 52 },
    gio:         { fontSize: 18, fontWeight: 700, color: "#1D9E75" },
    infoCol:     { flex: 1, minWidth: 0 },
    bsName:      { fontSize: 13, fontWeight: 500, color: "#111" },
    bsSub:       { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    badge:       { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 },
    btnG:        { height: 26, padding: "0 10px", border: "0.5px solid #6EE7B7", borderRadius: 6, background: "#ECFDF5", color: "#065F46", fontSize: 11, cursor: "pointer" },
    btnR:        { height: 26, padding: "0 10px", border: "0.5px solid #FCA5A5", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer" },
    empty:       { padding: "16px 0", color: "#9CA3AF", fontSize: 13 },
};