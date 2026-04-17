import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { layDanhSachBacSi } from "../../api/bacSiApi";
import { useAuth } from "../../context/AuthContext";

const CHUYEN_KHOA = [
    { ten: "Tim mạch",     icon: "🫀", mo: "32 bác sĩ" },
    { ten: "Nội khoa",     icon: "📋", mo: "41 bác sĩ" },
    { ten: "Nhi khoa",     icon: "👶", mo: "28 bác sĩ" },
    { ten: "Da liễu",      icon: "✨", mo: "24 bác sĩ" },
    { ten: "Sản phụ khoa", icon: "🌸", mo: "22 bác sĩ" },
    { ten: "Tâm lý",       icon: "🧠", mo: "18 bác sĩ" },
];

const TINH_NANG = [
    { icon: "📅", tieu: "Đặt lịch dễ dàng",     mo: "Chọn bác sĩ, ngày giờ phù hợp trong vài giây" },
    { icon: "💬", tieu: "Tư vấn trực tuyến",     mo: "Chat trực tiếp với bác sĩ trước và sau khi khám" },
    { icon: "🔔", tieu: "Nhắc nhở tự động",      mo: "Nhận thông báo lịch khám, uống thuốc đúng giờ" },
    { icon: "📁", tieu: "Hồ sơ sức khỏe",        mo: "Lưu trữ kết quả khám, tiền sử bệnh an toàn" },
];

const HOW = [
    { so: "01", tieu: "Tìm bác sĩ",   mo: "Tìm theo chuyên khoa hoặc triệu chứng của bạn" },
    { so: "02", tieu: "Chọn lịch",     mo: "Xem lịch trống và chọn ngày giờ phù hợp" },
    { so: "03", tieu: "Xác nhận",      mo: "Bác sĩ duyệt và xác nhận lịch hẹn của bạn" },
    { so: "04", tieu: "Đến khám",      mo: "Đến đúng giờ hoặc tư vấn trực tuyến qua chat" },
];

