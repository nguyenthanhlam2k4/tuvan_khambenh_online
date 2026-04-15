import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { layChiTietBacSi } from "../../api/bacSiApi";
import { datLich } from "../../api/lichKhamApi";

function formatNgay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    const thu = ["CN","T2","T3","T4","T5","T6","T7"][new Date(str).getDay()];
    return `${thu}, ${d}/${m}/${y}`;
}

export default function DatLich() {
    const { id }              = useParams();
    const [params]            = useSearchParams();
    const navigate            = useNavigate();

    const ngay = params.get("ngay");
    const gio  = params.get("gio");

    const [bacSi, setBacSi]   = useState(null);
    const [ghiChu, setGhiChu] = useState("");
    const [loading, setLoad]  = useState(true);
    const [saving, setSave]   = useState(false);
    const [loi, setLoi]       = useState("");

    useEffect(() => {
        if (!ngay || !gio) { navigate("/tim-bac-si"); return; }
        layChiTietBacSi(id)
            .then(r => setBacSi(r.data.data))
            .catch(() => navigate("/tim-bac-si"))
            .finally(() => setLoad(false));
    }, [id]);

    const onDat = async (e) => {
        e.preventDefault();
        setLoi("");
        setSave(true);
        try {
            await datLich({ bacSiId: id, ngay, gio, ghiChu });
            navigate("/benh-nhan?tab=lich-kham&ok=1");
        } catch (err) {
            
            setLoi(err.response?.data?.message || "Đặt lịch thất bại");
            console.log("ERROR BACKEND:", err.response?.data);
        } finally {
            setSave(false);
        }
    };

    if (loading) return <div style={s.center}>Đang tải...</div>;

    const ten = bacSi?.nguoiDungId?.ten || "Bác sĩ";

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerInner}>
                    <button onClick={() => navigate(-1)} style={s.backBtn}>← Quay lại</button>
                    <div style={s.logo} onClick={() => navigate("/")}>
                        <div style={s.logoDot} /><span style={s.logoText}>MediBook</span>
                    </div>
                </div>
            </div>

            <div style={s.body}>
                <div style={s.card}>
                    <h2 style={s.title}>Xác nhận đặt lịch khám</h2>

                    {/* Thông tin bác sĩ */}
                    <div style={s.docRow}>
                        <div style={s.docAvatar}>{ten[0]}</div>
                        <div>
                            <div style={s.docName}>BS. {ten}</div>
                            <div style={s.docSpec}>{bacSi?.chuyenKhoa}{bacSi?.benhVien ? ` · ${bacSi.benhVien}` : ""}</div>
                        </div>
                    </div>

                    {/* Thông tin lịch */}
                    <div style={s.lichBox}>
                        <div style={s.lichRow}>
                            <span style={s.lichLabel}>Ngày khám</span>
                            <span style={s.lichVal}>{formatNgay(ngay)}</span>
                        </div>
                        <div style={s.lichRow}>
                            <span style={s.lichLabel}>Giờ khám</span>
                            <span style={{ ...s.lichVal, color: "#1D9E75", fontWeight: 600 }}>{gio}</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onDat} style={s.form}>
                        <div style={s.fieldWrap}>
                            <label style={s.label}>Ghi chú / triệu chứng (tùy chọn)</label>
                            <textarea
                                value={ghiChu}
                                onChange={e => setGhiChu(e.target.value)}
                                placeholder="Mô tả triệu chứng, lý do khám để bác sĩ chuẩn bị trước..."
                                style={s.textarea}
                                rows={4}
                            />
                        </div>

                        {loi && <div style={s.error}>{loi}</div>}

                        <button type="submit"
                            style={{ ...s.btn, opacity: saving ? 0.7 : 1 }}
                            disabled={saving}>
                            {saving ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
                        </button>
                    </form>

                    <p style={s.note}>
                        Sau khi đặt, lịch sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi bác sĩ xác nhận.
                    </p>
                </div>
            </div>
        </div>
    );
}

const s = {
    page:        { minHeight: "100vh", background: "#F8FAFC" },
    center:      { padding: 60, textAlign: "center", color: "#9CA3AF" },
    header:      { background: "#fff", borderBottom: "0.5px solid #E5E7EB" },
    headerInner: { maxWidth: 600, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 },
    backBtn:     { height: 32, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
    logo:        { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
    logoDot:     { width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" },
    logoText:    { fontSize: 14, fontWeight: 700, color: "#111" },
    body:        { maxWidth: 600, margin: "0 auto", padding: "32px 24px" },
    card:        { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 16, padding: "28px 28px" },
    title:       { fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 20px" },
    docRow:      { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, marginBottom: 16 },
    docAvatar:   { width: 44, height: 44, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    docName:     { fontSize: 15, fontWeight: 600, color: "#111" },
    docSpec:     { fontSize: 13, color: "#6B7280", marginTop: 2 },
    lichBox:     { border: "0.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden", marginBottom: 20 },
    lichRow:     { display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "0.5px solid #F3F4F6" },
    lichLabel:   { fontSize: 13, color: "#9CA3AF" },
    lichVal:     { fontSize: 13, fontWeight: 500, color: "#111" },
    form:        { display: "flex", flexDirection: "column", gap: 14 },
    fieldWrap:   { display: "flex", flexDirection: "column", gap: 6 },
    label:       { fontSize: 13, fontWeight: 500, color: "#374151" },
    textarea:    { border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#111", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 },
    error:       { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626" },
    btn:         { height: 44, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
    note:        { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 14, lineHeight: 1.5 },
};