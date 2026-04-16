import { useState, useEffect } from "react";
import { layTatCaLich, doiTrangThai } from "../../api/lichKhamApi";

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
    return `${thu} ${d}/${m}`;
}

export default function AdminLichKham() {
    const [lich, setLich]     = useState([]);
    const [loading, setLoad]  = useState(true);
    const [filter, setFilter] = useState("");
    const [ngay, setNgay]     = useState("");
    const [trang, setTrang]   = useState(1);
    const [tongTrang, setTT]  = useState(1);
    const [tongSo, setTS]     = useState(0);
    const [msg, setMsg]       = useState({ text: "", ok: true });
    const [chon, setChon]     = useState(null); // modal

    const tai = async (t = 1, f = filter, n = ngay) => {
        setLoad(true);
        try {
            const params = { trang: t, gioiHan: 12 };
            if (f) params.trangThai = f;
            if (n) { params.tuNgay = n; params.denNgay = n; }
            const r = await layTatCaLich(params);
            setLich(r.data.data.danhSach);
            setTT(r.data.data.tongTrang);
            setTS(r.data.data.tongSo);
            setTrang(t);
        } catch { setLich([]); }
        finally { setLoad(false); }
    };

    useEffect(() => { tai(); }, []);

    const onDoiTT = async (id, tt) => {
        try {
            await doiTrangThai(id, tt);
            setMsg({ text: "✓ Đã cập nhật", ok: true });
            setChon(null);
            tai(trang);
        } catch (e) {
            setMsg({ text: e.response?.data?.message || "Thất bại", ok: false });
        }
    };

    const onFilter = (f) => { setFilter(f); tai(1, f, ngay); };
    const onNgay   = (n) => { setNgay(n);   tai(1, filter, n); };

    const FILTERS = [
        { key: "",         label: `Tất cả (${tongSo})` },
        { key: "choduyet",  label: "Chờ duyệt" },
        { key: "daxacnhan", label: "Đã xác nhận" },
        { key: "dakham",    label: "Đã khám" },
        { key: "dahuy",     label: "Đã huỷ" },
    ];

    return (
        <div>
            {/* Toolbar */}
            <div style={s.toolbar}>
                <div style={s.filterRow}>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => onFilter(f.key)}
                            style={{ ...s.fBtn, ...(filter === f.key ? s.fActive : {}) }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <input type="date" value={ngay} onChange={e => onNgay(e.target.value)}
                    style={s.dateInput}
                    title="Lọc theo ngày" />
                {ngay && (
                    <button onClick={() => onNgay("")} style={s.clearBtn}>✕ Xoá lọc ngày</button>
                )}
            </div>

            {msg.text && (
                <div style={{ ...s.msgBox, background: msg.ok ? "#ECFDF5" : "#FEF2F2", color: msg.ok ? "#065F46" : "#DC2626" }}>
                    {msg.text}
                </div>
            )}

            {/* Bảng */}
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            {["Bệnh nhân", "Bác sĩ", "Ngày / Giờ", "Ghi chú", "Trạng thái", "Thao tác"].map(h => (
                                <th key={h} style={s.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={s.empty}>Đang tải...</td></tr>
                        ) : lich.length === 0 ? (
                            <tr><td colSpan={6} style={s.empty}>Không có dữ liệu</td></tr>
                        ) : lich.map(l => {
                            const ts    = TRANG_THAI[l.trangThai];
                            const tenBn = l.benhNhanId?.nguoiDungId?.ten || "—";
                            const tenBs = l.bacSiId?.nguoiDungId?.ten   || "—";
                            return (
                                <tr key={l._id} style={s.tr}>
                                    <td style={s.td}>
                                        <div style={s.cellName}>{tenBn}</div>
                                        <div style={s.cellSub}>{l.benhNhanId?.nguoiDungId?.soDienThoai || ""}</div>
                                    </td>
                                    <td style={s.td}>
                                        <div style={s.cellName}>BS. {tenBs}</div>
                                        <div style={s.cellSub}>{l.bacSiId?.chuyenKhoa}</div>
                                    </td>
                                    <td style={s.td}>
                                        <div style={{ fontWeight: 600, color: "#1D9E75", fontSize: 14 }}>{l.gio}</div>
                                        <div style={s.cellSub}>{fmtNgay(l.ngay)}</div>
                                    </td>
                                    <td style={{ ...s.td, maxWidth: 160 }}>
                                        <div style={{ fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {l.ghiChu || <span style={{ color: "#D1D5DB" }}>—</span>}
                                        </div>
                                    </td>
                                    <td style={s.td}>
                                        <span style={{ ...s.badge, background: ts.bg, color: ts.color }}>
                                            {ts.label}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button onClick={() => setChon(l)} style={s.btnDetail}>Chi tiết</button>
                                            {l.trangThai === "choduyet" && (
                                                <button onClick={() => onDoiTT(l._id, "daxacnhan")} style={s.btnG}>Duyệt</button>
                                            )}
                                            {l.trangThai === "daxacnhan" && (
                                                <button onClick={() => onDoiTT(l._id, "dakham")} style={s.btnG}>Đã khám</button>
                                            )}
                                            {["choduyet","daxacnhan"].includes(l.trangThai) && (
                                                <button onClick={() => onDoiTT(l._id, "dahuy")} style={s.btnR}>Huỷ</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {tongTrang > 1 && (
                <div style={s.paging}>
                    <button disabled={trang === 1} onClick={() => tai(trang - 1)}
                        style={{ ...s.pageBtn, opacity: trang === 1 ? 0.4 : 1 }}>←</button>
                    {Array.from({ length: tongTrang }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => tai(p)}
                            style={{ ...s.pageBtn, ...(p === trang ? s.pageBtnActive : {}) }}>{p}</button>
                    ))}
                    <button disabled={trang === tongTrang} onClick={() => tai(trang + 1)}
                        style={{ ...s.pageBtn, opacity: trang === tongTrang ? 0.4 : 1 }}>→</button>
                </div>
            )}

            {/* Modal chi tiết */}
            {chon && <ModalChiTiet l={chon} onClose={() => setChon(null)} onDoiTT={onDoiTT} />}
        </div>
    );
}

function ModalChiTiet({ l, onClose, onDoiTT }) {
    const ts    = TRANG_THAI[l.trangThai];
    const tenBn = l.benhNhanId?.nguoiDungId?.ten || "—";
    const tenBs = l.bacSiId?.nguoiDungId?.ten    || "—";

    function fmtFull(str) {
        if (!str) return "";
        const [y, m, d] = str.split("-");
        const thu = ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][new Date(str).getDay()];
        return `${thu}, ${d}/${m}/${y}`;
    }

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
                <div style={s.mHead}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>Chi tiết lịch khám</div>
                    <button onClick={onClose} style={s.closeBtn}>✕</button>
                </div>
                <div style={s.mBody}>
                    {/* Trạng thái */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                        <span style={{ ...s.badge, background: ts.bg, color: ts.color, fontSize: 13, padding: "4px 14px" }}>
                            {ts.label}
                        </span>
                    </div>

                    <div style={s.mGrid}>
                        {/* Bệnh nhân */}
                        <div style={s.mCard}>
                            <div style={s.mCardTitle}>Bệnh nhân</div>
                            <MRow label="Họ tên"     value={tenBn} />
                            <MRow label="Email"      value={l.benhNhanId?.nguoiDungId?.email || "—"} />
                            <MRow label="SĐT"        value={l.benhNhanId?.nguoiDungId?.soDienThoai || "—"} />
                        </div>
                        {/* Bác sĩ */}
                        <div style={s.mCard}>
                            <div style={s.mCardTitle}>Bác sĩ</div>
                            <MRow label="Họ tên"     value={`BS. ${tenBs}`} />
                            <MRow label="Chuyên khoa" value={l.bacSiId?.chuyenKhoa || "—"} />
                            <MRow label="Bệnh viện"  value={l.bacSiId?.benhVien || "—"} />
                        </div>
                    </div>

                    {/* Thông tin lịch */}
                    <div style={{ ...s.mCard, marginTop: 10 }}>
                        <div style={s.mCardTitle}>Thông tin lịch hẹn</div>
                        <MRow label="Ngày khám" value={fmtFull(l.ngay)} />
                        <MRow label="Giờ khám"  value={l.gio} highlight />
                        <MRow label="Ghi chú"   value={l.ghiChu || "Không có"} />
                    </div>

                    {/* Hành động */}
                    <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                        {l.trangThai === "choduyet" && (
                            <button onClick={() => onDoiTT(l._id, "daxacnhan")} style={{ ...s.btnG, height: 34, padding: "0 16px", fontSize: 13 }}>
                                Xác nhận lịch
                            </button>
                        )}
                        {l.trangThai === "daxacnhan" && (
                            <button onClick={() => onDoiTT(l._id, "dakham")} style={{ ...s.btnG, height: 34, padding: "0 16px", fontSize: 13 }}>
                                Đánh dấu đã khám
                            </button>
                        )}
                        {["choduyet","daxacnhan"].includes(l.trangThai) && (
                            <button onClick={() => onDoiTT(l._id, "dahuy")} style={{ ...s.btnR, height: 34, padding: "0 16px", fontSize: 13 }}>
                                Huỷ lịch
                            </button>
                        )}
                        <button onClick={onClose} style={{ height: 34, padding: "0 16px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MRow({ label, value, highlight }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</span>
            <span style={{ fontSize: 13, color: highlight ? "#1D9E75" : "#111", fontWeight: highlight ? 600 : 400 }}>{value}</span>
        </div>
    );
}

const s = {
    toolbar:   { display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" },
    filterRow: { display: "flex", gap: 4, flexWrap: "wrap" },
    fBtn:      { height: 28, padding: "0 12px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 11, background: "#fff", color: "#6B7280", cursor: "pointer" },
    fActive:   { background: "#111", color: "#fff", borderColor: "#111" },
    dateInput: { height: 28, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 8px", fontSize: 12, color: "#374151", background: "#fff" },
    clearBtn:  { height: 28, padding: "0 10px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 11, color: "#9CA3AF", cursor: "pointer" },
    msgBox:    { padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 10 },
    tableWrap: { border: "0.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden" },
    table:     { width: "100%", borderCollapse: "collapse", fontSize: 12 },
    thead:     { background: "#F8F9FA" },
    th:        { padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "#6B7280", borderBottom: "0.5px solid #E5E7EB", fontSize: 11 },
    tr:        { borderBottom: "0.5px solid #F3F4F6" },
    td:        { padding: "9px 12px", verticalAlign: "middle" },
    cellName:  { fontSize: 13, fontWeight: 500, color: "#111" },
    cellSub:   { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
    empty:     { padding: 40, textAlign: "center", color: "#9CA3AF" },
    badge:     { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
    btnDetail: { height: 24, padding: "0 8px", border: "0.5px solid #E5E7EB", borderRadius: 5, background: "#fff", fontSize: 11, cursor: "pointer", color: "#374151" },
    btnG:      { height: 24, padding: "0 8px", border: "0.5px solid #6EE7B7", borderRadius: 5, background: "#ECFDF5", color: "#065F46", fontSize: 11, cursor: "pointer", fontWeight: 500 },
    btnR:      { height: 24, padding: "0 8px", border: "0.5px solid #FCA5A5", borderRadius: 5, background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer" },
    paging:    { display: "flex", justifyContent: "center", gap: 5, alignItems: "center", marginTop: 12 },
    pageBtn:   { height: 28, minWidth: 28, padding: "0 8px", border: "0.5px solid #E5E7EB", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" },
    pageBtnActive: { background: "#111", color: "#fff", borderColor: "#111" },
    overlay:   { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
    modal:     { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    mHead:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid #E5E7EB" },
    mBody:     { padding: "16px 20px 20px" },
    mGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    mCard:     { background: "#F8FAFC", borderRadius: 10, padding: "10px 14px" },
    mCardTitle:{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
    closeBtn:  { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9CA3AF" },
};