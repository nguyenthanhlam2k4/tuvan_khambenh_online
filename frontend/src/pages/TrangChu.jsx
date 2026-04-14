import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { layDanhSachBacSi } from "../api/bacSiApi";
import { useAuth } from "../context/AuthContext";

const CHUYEN_KHOA = [
    { ten: "Tim mạch",      icon: IconTim    },
    { ten: "Nội khoa",      icon: IconNoi    },
    { ten: "Nhi khoa",      icon: IconNhi    },
    { ten: "Da liễu",       icon: IconDa     },
    { ten: "Sản phụ khoa",  icon: IconSan    },
    { ten: "Tâm lý",        icon: IconTamLy  },
];

const HOW = [
    { so: "1", tieu: "Tìm bác sĩ",    mo: "Tìm theo chuyên khoa, triệu chứng hoặc tên bác sĩ" },
    { so: "2", tieu: "Chọn lịch",      mo: "Xem lịch trống và chọn ngày giờ phù hợp với bạn" },
    { so: "3", tieu: "Xác nhận",       mo: "Bác sĩ xác nhận lịch hẹn, bạn nhận thông báo ngay" },
    { so: "4", tieu: "Khám & tư vấn",  mo: "Đến khám hoặc tư vấn trực tuyến, chat với bác sĩ" },
];

