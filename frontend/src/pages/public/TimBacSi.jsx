import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { layDanhSachBacSi } from "../../api/bacSiApi.js";

const CHUYEN_KHOA = [
    "Tất cả", "Tim mạch", "Nội khoa", "Nhi khoa", "Da liễu",
    "Sản phụ khoa", "Tâm lý", "Xương khớp", "Mắt", "Tai mũi họng", "Răng hàm mặt",
];

export default function TimBacSi() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Đọc params từ URL khi load
    const initCk = searchParams.get("ck") || "Tất cả";
    const initQ  = searchParams.get("q")  || "";

    const [danhSach, setDs]   = useState([]);
    const [loading, setLoad]  = useState(true);
    const [tuKhoa, setTuKhoa] = useState(initQ);
    const [ckChon, setCk]     = useState(initCk);
    const [trang, setTrang]   = useState(1);
    const [tongTrang, setTT]  = useState(1);
    const [tongSo, setTS]     = useState(0);

    const tai = async (tk, ck, t = 1) => {
        setLoad(true);
        try {
            const params = { daXacMinh: true, trang: t, gioiHan: 9 };
            if (ck !== "Tất cả") params.chuyenKhoa = ck;
            if (tk?.trim())       params.chuyenKhoa = tk.trim();
            const r = await layDanhSachBacSi(params);
            const { danhSach: ds, tongTrang: tt, tongSo: ts } = r.data.data;
            setDs(ds);
            setTT(tt);
            setTS(ts);
            setTrang(t);
        } catch {
            setDs([]);
        } finally {
            setLoad(false);
        }
    };

    // Load lần đầu — đọc từ URL
    useEffect(() => {
        tai(initQ, initCk, 1);
    }, []);

    const onSearch = (e) => {
        e.preventDefault();
        setSearchParams(tuKhoa ? { q: tuKhoa } : {});
        tai(tuKhoa, "Tất cả", 1);
        setCk("Tất cả");
    };

    const onChonCk = (ck) => {
        setCk(ck);
        setTuKhoa("");
        setSearchParams(ck !== "Tất cả" ? { ck } : {});
        tai("", ck, 1);
    };

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerInner}>
                    <div style={s.logo} onClick={() => navigate("/")}>
                        <div style={s.logoDot} />
                        <span style={s.logoText}>MediBook</span>
                    </div>
                    <div style={s.headerRight}>
                        <button onClick={() => navigate("/dang-nhap")} style={s.btnOutline}>Đăng nhập</button>
                        <button onClick={() => navigate("/dang-ky")}   style={s.btnPrimary}>Đăng ký</button>
                    </div>
                </div>
            </div>

            <div style={s.body}>
                {/* Hero search */}
                <div style={s.hero}>
                    <h1 style={s.heroTitle}>Tìm bác sĩ phù hợp</h1>
                    <p style={s.heroSub}>Đặt lịch khám với hơn 200 bác sĩ chuyên khoa hàng đầu</p>

                    <form onSubmit={onSearch} style={s.searchBar}>
                        <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                            placeholder="Tìm theo tên bác sĩ, chuyên khoa, triệu chứng..."
                            style={s.searchInput} />
                        <button type="submit" style={s.searchBtn}>Tìm kiếm</button>
                    </form>

                    {/* Filter chips */}
                    <div style={s.chips}>
                        {CHUYEN_KHOA.map(ck => (
                            <button key={ck} onClick={() => onChonCk(ck)}
                                style={{ ...s.chip, ...(ckChon === ck ? s.chipActive : {}) }}>
                                {ck}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kết quả */}
                <div style={s.content}>
                    <div style={{ marginBottom: 14, fontSize: 13, color: "#6B7280" }}>
                        {loading ? "Đang tìm..." : `${tongSo} bác sĩ${ckChon !== "Tất cả" ? ` chuyên khoa ${ckChon}` : ""}`}
                    </div>

                    {loading ? (
                        <div style={s.grid}>
                            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : danhSach.length === 0 ? (
                        <div style={s.empty}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Không tìm thấy bác sĩ</div>
                            <p style={{ fontSize: 13, color: "#9CA3AF" }}>Thử tìm với từ khoá khác.</p>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {danhSach.map(bs => (
                                <BacSiCard key={bs._id} bs={bs}
                                    onClick={() => navigate(`/tim-bac-si/${bs._id}`)} />
                            ))}
                        </div>
                    )}

                    {/* Phân trang */}
                    {tongTrang > 1 && (
                        <div style={s.paging}>
                            <button disabled={trang === 1} onClick={() => tai(tuKhoa, ckChon, trang - 1)}
                                style={{ ...s.pageBtn, opacity: trang === 1 ? 0.4 : 1 }}>← Trước</button>
                            {Array.from({ length: tongTrang }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => tai(tuKhoa, ckChon, p)}
                                    style={{ ...s.pageBtn, ...(p === trang ? s.pageBtnActive : {}) }}>{p}</button>
                            ))}
                            <button disabled={trang === tongTrang} onClick={() => tai(tuKhoa, ckChon, trang + 1)}
                                style={{ ...s.pageBtn, opacity: trang === tongTrang ? 0.4 : 1 }}>Sau →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BacSiCard({ bs, onClick }) {
    const ten = bs.nguoiDungId?.ten || "Bác sĩ";
    const soSao = bs.diemDanhGia > 0 ? bs.diemDanhGia.toFixed(1) : null;
    const slotHom = (bs.lichLamViec || []).find(n => n.ngay === new Date().toISOString().slice(0, 10));
    const soSlot = slotHom?.khungGios?.filter(k => !k.daDat).length || 0;
    return (
        <div style={s.card} onClick={onClick}>
            <div style={s.cardTop}>
                <div style={s.bigAvatar}>{ten[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.cardName}>BS. {ten}</div>
                    <div style={s.cardSpec}>{bs.chuyenKhoa}</div>
                    {bs.benhVien && <div style={s.cardHospital}>{bs.benhVien}</div>}
                </div>
            </div>
            <div style={s.cardStats}>
                <StatItem value={bs.soNamKinhNghiem > 0 ? `${bs.soNamKinhNghiem} năm` : "—"} label="Kinh nghiệm" />
                <div style={s.statDivider} />
                <StatItem value={soSao ? `${soSao} ★` : "—"} label={`${bs.tongDanhGia || 0} đánh giá`} />
                <div style={s.statDivider} />
                <StatItem value={soSlot > 0 ? `${soSlot} slot` : "Hết slot"} label="Hôm nay" highlight={soSlot > 0} />
            </div>
            {bs.moTa && <p style={s.cardMoTa}>{bs.moTa.slice(0, 80)}{bs.moTa.length > 80 ? "..." : ""}</p>}
            <button style={s.cardBtn}>Xem lịch & đặt khám</button>
        </div>
    );
}

function StatItem({ value, label, highlight }) {
    return (
        <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: highlight ? "#1D9E75" : "#111" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{label}</div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{ ...s.card, cursor: "default" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ ...s.bigAvatar, background: "#F3F4F6" }} />
                <div style={{ flex: 1 }}>
                    <div style={{ height: 14, background: "#F3F4F6", borderRadius: 4, marginBottom: 6, width: "70%" }} />
                    <div style={{ height: 11, background: "#F3F4F6", borderRadius: 4, width: "50%" }} />
                </div>
            </div>
            <div style={{ height: 40, background: "#F3F4F6", borderRadius: 8 }} />
        </div>
    );
}

const s = {
    page:         { minHeight: "100vh", background: "#F8FAFC" },
    header:       { background: "#fff", borderBottom: "0.5px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 },
    headerInner:  { maxWidth: 1100, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo:         { display: "flex", alignItems: "center", gap: 7, cursor: "pointer" },
    logoDot:      { width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" },
    logoText:     { fontSize: 15, fontWeight: 700, color: "#111" },
    headerRight:  { display: "flex", gap: 8 },
    btnOutline:   { height: 34, padding: "0 16px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
    btnPrimary:   { height: 34, padding: "0 16px", border: "none", borderRadius: 8, background: "#1D9E75", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 500 },
    body:         { maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" },
    hero:         { padding: "36px 0 24px", textAlign: "center" },
    heroTitle:    { fontSize: 26, fontWeight: 700, color: "#111", margin: "0 0 8px" },
    heroSub:      { fontSize: 14, color: "#6B7280", margin: "0 0 20px" },
    searchBar:    { display: "flex", gap: 8, maxWidth: 560, margin: "0 auto 16px", background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: 6 },
    searchInput:  { flex: 1, height: 38, border: "none", outline: "none", fontSize: 14, color: "#111", padding: "0 10px", background: "transparent" },
    searchBtn:    { height: 38, padding: "0 20px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
    chips:        { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" },
    chip:         { height: 30, padding: "0 14px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 12, background: "#fff", color: "#6B7280", cursor: "pointer" },
    chipActive:   { background: "#111", color: "#fff", borderColor: "#111" },
    content:      { paddingTop: 8 },
    grid:         { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
    card:         { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 14, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 },
    cardTop:      { display: "flex", gap: 12, alignItems: "flex-start" },
    bigAvatar:    { width: 46, height: 46, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    cardName:     { fontSize: 14, fontWeight: 600, color: "#111" },
    cardSpec:     { fontSize: 12, color: "#1D9E75", fontWeight: 500, marginTop: 2 },
    cardHospital: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    cardStats:    { display: "flex", background: "#F8FAFC", borderRadius: 8, padding: "8px 0" },
    statDivider:  { width: "0.5px", background: "#E5E7EB" },
    cardMoTa:     { fontSize: 12, color: "#6B7280", lineHeight: 1.5, margin: 0 },
    cardBtn:      { height: 34, background: "#ECFDF5", color: "#065F46", border: "0.5px solid #6EE7B7", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", marginTop: "auto" },
    empty:        { textAlign: "center", padding: "60px 20px" },
    paging:       { display: "flex", justifyContent: "center", gap: 6, marginTop: 28 },
    pageBtn:      { height: 32, minWidth: 32, padding: "0 10px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
    pageBtnActive:{ background: "#111", color: "#fff", borderColor: "#111" },
};