export default function TrangChu() {
    const navigate = useNavigate();
    const { daDangNhap, nguoiDung } = useAuth();
    const [bacSiNoiBat, setDs] = useState([]);
    const [tuKhoa, setTuKhoa]  = useState("");

    useEffect(() => {
        layDanhSachBacSi({ daXacMinh: true, gioiHan: 3 })
            .then(r => setDs(r.data.data.danhSach))
            .catch(() => {});
    }, []);

    const goDashboard = () => {
        const map = { admin: "/admin", bacsi: "/bac-si", benhnhan: "/benh-nhan" };
        navigate(map[nguoiDung?.vaiTro] || "/tim-bac-si");
    };

    const onSearch = (e) => {
        e.preventDefault();
        navigate(`/tim-bac-si${tuKhoa ? `?q=${encodeURIComponent(tuKhoa)}` : ""}`);
    };

    return (
        <div style={s.page}>

            {/* ── Navbar ─────────────────────────────────────────────── */}
            <nav style={s.nav}>
                <div style={s.navIn}>
                    <div style={s.logo}><div style={s.logoDot} /><span style={s.logoTxt}>MediBook</span></div>
                    <div style={s.navLinks}>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.navLink}>Tìm bác sĩ</span>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.navLink}>Chuyên khoa</span>
                        <span style={s.navLink}>Về chúng tôi</span>
                    </div>
                    <div style={s.navRight}>
                        {daDangNhap ? (
                            <button onClick={goDashboard} style={s.btnPrimary}>Dashboard</button>
                        ) : (<>
                            <button onClick={() => navigate("/dang-nhap")} style={s.btnOutline}>Đăng nhập</button>
                            <button onClick={() => navigate("/dang-ky")}   style={s.btnPrimary}>Đăng ký miễn phí</button>
                        </>)}
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────── */}
            <section style={s.hero}>
                <div style={s.heroIn}>
                    <div style={s.heroLeft}>
                        <div style={s.heroBadge}>
                            <span style={s.heroBadgeDot} />
                            Nền tảng y tế đáng tin cậy #1 Việt Nam
                        </div>
                        <h1 style={s.heroH1}>
                            Chăm sóc sức khỏe<br />
                            <span style={s.heroH1Green}>thông minh hơn</span><br />
                            cùng MediBook
                        </h1>
                        <p style={s.heroSub}>
                            Kết nối với hơn 200 bác sĩ chuyên khoa hàng đầu. Đặt lịch trong 60 giây, tư vấn trực tuyến, hồ sơ sức khỏe số.
                        </p>

                        <form onSubmit={onSearch} style={s.searchWrap}>
                            <div style={s.searchIcon}>🔍</div>
                            <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                                placeholder="Nhập tên bác sĩ, chuyên khoa, triệu chứng..."
                                style={s.searchIn} />
                            <button type="submit" style={s.searchBtn}>Tìm ngay</button>
                        </form>

                        <div style={s.quickLinks}>
                            <span style={s.quickLabel}>Tìm nhanh:</span>
                            {["Tim mạch","Da liễu","Nhi khoa","Tâm lý"].map(q => (
                                <span key={q} onClick={() => navigate(`/tim-bac-si?ck=${encodeURIComponent(q)}`)}
                                    style={s.quickChip}>{q}</span>
                            ))}
                        </div>

                        <div style={s.stats}>
                            <Stat n="200+" l="Bác sĩ" />
                            <div style={s.statDiv} />
                            <Stat n="15k+" l="Bệnh nhân" />
                            <div style={s.statDiv} />
                            <Stat n="4.9★" l="Đánh giá" />
                            <div style={s.statDiv} />
                            <Stat n="98%" l="Hài lòng" />
                        </div>
                    </div>

                    {/* Hero visual */}
                    {/* <div style={s.heroRight}>
                        <div style={s.heroCard}>
                            <div style={s.hcBadge}>🟢 Đang trực tuyến</div>
                            <div style={s.hcDrRow}>
                                <div style={s.hcAv}>TM</div>
                                <div>
                                    <div style={s.hcName}>BS. Trần Minh</div>
                                    <div style={s.hcSpec}>Tim mạch · 10 năm KN</div>
                                    <div style={s.hcStars}>⭐⭐⭐⭐⭐ <span style={{ color:"#9CA3AF",fontWeight:400 }}>4.9 (128)</span></div>
                                </div>
                            </div>
                            <div style={s.hcDivider} />
                            <div style={s.hcSlotLabel}>Lịch trống hôm nay</div>
                            <div style={s.hcSlots}>
                                {["09:00","10:30","14:00","15:30"].map(g => (
                                    <span key={g} style={s.hcSlot}>{g}</span>
                                ))}
                            </div>
                            <button onClick={() => navigate("/tim-bac-si")} style={s.hcBtn}>
                                Đặt lịch khám →
                            </button>
                        </div>
                    </div> */}
                </div>
            </section>

            {/* ── Chuyên khoa ────────────────────────────────────────── */}
            <section style={s.sec}>
                <div style={s.secIn}>
                    <div style={s.secHd}>
                        <div>
                            <div style={s.secTag}>Chuyên khoa</div>
                            <h2 style={s.secH2}>Tìm theo chuyên khoa</h2>
                        </div>
                        <span onClick={() => navigate("/tim-bac-si")} style={s.seeAll}>Xem tất cả →</span>
                    </div>
                    <div style={s.ckGrid}>
                        {CHUYEN_KHOA.map(ck => (
                            <div key={ck.ten} style={s.ckCard}
                                onClick={() => navigate(`/tim-bac-si?ck=${encodeURIComponent(ck.ten)}`)}>
                                <div style={s.ckIcon}>{ck.icon}</div>
                                <div style={s.ckName}>{ck.ten}</div>
                                <div style={s.ckMo}>{ck.mo}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Tính năng ──────────────────────────────────────────── */}
            <section style={{ ...s.sec, background: "#F0FDF9" }}>
                <div style={s.secIn}>
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <div style={s.secTag}>Tính năng</div>
                        <h2 style={s.secH2}>Mọi thứ bạn cần trong một ứng dụng</h2>
                    </div>
                    <div style={s.tfGrid}>
                        {TINH_NANG.map(t => (
                            <div key={t.tieu} style={s.tfCard}>
                                <div style={s.tfIcon}>{t.icon}</div>
                                <div style={s.tfTitle}>{t.tieu}</div>
                                <p style={s.tfMo}>{t.mo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bác sĩ nổi bật ─────────────────────────────────────── */}
            {bacSiNoiBat.length > 0 && (
                <section style={s.sec}>
                    <div style={s.secIn}>
                        <div style={s.secHd}>
                            <div>
                                <div style={s.secTag}>Đội ngũ bác sĩ</div>
                                <h2 style={s.secH2}>Bác sĩ nổi bật</h2>
                            </div>
                            <span onClick={() => navigate("/tim-bac-si")} style={s.seeAll}>Xem tất cả →</span>
                        </div>
                        <div style={s.docGrid}>
                            {bacSiNoiBat.map(bs => {
                                const ten = bs.nguoiDungId?.ten || "Bác sĩ";
                                return (
                                    <div key={bs._id} style={s.docCard}
                                        onClick={() => navigate(`/tim-bac-si/${bs._id}`)}>
                                        <div style={s.docAv}>{ten[0]}</div>
                                        <div style={s.docName}>BS. {ten}</div>
                                        <div style={s.docSpec}>{bs.chuyenKhoa}</div>
                                        {bs.benhVien && <div style={s.docHosp}>{bs.benhVien}</div>}
                                        <div style={s.docMeta}>
                                            {bs.soNamKinhNghiem > 0 && <span>{bs.soNamKinhNghiem} năm KN</span>}
                                            {bs.diemDanhGia > 0 && <span>⭐ {bs.diemDanhGia.toFixed(1)}</span>}
                                        </div>
                                        <button style={s.docBtn}>Xem lịch khám</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Cách hoạt động ─────────────────────────────────────── */}
            <section style={{ ...s.sec, background: "#F8FAFC" }}>
                <div style={s.secIn}>
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <div style={s.secTag}>Quy trình</div>
                        <h2 style={s.secH2}>Chỉ 4 bước đơn giản</h2>
                    </div>
                    <div style={s.howGrid}>
                        {HOW.map((h, i) => (
                            <div key={h.so} style={s.howItem}>
                                <div style={s.howNum}>{h.so}</div>
                                {i < HOW.length - 1 && <div style={s.howLine} />}
                                <div style={s.howTitle}>{h.tieu}</div>
                                <p style={s.howMo}>{h.mo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <section style={s.cta}>
                <div style={s.ctaIn}>
                    <h2 style={s.ctaH2}>Sẵn sàng chăm sóc sức khỏe tốt hơn?</h2>
                    <p style={s.ctaSub}>Tham gia cùng 15,000+ bệnh nhân đang sử dụng MediBook mỗi ngày.</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/dang-ky")} style={s.ctaBtnW}>
                            Đăng ký miễn phí
                        </button>
                        <button onClick={() => navigate("/tim-bac-si")} style={s.ctaBtnO}>
                            Tìm bác sĩ ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <footer style={s.footer}>
                <div style={s.footerIn}>
                    <div style={s.logo}><div style={s.logoDot} /><span style={s.logoTxt}>MediBook</span></div>
                    <div style={{ display: "flex", gap: 24 }}>
                        {["Điều khoản","Bảo mật","Hỗ trợ","Liên hệ"].map(l => (
                            <span key={l} style={s.footerLink}>{l}</span>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>© 2026 MediBook</span>
                </div>
            </footer>
        </div>
    );
}

function Stat({ n, l }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{n}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{l}</div>
        </div>
    );
}

const s = {
    page:      { minHeight: "100vh", background: "#fff", fontFamily: "system-ui,-apple-system,sans-serif" },

    // Nav
    nav:       { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "0.5px solid #E5E7EB", position: "sticky", top: 0, zIndex: 50 },
    navIn:     { maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 32 },
    logo:      { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", textDecoration: "none", flexShrink: 0 },
    logoDot:   { width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" },
    logoTxt:   { fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" },
    navLinks:  { display: "flex", gap: 28, flex: 1 },
    navLink:   { fontSize: 13, color: "#6B7280", cursor: "pointer", transition: "color .15s" },
    navRight:  { display: "flex", gap: 8, flexShrink: 0 },
    btnOutline:{ height: 36, padding: "0 18px", border: "0.5px solid #E5E7EB", borderRadius: 10, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 },
    btnPrimary:{ height: 36, padding: "0 18px", border: "none", borderRadius: 10, background: "#1D9E75", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 600 },

    // Hero
    hero:      { background: "linear-gradient(135deg, #F0FDF9 0%, #fff 60%)", borderBottom: "0.5px solid #E5E7EB" },
    heroIn:    { maxWidth: 1100, margin: "0 auto", padding: "64px 24px 60px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 56, alignItems: "center" },
    heroLeft:  {},
    heroBadge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 12, color: "#374151", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    heroBadgeDot:{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 },
    heroH1:    { fontSize: 42, fontWeight: 800, color: "#111", lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-1px" },
    heroH1Green:{ color: "#1D9E75" },
    heroSub:   { fontSize: 16, color: "#6B7280", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 480 },
    searchWrap:{ display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "6px 6px 6px 14px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 520 },
    searchIcon:{ fontSize: 16, marginRight: 4, flexShrink: 0 },
    searchIn:  { flex: 1, height: 38, border: "none", outline: "none", fontSize: 14, color: "#111", background: "transparent" },
    searchBtn: { height: 38, padding: "0 22px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
    quickLinks:{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 28 },
    quickLabel:{ fontSize: 12, color: "#9CA3AF" },
    quickChip: { padding: "3px 12px", border: "0.5px solid #D1FAE5", borderRadius: 20, fontSize: 12, color: "#065F46", background: "#ECFDF5", cursor: "pointer" },
    stats:     { display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" },
    statDiv:   { width: "0.5px", height: 28, background: "#E5E7EB" },

    // Hero card
    heroRight: { position: "relative" },
    heroCard:  { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20, padding: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" },
    hcBadge:   { display: "inline-block", fontSize: 11, color: "#065F46", background: "#ECFDF5", padding: "3px 10px", borderRadius: 20, marginBottom: 14 },
    hcDrRow:   { display: "flex", gap: 12, alignItems: "center", marginBottom: 14 },
    hcAv:      { width: 48, height: 48, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    hcName:    { fontSize: 15, fontWeight: 700, color: "#111" },
    hcSpec:    { fontSize: 12, color: "#6B7280", marginTop: 2 },
    hcStars:   { fontSize: 12, fontWeight: 600, marginTop: 3 },
    hcDivider: { height: "0.5px", background: "#F3F4F6", margin: "0 0 12px" },
    hcSlotLabel:{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 },
    hcSlots:   { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
    hcSlot:    { padding: "5px 12px", background: "#ECFDF5", color: "#065F46", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "0.5px solid #D1FAE5" },
    hcBtn:     { width: "100%", height: 40, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
    floatBadge1:{ position: "absolute", top: -16, right: -16, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 500, color: "#065F46", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 6 },
    floatBadge2:{ position: "absolute", bottom: -16, left: -20, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 500, color: "#374151", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 6 },

    // Sections
    sec:       { padding: "64px 0" },
    secIn:     { maxWidth: 1100, margin: "0 auto", padding: "0 24px" },
    secHd:     { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 },
    secTag:    { fontSize: 12, fontWeight: 600, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
    secH2:     { fontSize: 26, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.5px" },
    seeAll:    { fontSize: 13, color: "#1D9E75", cursor: "pointer", fontWeight: 500, flexShrink: 0 },

    // Chuyên khoa
    ckGrid:    { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 },
    ckCard:    { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 12px", textAlign: "center", cursor: "pointer", transition: "all .15s" },
    ckIcon:    { fontSize: 32, marginBottom: 10, display: "block" },
    ckName:    { fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 },
    ckMo:      { fontSize: 11, color: "#9CA3AF" },

    // Tính năng
    tfGrid:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 },
    tfCard:    { background: "#fff", borderRadius: 16, padding: "24px 20px", border: "0.5px solid #E5E7EB" },
    tfIcon:    { fontSize: 28, marginBottom: 12, display: "block" },
    tfTitle:   { fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 6 },
    tfMo:      { fontSize: 13, color: "#6B7280", lineHeight: 1.55, margin: 0 },

    // Bác sĩ
    docGrid:   { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
    docCard:   { border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px", cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", gap: 4 },
    docAv:     { width: 56, height: 56, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" },
    docName:   { fontSize: 15, fontWeight: 700, color: "#111" },
    docSpec:   { fontSize: 13, color: "#1D9E75", fontWeight: 500 },
    docHosp:   { fontSize: 12, color: "#9CA3AF" },
    docMeta:   { display: "flex", gap: 12, justifyContent: "center", fontSize: 12, color: "#6B7280", margin: "4px 0" },
    docBtn:    { height: 36, background: "#ECFDF5", color: "#065F46", border: "0.5px solid #6EE7B7", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: "auto" },

    // How
    howGrid:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" },
    howItem:   { textAlign: "center", padding: "0 16px", position: "relative" },
    howNum:    { width: 48, height: 48, borderRadius: "50%", background: "#1D9E75", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" },
    howLine:   { position: "absolute", top: 24, left: "75%", width: "50%", height: "0.5px", background: "#D1FAE5" },
    howTitle:  { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 6 },
    howMo:     { fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: 0 },

    // CTA
    cta:       { background: "linear-gradient(135deg, #065F46 0%, #1D9E75 100%)", padding: "64px 0" },
    ctaIn:     { maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" },
    ctaH2:     { fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" },
    ctaSub:    { fontSize: 15, color: "rgba(255,255,255,0.8)", margin: "0 0 32px" },
    ctaBtnW:   { height: 46, padding: "0 28px", background: "#fff", color: "#065F46", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" },
    ctaBtnO:   { height: 46, padding: "0 28px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: "pointer" },

    // Footer
    footer:    { borderTop: "0.5px solid #E5E7EB" },
    footerIn:  { maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    footerLink:{ fontSize: 12, color: "#9CA3AF", cursor: "pointer" },
};  