export default function TrangChu() {
    const navigate = useNavigate();
    const { daDangNhap, nguoiDung } = useAuth();
    const [bacSiNoiBat, setDs] = useState([]);
    const [tuKhoa, setTuKhoa] = useState("");

    useEffect(() => {
        layDanhSachBacSi({ daXacMinh: true, gioiHan: 3 })
            .then(r => setDs(r.data.data.danhSach))
            .catch(() => {});
    }, []);

    const onSearch = (e) => {
        e.preventDefault();
        navigate(`/tim-bac-si${tuKhoa ? `?q=${encodeURIComponent(tuKhoa)}` : ""}`);
    };

    const goDashboard = () => {
        const map = { admin: "/admin", bacsi: "/bac-si", benhnhan: "/benh-nhan" };
        navigate(map[nguoiDung?.vaiTro] || "/tim-bac-si");
    };

    return (
        <div style={s.page}>

            {/* ── Navbar ── */}
            <nav style={s.nav}>
                <div style={s.navInner}>
                    <div style={s.logo}>
                        <div style={s.logoDot} />
                        <span style={s.logoText}>MediBook</span>
                    </div>
                    <div style={s.navLinks}>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.navLink}>Tìm bác sĩ</span>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.navLink}>Chuyên khoa</span>
                    </div>
                    <div style={s.navRight}>
                        {daDangNhap ? (
                            <button onClick={goDashboard} style={s.btnPrimary}>
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate("/dang-nhap")} style={s.btnOutline}>Đăng nhập</button>
                                <button onClick={() => navigate("/dang-ky")}   style={s.btnPrimary}>Đăng ký</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={s.hero}>
                <div style={s.heroInner}>
                    <div style={s.heroLeft}>
                        <div style={s.heroBadge}>Nền tảng y tế đáng tin cậy</div>
                        <h1 style={s.heroTitle}>
                            Đặt lịch khám với<br />
                            <span style={{ color: "#1D9E75" }}>bác sĩ chuyên khoa</span><br />
                            chỉ trong vài phút
                        </h1>
                        <p style={s.heroSub}>
                            Kết nối với hơn 200 bác sĩ chuyên khoa hàng đầu. Đặt lịch nhanh, tư vấn trực tuyến, theo dõi sức khỏe dễ dàng.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={onSearch} style={s.searchBar}>
                            <input
                                value={tuKhoa}
                                onChange={e => setTuKhoa(e.target.value)}
                                placeholder="Tên bác sĩ, chuyên khoa, triệu chứng..."
                                style={s.searchInput}
                            />
                            <button type="submit" style={s.searchBtn}>Tìm kiếm</button>
                        </form>

                        {/* Quick stats */}
                        <div style={s.stats}>
                            <Stat value="200+" label="Bác sĩ" />
                            <div style={s.statDiv} />
                            <Stat value="15k+" label="Bệnh nhân" />
                            <div style={s.statDiv} />
                            <Stat value="4.9★" label="Đánh giá" />
                            <div style={s.statDiv} />
                            <Stat value="98%" label="Hài lòng" />
                        </div>
                    </div>

                    {/* Hero visual */}
                    <div style={s.heroRight}>
                        <div style={s.heroCard}>
                            <div style={s.heroCardHeader}>
                                <div style={s.hcAvatar}>TM</div>
                                <div>
                                    <div style={s.hcName}>BS. Trần Minh</div>
                                    <div style={s.hcSpec}>Tim mạch · 10 năm KN</div>
                                </div>
                                <span style={s.hcBadge}>Đang trực</span>
                            </div>
                            <div style={s.hcDivider} />
                            <div style={s.hcLabel}>Lịch trống hôm nay</div>
                            <div style={s.hcSlots}>
                                {["09:00", "10:30", "14:00", "15:30"].map(g => (
                                    <span key={g} style={s.hcSlot}>{g}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate("/tim-bac-si")}
                                style={s.hcBtn}>
                                Đặt lịch khám
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Chuyên khoa ── */}
            <section style={s.section}>
                <div style={s.sectionInner}>
                    <div style={s.sectionHeader}>
                        <h2 style={s.sectionTitle}>Chuyên khoa phổ biến</h2>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.seeAll}>Xem tất cả →</span>
                    </div>
                    <div style={s.ckGrid}>
                        {CHUYEN_KHOA.map(ck => (
                            <div key={ck.ten} style={s.ckCard}
                                onClick={() => navigate(`/tim-bac-si?q=${ck.ten}`)}>
                                <div style={s.ckIcon}><ck.icon /></div>
                                <div style={s.ckName}>{ck.ten}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bác sĩ nổi bật ── */}
            {bacSiNoiBat.length > 0 && (
                <section style={{ ...s.section, background: "#fff" }}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionHeader}>
                            <h2 style={s.sectionTitle}>Bác sĩ nổi bật</h2>
                            <span onClick={() => navigate("/tim-bac-si")} style={s.seeAll}>Xem tất cả →</span>
                        </div>
                        <div style={s.docGrid}>
                            {bacSiNoiBat.map(bs => {
                                const ten = bs.nguoiDungId?.ten || "Bác sĩ";
                                return (
                                    <div key={bs._id} style={s.docCard}
                                        onClick={() => navigate(`/tim-bac-si/${bs._id}`)}>
                                        <div style={s.docTop}>
                                            <div style={s.docAvatar}>{ten[0]}</div>
                                            <div>
                                                <div style={s.docName}>BS. {ten}</div>
                                                <div style={s.docSpec}>{bs.chuyenKhoa}</div>
                                                {bs.benhVien && <div style={s.docHosp}>{bs.benhVien}</div>}
                                            </div>
                                        </div>
                                        <div style={s.docMeta}>
                                            <span style={s.docMetaItem}>{bs.soNamKinhNghiem > 0 ? `${bs.soNamKinhNghiem} năm KN` : "—"}</span>
                                            {bs.diemDanhGia > 0 && <span style={s.docMetaItem}>{bs.diemDanhGia.toFixed(1)} ★</span>}
                                        </div>
                                        <button style={s.docBtn}>Xem lịch khám</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Cách hoạt động ── */}
            <section style={{ ...s.section, background: "#F8FAFC" }}>
                <div style={s.sectionInner}>
                    <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: 32 }}>
                        Cách hoạt động
                    </h2>
                    <div style={s.howGrid}>
                        {HOW.map(h => (
                            <div key={h.so} style={s.howItem}>
                                <div style={s.howNum}>{h.so}</div>
                                <div style={s.howTitle}>{h.tieu}</div>
                                <p style={s.howMo}>{h.mo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={s.cta}>
                <div style={s.ctaInner}>
                    <h2 style={s.ctaTitle}>Sẵn sàng đặt lịch khám?</h2>
                    <p style={s.ctaSub}>Đăng ký miễn phí và tìm bác sĩ phù hợp ngay hôm nay.</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button onClick={() => navigate("/dang-ky")}   style={s.ctaBtnPrimary}>Đăng ký miễn phí</button>
                        <button onClick={() => navigate("/tim-bac-si")} style={s.ctaBtnOutline}>Tìm bác sĩ</button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={s.footer}>
                <div style={s.footerInner}>
                    <div style={s.logo}>
                        <div style={s.logoDot} />
                        <span style={s.logoText}>MediBook</span>
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                        {["Điều khoản", "Bảo mật", "Hỗ trợ", "Liên hệ"].map(l => (
                            <span key={l} style={s.footerLink}>{l}</span>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>© 2026 MediBook</span>
                </div>
            </footer>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{label}</div>
        </div>
    );
}

// ── Chuyên khoa icons ─────────────────────────────────────────────────────────
function IconTim() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 19s-8-5.5-8-11a5 5 0 0110 0 5 5 0 0110 0c0 5.5-8 11-8 11l-2 0z" fill="#E24B4A" opacity=".8"/>
    </svg>;
}
function IconNoi() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="3" stroke="#378ADD" strokeWidth="1.5" fill="none"/>
        <path d="M8 8h6M8 11h6M8 14h4" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>;
}
function IconNhi() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
        <path d="M3 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
    </svg>;
}
function IconDa() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <ellipse cx="11" cy="11" rx="8" ry="6" stroke="#EF9F27" strokeWidth="1.5" fill="none"/>
        <ellipse cx="11" cy="11" rx="4" ry="3" fill="#EF9F27" opacity=".4"/>
    </svg>;
}
function IconSan() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3c0 0-6 4-6 9s6 7 6 7 6-2 6-7-6-9-6-9z" fill="#D4537E" opacity=".7"/>
    </svg>;
}
function IconTamLy() {
    return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 4c0 0-6 3-6 7.5S11 19 11 19s6-3.5 6-7.5S11 4 11 4z" stroke="#7F77DD" strokeWidth="1.5" fill="none"/>
        <path d="M8 11c.5-1 1.5-2 3-2s2.5 1 3 2" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
    page:          { minHeight: "100vh", background: "#fff", fontFamily: "system-ui, sans-serif" },

    nav:           { background: "#fff", borderBottom: "0.5px solid #E5E7EB", position: "sticky", top: 0, zIndex: 20 },
    navInner:      { maxWidth: 1100, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", gap: 32 },
    logo:          { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", textDecoration: "none" },
    logoDot:       { width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 },
    logoText:      { fontSize: 15, fontWeight: 700, color: "#111" },
    navLinks:      { display: "flex", gap: 24, flex: 1 },
    navLink:       { fontSize: 13, color: "#6B7280", cursor: "pointer" },
    navRight:      { display: "flex", gap: 8 },
    btnOutline:    { height: 34, padding: "0 16px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
    btnPrimary:    { height: 34, padding: "0 16px", border: "none", borderRadius: 8, background: "#1D9E75", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 500 },

    hero:          { background: "#fff", borderBottom: "0.5px solid #F3F4F6" },
    heroInner:     { maxWidth: 1100, margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "center" },
    heroLeft:      {},
    heroBadge:     { display: "inline-block", padding: "4px 12px", background: "#ECFDF5", color: "#065F46", borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 16 },
    heroTitle:     { fontSize: 36, fontWeight: 700, color: "#111", lineHeight: 1.25, margin: "0 0 14px", letterSpacing: "-0.8px" },
    heroSub:       { fontSize: 15, color: "#6B7280", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 480 },
    searchBar:     { display: "flex", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 6, marginBottom: 24, maxWidth: 500 },
    searchInput:   { flex: 1, height: 40, border: "none", outline: "none", fontSize: 14, color: "#111", padding: "0 12px", background: "transparent" },
    searchBtn:     { height: 40, padding: "0 22px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
    stats:         { display: "flex", alignItems: "center", gap: 20 },
    statDiv:       { width: "0.5px", height: 28, background: "#E5E7EB" },

    heroRight:     {},
    heroCard:      { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
    heroCardHeader:{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
    hcAvatar:      { width: 44, height: 44, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    hcName:        { fontSize: 14, fontWeight: 600, color: "#111" },
    hcSpec:        { fontSize: 12, color: "#6B7280", marginTop: 2 },
    hcBadge:       { marginLeft: "auto", padding: "3px 9px", background: "#ECFDF5", color: "#065F46", borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 },
    hcDivider:     { height: "0.5px", background: "#F3F4F6", marginBottom: 14 },
    hcLabel:       { fontSize: 12, color: "#9CA3AF", marginBottom: 8 },
    hcSlots:       { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
    hcSlot:        { padding: "4px 12px", background: "#ECFDF5", color: "#065F46", borderRadius: 20, fontSize: 12, fontWeight: 500 },
    hcBtn:         { width: "100%", height: 38, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },

    section:       { padding: "52px 0" },
    sectionInner:  { maxWidth: 1100, margin: "0 auto", padding: "0 24px" },
    sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    sectionTitle:  { fontSize: 22, fontWeight: 700, color: "#111", margin: 0 },
    seeAll:        { fontSize: 13, color: "#1D9E75", cursor: "pointer" },

    ckGrid:        { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 },
    ckCard:        { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "18px 12px", textAlign: "center", cursor: "pointer" },
    ckIcon:        { width: 44, height: 44, borderRadius: 12, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" },
    ckName:        { fontSize: 12, fontWeight: 500, color: "#374151" },

    docGrid:       { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
    docCard:       { border: "0.5px solid #E5E7EB", borderRadius: 14, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 },
    docTop:        { display: "flex", gap: 12, alignItems: "flex-start" },
    docAvatar:     { width: 44, height: 44, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    docName:       { fontSize: 14, fontWeight: 600, color: "#111" },
    docSpec:       { fontSize: 12, color: "#1D9E75", fontWeight: 500, marginTop: 2 },
    docHosp:       { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    docMeta:       { display: "flex", gap: 10 },
    docMetaItem:   { fontSize: 12, color: "#6B7280" },
    docBtn:        { height: 34, background: "#ECFDF5", color: "#065F46", border: "0.5px solid #6EE7B7", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", marginTop: "auto" },

    howGrid:       { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 },
    howItem:       { textAlign: "center" },
    howNum:        { width: 36, height: 36, borderRadius: "50%", background: "#ECFDF5", color: "#065F46", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" },
    howTitle:      { fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 6 },
    howMo:         { fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: 0 },

    cta:           { background: "#1D9E75", padding: "52px 0" },
    ctaInner:      { maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" },
    ctaTitle:      { fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
    ctaSub:        { fontSize: 14, color: "rgba(255,255,255,0.8)", margin: "0 0 28px" },
    ctaBtnPrimary: { height: 42, padding: "0 24px", background: "#fff", color: "#065F46", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
    ctaBtnOutline: { height: 42, padding: "0 24px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" },

    footer:        { borderTop: "0.5px solid #E5E7EB", background: "#fff" },
    footerInner:   { maxWidth: 1100, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    footerLink:    { fontSize: 12, color: "#9CA3AF", cursor: "pointer" },
};