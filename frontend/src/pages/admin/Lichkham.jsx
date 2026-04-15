import { useState, useEffect } from "react";
import { layLichCuaBenhNhan, huyLich } from "../../api/lichKhamApi";
import { useNavigate } from "react-router";

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

export default function LichKham() {
    const navigate = useNavigate();
    const [lich, setLich]       = useState([]);
    const [loading, setLoad]    = useState(true);
    const [filter, setFilter]   = useState("");
    const [msg, setMsg]         = useState("");
    const [trang, setTrang]     = useState(1);
    const [tongTrang, setTT]    = useState(1);

    const tai = async (t = 1, f = filter) => {
        setLoad(true);
        try {
            const params = { trang: t, gioiHan: 10 };
            if (f) params.trangThai = f;
            const r = await layLichCuaBenhNhan(params);
            setLich(r.data.data.danhSach);
            setTT(r.data.data.tongTrang);
            setTrang(t);
        } catch { setLich([]); }
        finally { setLoad(false); }
    };

    useEffect(() => { tai(); }, []);

    const onHuy = async (id) => {
        if (!confirm("Xác nhận hủy lịch khám này?")) return;
        try {
            await huyLich(id);
            setMsg("Đã hủy lịch khám");
            tai();
        } catch (e) {
            setMsg(e.response?.data?.message || "Không thể hủy");
        }
    };

    const onFilter = (f) => { setFilter(f); tai(1, f); };

    return (
        <div style={{ maxWidth: 760 }}>
            {/* Filter */}
            <div style={s.toolbar}>
                <div style={s.filterGroup}>
                    {[
                        { key: "", label: "Tất cả" },
                        { key: "choduyet",  label: "Chờ duyệt" },
                        { key: "daxacnhan", label: "Đã xác nhận" },
                        { key: "dakham",    label: "Đã khám" },
                        { key: "dahuy",     label: "Đã hủy" },
                    ].map(f => (
                        <button key={f.key} onClick={() => onFilter(f.key)}
                            style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => navigate("/benh-nhan?tab=tim-bac-si")} style={s.addBtn}>
                    + Đặt lịch mới
                </button>
            </div>

            {msg && (
                <div style={{ ...s.msgBox, background: msg.startsWith("Đã") ? "#ECFDF5" : "#FEF2F2", color: msg.startsWith("Đã") ? "#065F46" : "#DC2626" }}>
                    {msg}
                </div>
            )}

            {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Đang tải...</div>
            ) : lich.length === 0 ? (
                <div style={s.empty}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                    <div style={{ fontWeight: 500, color: "#374151", marginBottom: 6 }}>Chưa có lịch khám</div>
                    <button onClick={() => navigate("/benh-nhan?tab=tim-bac-si")} style={s.addBtn}>Tìm bác sĩ đặt lịch</button>
                </div>
            ) : (
                <div style={s.list}>
                    {lich.map(l => {
                        const ts    = TRANG_THAI[l.trangThai];
                        const tenBs = l.bacSiId?.nguoiDungId?.ten || "Bác sĩ";
                        const today = new Date().toISOString().slice(0, 10);
                        const coTheHuy = ["choduyet", "daxacnhan"].includes(l.trangThai) && l.ngay >= today;

                        return (
                            <div key={l._id} style={s.row}>
                                {/* Thời gian */}
                                <div style={s.timeCol}>
                                    <div style={s.thu}>{fmtNgay(l.ngay)}</div>
                                    <div style={s.gio}>{l.gio}</div>
                                </div>
                                {/* Thông tin */}
                                <div style={s.infoCol}>
                                    <div style={s.bsName}>BS. {tenBs}</div>
                                    <div style={s.bsSpec}>{l.bacSiId?.chuyenKhoa}{l.bacSiId?.benhVien ? ` · ${l.bacSiId.benhVien}` : ""}</div>
                                    {l.ghiChu && <div style={s.ghiChu}>"{l.ghiChu}"</div>}
                                </div>
                                {/* Trạng thái + action */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                    <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>{ts.label}</span>
                                    {coTheHuy && (
                                        <button onClick={() => onHuy(l._id)} style={s.huyBtn}>Hủy lịch</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Phân trang */}
            {tongTrang > 1 && (
                <div style={s.paging}>
                    <button disabled={trang === 1} onClick={() => tai(trang - 1)} style={{ ...s.pageBtn, opacity: trang === 1 ? 0.4 : 1 }}>←</button>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>Trang {trang} / {tongTrang}</span>
                    <button disabled={trang === tongTrang} onClick={() => tai(trang + 1)} style={{ ...s.pageBtn, opacity: trang === tongTrang ? 0.4 : 1 }}>→</button>
                </div>
            )}
        </div>
    );
}

const s = {
    toolbar:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 },
    filterGroup:  { display: "flex", gap: 4, flexWrap: "wrap" },
    filterBtn:    { height: 30, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 11, background: "#fff", color: "#6B7280", cursor: "pointer" },
    filterActive: { background: "#111", color: "#fff", border: "0.5px solid #1D9E75" },
    addBtn:       { height: 32, padding: "0 14px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" },
    msgBox:       { padding: "8px 14px", borderRadius: 8, fontSize: 12, marginBottom: 10 },
    empty:        { textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12 },
    list:         { display: "flex", flexDirection: "column", gap: 8 },
    row:          { display: "flex", alignItems: "flex-start", gap: 16, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "14px 16px" },
    timeCol:      { minWidth: 110 },
    thu:          { fontSize: 11, color: "#9CA3AF" },
    gio:          { fontSize: 20, fontWeight: 700, color: "#1D9E75", lineHeight: 1.2 },
    infoCol:      { flex: 1, minWidth: 0 },
    bsName:       { fontSize: 14, fontWeight: 600, color: "#111" },
    bsSpec:       { fontSize: 12, color: "#6B7280", marginTop: 2 },
    ghiChu:       { fontSize: 11, color: "#9CA3AF", marginTop: 4, fontStyle: "italic" },
    badge:        { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
    huyBtn:       { height: 26, padding: "0 10px", border: "0.5px solid #FCA5A5", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer" },
    paging:       { display: "flex", justifyContent: "center", gap: 10, alignItems: "center", marginTop: 14 },
    pageBtn:      { height: 28, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" },
};