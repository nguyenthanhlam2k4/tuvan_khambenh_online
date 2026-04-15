import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { layChiTietBacSi, layLichTrong } from "../../api/bacSiApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

const THU = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatNgay(str) {
    const [y, m, d] = str.split("-");
    const thu = THU[new Date(str).getDay()];
    return { thu, ngay: `${d}/${m}`, full: `${thu}, ${d}/${m}/${y}` };
}

// Lấy 7 ngày tính từ hôm nay
function lay7Ngay() {
    return Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

export default function ChiTietBacSi() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const { daDangNhap } = useAuth();

    const [bacSi, setBacSi]       = useState(null);
    const [lich, setLich]         = useState([]);
    const [loading, setLoad]      = useState(true);
    const [ngayChon, setNgay]     = useState(null);
    const [gioChon, setGio]       = useState(null);
    const [loadLich, setLoadLich] = useState(false);

    const tuNgay = new Date().toISOString().slice(0, 10);
    const denNgay = (() => {
        const d = new Date(); d.setDate(d.getDate() + 13);
        return d.toISOString().slice(0, 10);
    })();

    useEffect(() => {
        Promise.all([
            layChiTietBacSi(id),
            layLichTrong(id, tuNgay, denNgay),
        ]).then(([rBs, rLich]) => {
            setBacSi(rBs.data.data);
            setLich(rLich.data.data);
        }).catch(() => navigate("/tim-bac-si"))
          .finally(() => setLoad(false));
          console.log("LICH FRONTEND:", lich);
    }, [id]);

    const ngayCoLich = lich.map(n => n.ngay);
    const lichNgayChon = lich.find(n => n.ngay === ngayChon);

    const onDatLich = () => {
        console.log("CLICK BUTTON");
        if (!daDangNhap) return navigate("/dang-nhap");
        if (!ngayChon || !gioChon) return;
        // Phase 3 — navigate đến form đặt lịch
        navigate(`/dat-lich/${id}?ngay=${ngayChon}&gio=${gioChon}`);
    };

    if (loading) return <div style={s.center}>Đang tải...</div>;
    if (!bacSi)  return null;

    const ten   = bacSi.nguoiDungId?.ten || "Bác sĩ";
    const soSao = bacSi.diemDanhGia > 0 ? bacSi.diemDanhGia.toFixed(1) : null;
    console.log("ngayChon:", ngayChon);
console.log("lichNgayChon:", lichNgayChon);
    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerInner}>
                    <button onClick={() => navigate("/tim-bac-si")} style={s.backBtn}>
                        ← Quay lại
                    </button>
                    <div style={s.logo} onClick={() => navigate("/")}>
                        <div style={s.logoDot} />
                        <span style={s.logoText}>MediBook</span>
                    </div>
                </div>
            </div>

            <div style={s.body}>
                <div style={s.twoCol}>

                    {/* CỘT TRÁI — thông tin bác sĩ */}
                    <div style={s.leftCol}>

                        {/* Profile card */}
                        <div style={s.profileCard}>
                            <div style={s.avatar}>{ten[0]}</div>
                            <div style={s.profileInfo}>
                                <div style={s.profileName}>BS. {ten}</div>
                                <div style={s.profileSpec}>{bacSi.chuyenKhoa}</div>
                                {bacSi.benhVien && <div style={s.profileHospital}>{bacSi.benhVien}</div>}
                                <div style={s.badges}>
                                    <span style={s.badgeGreen}>Đã xác minh</span>
                                    {bacSi.soNamKinhNghiem > 0 && (
                                        <span style={s.badgeGray}>{bacSi.soNamKinhNghiem} năm KN</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thống kê */}
                        <div style={s.statsRow}>
                            <StatBox value={soSao ? `${soSao} ★` : "—"} label="Điểm đánh giá" />
                            <StatBox value={bacSi.tongDanhGia || 0} label="Lượt đánh giá" />
                            <StatBox value={bacSi.soNamKinhNghiem > 0 ? `${bacSi.soNamKinhNghiem}` : "—"} label="Năm kinh nghiệm" />
                        </div>

                        {/* Giới thiệu */}
                        {bacSi.moTa && (
                            <div style={s.section}>
                                <div style={s.sectionTitle}>Giới thiệu</div>
                                <p style={s.moTa}>{bacSi.moTa}</p>
                            </div>
                        )}

                        {/* Thông tin liên hệ */}
                        <div style={s.section}>
                            <div style={s.sectionTitle}>Thông tin</div>
                            <InfoRow label="Chuyên khoa"  value={bacSi.chuyenKhoa} />
                            <InfoRow label="Bệnh viện"    value={bacSi.benhVien || "—"} />
                            <InfoRow label="Kinh nghiệm"  value={bacSi.soNamKinhNghiem > 0 ? `${bacSi.soNamKinhNghiem} năm` : "—"} />
                        </div>
                    </div>

                    {/* CỘT PHẢI — đặt lịch */}
                    <div style={s.rightCol}>
                        <div style={s.bookCard}>
                            <div style={s.bookTitle}>Chọn lịch khám</div>

                            {lich.length === 0 ? (
                                <div style={s.noLich}>
                                    Bác sĩ chưa có lịch trống trong 14 ngày tới.
                                </div>
                            ) : (
                                <>
                                    {/* Chọn ngày */}
                                    <div style={s.ngayLabel}>Chọn ngày</div>
                                    <div style={s.ngayGrid}>
                                        {lay7Ngay().map(ngay => {
                                            const { thu, ngay: nd } = formatNgay(ngay);
                                            const coLich = ngayCoLich.includes(ngay);
                                            const isChon = ngayChon === ngay;
                                            if (!coLich) return (
                                                <div key={ngay} style={s.ngayItemDisabled}>
                                                    <div style={s.ngayThu}>{thu}</div>
                                                    <div style={s.ngayNum}>{nd}</div>
                                                </div>
                                            );
                                            return (
                                                <div key={ngay} onClick={() => { setNgay(ngay); setGio(null); }}
                                                    style={{ ...s.ngayItem, ...(isChon ? s.ngayItemActive : {}) }}>
                                                    <div style={{ ...s.ngayThu, ...(isChon ? { color: "#fff" } : {}) }}>{thu}</div>
                                                    <div style={{ ...s.ngayNum, ...(isChon ? { color: "#fff" } : {}) }}>{nd}</div>
                                                    <div style={{ ...s.ngayDot, ...(isChon ? { background: "rgba(255,255,255,0.6)" } : {}) }} />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Chọn giờ */}
                                    {ngayChon && (
                                        <>
                                            <div style={s.ngayLabel}>
                                                Khung giờ — {formatNgay(ngayChon).full}
                                            </div>
                                            <div style={s.gioGrid}>
                                                {lichNgayChon?.khungGios?.map(k => (
                                                    <button key={k._id}
                                                        onClick={() => setGio(k.gio)}
                                                        style={{ ...s.gioBtn, ...(gioChon === k.gio ? s.gioBtnActive : {}) }}>
                                                        {k.gio}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Tóm tắt chọn */}
                                    {gioChon && ngayChon && (
                                        <div style={s.summary}>
                                            <div style={s.summaryRow}>
                                                <span style={s.summaryLabel}>Bác sĩ</span>
                                                <span style={s.summaryVal}>BS. {ten}</span>
                                            </div>
                                            <div style={s.summaryRow}>
                                                <span style={s.summaryLabel}>Ngày</span>
                                                <span style={s.summaryVal}>{formatNgay(ngayChon).full}</span>
                                            </div>
                                            <div style={s.summaryRow}>
                                                <span style={s.summaryLabel}>Giờ</span>
                                                <span style={s.summaryVal}>{gioChon}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={onDatLich}
                                        disabled={!ngayChon || !gioChon}
                                        style={{ ...s.datBtn, opacity: (!ngayChon || !gioChon) ? 0.4 : 1 }}>
                                        {daDangNhap ? "Đặt lịch khám" : "Đăng nhập để đặt lịch"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatBox({ value, label }) {
    return (
        <div style={{ flex: 1, textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</span>
            <span style={{ fontSize: 13, color: "#111" }}>{value}</span>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
    page:          { minHeight: "100vh", background: "#F8FAFC" },
    center:        { padding: 60, textAlign: "center", color: "#9CA3AF" },
    header:        { background: "#fff", borderBottom: "0.5px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 },
    headerInner:   { maxWidth: 1100, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 },
    backBtn:       { height: 32, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
    logo:          { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
    logoDot:       { width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" },
    logoText:      { fontSize: 14, fontWeight: 700, color: "#111" },
    body:          { maxWidth: 1100, margin: "0 auto", padding: "28px 24px 40px" },
    twoCol:        { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" },

    leftCol:       { display: "flex", flexDirection: "column", gap: 16 },
    profileCard:   { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 14, padding: "20px", display: "flex", gap: 16, alignItems: "flex-start" },
    avatar:        { width: 64, height: 64, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    profileInfo:   { flex: 1 },
    profileName:   { fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 },
    profileSpec:   { fontSize: 13, color: "#1D9E75", fontWeight: 500, marginBottom: 3 },
    profileHospital:{ fontSize: 12, color: "#6B7280", marginBottom: 8 },
    badges:        { display: "flex", gap: 6, flexWrap: "wrap" },
    badgeGreen:    { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#D1FAE5", color: "#065F46" },
    badgeGray:     { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#F3F4F6", color: "#374151" },

    statsRow:      { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, display: "flex", overflow: "hidden" },
    section:       { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "16px 18px" },
    sectionTitle:  { fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 10, paddingBottom: 8, borderBottom: "0.5px solid #F3F4F6" },
    moTa:          { fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 },

    rightCol:      {},
    bookCard:      { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 14, padding: "20px", position: "sticky", top: 72 },
    bookTitle:     { fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 16 },
    noLich:        { fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" },
    ngayLabel:     { fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 8 },
    ngayGrid:      { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 16 },
    ngayItem:      { textAlign: "center", padding: "7px 2px", borderRadius: 8, border: "0.5px solid #E5E7EB", cursor: "pointer", background: "#fff", position: "relative" },
    ngayItemActive:{ background: "#1D9E75", border: "0.5px solid #1D9E75" },
    ngayItemDisabled:{ textAlign: "center", padding: "7px 2px", borderRadius: 8, background: "#F8F9FA", opacity: 0.4 },
    ngayThu:       { fontSize: 10, color: "#9CA3AF" },
    ngayNum:       { fontSize: 12, fontWeight: 600, color: "#111", marginTop: 2 },
    ngayDot:       { width: 4, height: 4, borderRadius: "50%", background: "#1D9E75", margin: "3px auto 0" },
    gioGrid:       { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
    gioBtn:        { height: 32, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#374151" },
    gioBtnActive:  { background: "#1D9E75", border: "0.5px solid #1D9E75" , color: "#fff" },
    summary:       { background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 14 },
    summaryRow:    { display: "flex", justifyContent: "space-between", padding: "4px 0" },
    summaryLabel:  { fontSize: 12, color: "#9CA3AF" },
    summaryVal:    { fontSize: 12, fontWeight: 500, color: "#111" },
    datBtn:        { width: "100%", height: 42, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
};