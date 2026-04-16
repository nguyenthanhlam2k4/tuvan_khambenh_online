import { useState, useEffect } from "react";
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

export default function LichHen() {
    const [lich, setLich]       = useState([]);
    const [loading, setLoad]    = useState(true);
    const [filter, setFilter]   = useState("");
    const [tuKhoa, setTuKhoa]   = useState("");
    const [trang, setTrang]     = useState(1);
    const [tongTrang, setTT]    = useState(1);
    const [tongSo, setTS]       = useState(0);
    const [msg, setMsg]         = useState("");

    const today = new Date().toISOString().slice(0, 10);

    const tai = async (t = 1, f = filter) => {
        setLoad(true);
        try {
            const params = { trang: t, gioiHan: 10 };
            if (f) params.trangThai = f;
            const r = await layLichCuaBacSi(params);
            setLich(r.data.data.danhSach);
            setTT(r.data.data.tongTrang);
            setTS(r.data.data.tongSo);
            setTrang(t);
        } catch { setLich([]); }
        finally { setLoad(false); }
    };

    useEffect(() => { tai(); }, []);

    const onDoiTrangThai = async (id, trangThaiMoi) => {
        try {
            await doiTrangThai(id, trangThaiMoi);
            setMsg("✓ Đã cập nhật trạng thái");
            tai(trang, filter);
        } catch (e) {
            setMsg(e.response?.data?.message || "Thất bại");
        }
    };

    const onFilter = (f) => { setFilter(f); tai(1, f); };

    // Filter client-side theo từ khoá tên bệnh nhân
    const hienThi = tuKhoa
        ? lich.filter(l => {
            const ten = l.benhNhanId?.nguoiDungId?.ten?.toLowerCase() || "";
            return ten.includes(tuKhoa.toLowerCase()) || l.ngay.includes(tuKhoa);
          })
        : lich;

    const sapToi  = lich.filter(l => l.ngay >= today && l.trangThai !== "dahuy").length;
    const choduyet = lich.filter(l => l.trangThai === "choduyet").length;

    return (
        <div style={{ maxWidth: 820 }}>
            {/* Stat cards */}
            <div style={s.statRow}>
                <StatCard label="Tổng lịch hẹn" value={tongSo} />
                <StatCard label="Sắp tới"        value={sapToi}   color="#065F46" bg="#ECFDF5" />
                <StatCard label="Chờ duyệt"      value={choduyet} color="#92400E" bg="#FEF3C7" />
            </div>

            {/* Toolbar */}
            <div style={s.toolbar}>
                <input placeholder="Tìm tên bệnh nhân, ngày..."
                    value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                    style={s.searchInput} />
                <div style={s.filterGroup}>
                    {[
                        { key: "",          label: "Tất cả" },
                        { key: "choduyet",  label: "Chờ duyệt" },
                        { key: "daxacnhan", label: "Đã xác nhận" },
                        { key: "dakham",    label: "Đã khám" },
                        { key: "dahuy",     label: "Đã huỷ" },
                    ].map(f => (
                        <button key={f.key} onClick={() => onFilter(f.key)}
                            style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {msg && (
                <div style={{ ...s.msgBox, background: msg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2", color: msg.startsWith("✓") ? "#065F46" : "#DC2626" }}>
                    {msg}
                </div>
            )}

            {/* Danh sách */}
            {loading ? (
                <div style={s.empty}>Đang tải...</div>
            ) : hienThi.length === 0 ? (
                <div style={s.empty}>
                    {tongSo === 0 ? "Chưa có lịch hẹn nào. Bệnh nhân sẽ xuất hiện khi đặt lịch." : "Không có kết quả phù hợp."}
                </div>
            ) : (
                <div style={s.list}>
                    {hienThi.map(l => {
                        const ts    = TRANG_THAI[l.trangThai];
                        const tenBn = l.benhNhanId?.nguoiDungId?.ten || "Bệnh nhân";
                        const sdt   = l.benhNhanId?.nguoiDungId?.soDienThoai || "";
                        const laSapToi = l.ngay >= today;

                        return (
                            <div key={l._id} style={s.row}>
                                {/* Ngày giờ */}
                                <div style={s.timeCol}>
                                    <div style={s.ngay}>{formatNgay(l.ngay)}</div>
                                    <div style={s.gio}>{l.gio}</div>
                                    {laSapToi && l.trangThai !== "dahuy" && (
                                        <span style={s.sapToiBadge}>Sắp tới</span>
                                    )}
                                </div>

                                {/* Thông tin bệnh nhân */}
                                <div style={s.infoCol}>
                                    <div style={s.tenBn}>{tenBn}</div>
                                    {sdt  && <div style={s.sub}>{sdt}</div>}
                                    {l.ghiChu && (
                                        <div style={s.ghiChu}>"{l.ghiChu}"</div>
                                    )}
                                </div>

                                {/* Trạng thái */}
                                <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>
                                    {ts.label}
                                </span>

                                {/* Nút hành động */}
                                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                    {l.trangThai === "choduyet" && (
                                        <>
                                            <button onClick={() => onDoiTrangThai(l._id, "daxacnhan")} style={s.btnG}>Xác nhận</button>
                                            <button onClick={() => onDoiTrangThai(l._id, "dahuy")}     style={s.btnR}>Huỷ</button>
                                        </>
                                    )}
                                    {l.trangThai === "daxacnhan" && (
                                        <>
                                            <button onClick={() => onDoiTrangThai(l._id, "dakham")} style={s.btnG}>Đã khám ✓</button>
                                            <button onClick={() => onDoiTrangThai(l._id, "dahuy")}  style={s.btnR}>Huỷ</button>
                                        </>
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
                    <button disabled={trang === 1}        onClick={() => tai(trang - 1)} style={{ ...s.pageBtn, opacity: trang === 1 ? 0.4 : 1 }}>←</button>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>Trang {trang} / {tongTrang}</span>
                    <button disabled={trang === tongTrang} onClick={() => tai(trang + 1)} style={{ ...s.pageBtn, opacity: trang === tongTrang ? 0.4 : 1 }}>→</button>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color = "#111", bg = "#F8F9FA" }) {
    return (
        <div style={{ flex: 1, background: bg, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
        </div>
    );
}

const s = {
    statRow:     { display: "flex", gap: 10, marginBottom: 14 },
    toolbar:     { display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" },
    searchInput: { height: 32, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 12, color: "#111", width: 200 },
    filterGroup: { display: "flex", gap: 4, flexWrap: "wrap" },
    filterBtn:   { height: 28, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 11, background: "#fff", color: "#6B7280", cursor: "pointer" },
    filterActive:{ background: "#111", color: "#fff", border: "0.5px solid #1D9E75" },
    msgBox:      { padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 10 },
    empty:       { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "36px 20px", textAlign: "center", fontSize: 13, color: "#9CA3AF" },
    list:        { display: "flex", flexDirection: "column", gap: 6 },
    row:         { display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "12px 16px" },
    timeCol:     { minWidth: 120 },
    ngay:        { fontSize: 11, color: "#9CA3AF" },
    gio:         { fontSize: 20, fontWeight: 700, color: "#1D9E75", lineHeight: 1.2 },
    sapToiBadge: { display: "inline-block", marginTop: 3, fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "1px 7px", borderRadius: 20 },
    infoCol:     { flex: 1, minWidth: 0 },
    tenBn:       { fontSize: 13, fontWeight: 600, color: "#111" },
    sub:         { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
    ghiChu:      { fontSize: 11, color: "#6B7280", marginTop: 3, fontStyle: "italic" },
    badge:       { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 },
    btnG:        { height: 28, padding: "0 10px", border: "0.5px solid #6EE7B7", borderRadius: 6, background: "#ECFDF5", color: "#065F46", fontSize: 11, fontWeight: 500, cursor: "pointer" },
    btnR:        { height: 28, padding: "0 10px", border: "0.5px solid #FCA5A5", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer" },
    paging:      { display: "flex", justifyContent: "center", gap: 10, alignItems: "center", marginTop: 12 },
    pageBtn:     { height: 28, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" },
};