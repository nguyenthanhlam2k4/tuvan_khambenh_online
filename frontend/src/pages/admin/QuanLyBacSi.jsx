import { useState, useEffect } from "react";
import { layDanhSachBacSi, duyetBacSi, xoaBacSi } from "../../api/bacSiApi";

export default function QuanLyBacSi() {
    const [danhSach, setDanhSach] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [query, setQuery]       = useState({ chuyenKhoa: "", daXacMinh: "", trang: 1 });
    const [phan, setPhan]         = useState({ tongSo: 0, tongTrang: 1 });
    const [chonBacSi, setChon]    = useState(null); // modal xem chi tiết

    const tai = async (q = query) => {
        setLoading(true);
        try {
            const params = { ...q, gioiHan: 10 };
            if (params.daXacMinh === "") delete params.daXacMinh;
            const res = await layDanhSachBacSi(params);
            setDanhSach(res.data.data.danhSach);
            setPhan({ tongSo: res.data.data.tongSo, tongTrang: res.data.data.tongTrang });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { tai(); }, []);

    const onFilter = (e) => {
        const next = { ...query, [e.target.name]: e.target.value, trang: 1 };
        setQuery(next);
        tai(next);
    };

    const onDuyet = async (id, trangThai) => {
        try {
            await duyetBacSi(id, trangThai);
            tai();
        } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
    };

    const onXoa = async (id, ten) => {
        if (!confirm(`Xoá hồ sơ bác sĩ "${ten}"?`)) return;
        try {
            await xoaBacSi(id);
            tai();
        } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
    };

    return (
        <div>
            {/* Toolbar */}
            <div style={s.toolbar}>
                <input name="chuyenKhoa" value={query.chuyenKhoa} onChange={onFilter}
                    placeholder="Tìm chuyên khoa..." style={s.searchInput} />
                <select name="daXacMinh" value={query.daXacMinh} onChange={onFilter} style={s.select}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="true">Đã duyệt</option>
                    <option value="false">Chờ duyệt</option>
                </select>
                <span style={s.total}>{phan.tongSo} bác sĩ</span>
            </div>

            {/* Bảng */}
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            {["Bác sĩ", "Chuyên khoa", "Kinh nghiệm", "Bệnh viện", "Đánh giá", "Trạng thái", "Thao tác"].map(h => (
                                <th key={h} style={s.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={s.empty}>Đang tải...</td></tr>
                        ) : danhSach.length === 0 ? (
                            <tr><td colSpan={7} style={s.empty}>Không có dữ liệu</td></tr>
                        ) : danhSach.map(bs => (
                            <tr key={bs._id} style={s.tr}>
                                <td style={s.td}>
                                    <div style={s.nameCell}>
                                        <div style={s.avatar}>{bs.nguoiDungId?.ten?.[0] || "B"}</div>
                                        <div>
                                            <div style={s.name}>{bs.nguoiDungId?.ten}</div>
                                            <div style={s.email}>{bs.nguoiDungId?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={s.td}>{bs.chuyenKhoa}</td>
                                <td style={s.td}>{bs.soNamKinhNghiem} năm</td>
                                <td style={s.td}>{bs.benhVien || "—"}</td>
                                <td style={s.td}>
                                    {bs.diemDanhGia > 0
                                        ? <span>⭐ {bs.diemDanhGia.toFixed(1)} <span style={{ color: "#9CA3AF" }}>({bs.tongDanhGia})</span></span>
                                        : <span style={{ color: "#9CA3AF" }}>Chưa có</span>
                                    }
                                </td>
                                <td style={s.td}>
                                    <Badge ok={bs.daXacMinh}>{bs.daXacMinh ? "Đã duyệt" : "Chờ duyệt"}</Badge>
                                </td>
                                <td style={s.td}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <Btn onClick={() => setChon(bs)}>Chi tiết</Btn>
                                        {!bs.daXacMinh
                                            ? <Btn green onClick={() => onDuyet(bs._id, true)}>Duyệt</Btn>
                                            : <Btn onClick={() => onDuyet(bs._id, false)}>Bỏ duyệt</Btn>
                                        }
                                        <Btn red onClick={() => onXoa(bs._id, bs.nguoiDungId?.ten)}>Xoá</Btn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {phan.tongTrang > 1 && (
                <div style={s.paging}>
                    <Btn disabled={query.trang <= 1} onClick={() => {
                        const next = { ...query, trang: query.trang - 1 };
                        setQuery(next); tai(next);
                    }}>← Trước</Btn>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>
                        Trang {query.trang} / {phan.tongTrang}
                    </span>
                    <Btn disabled={query.trang >= phan.tongTrang} onClick={() => {
                        const next = { ...query, trang: query.trang + 1 };
                        setQuery(next); tai(next);
                    }}>Sau →</Btn>
                </div>
            )}

            {/* Modal chi tiết */}
            {chonBacSi && <ModalChiTiet bacSi={chonBacSi} onClose={() => setChon(null)} />}
        </div>
    );
}

// ── Modal chi tiết ────────────────────────────────────────────────────────────
function ModalChiTiet({ bacSi, onClose }) {
    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
                <div style={s.modalHeader}>
                    <div style={s.modalAvatar}>{bacSi.nguoiDungId?.ten?.[0]}</div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{bacSi.nguoiDungId?.ten}</div>
                        <div style={{ fontSize: 13, color: "#6B7280" }}>{bacSi.chuyenKhoa} · {bacSi.benhVien}</div>
                    </div>
                    <button onClick={onClose} style={s.closeBtn}>✕</button>
                </div>
                <div style={s.modalBody}>
                    <Row label="Email"        value={bacSi.nguoiDungId?.email} />
                    <Row label="Điện thoại"   value={bacSi.nguoiDungId?.soDienThoai || "—"} />
                    <Row label="Kinh nghiệm"  value={`${bacSi.soNamKinhNghiem} năm`} />
                    <Row label="Đánh giá"     value={bacSi.diemDanhGia > 0 ? `${bacSi.diemDanhGia.toFixed(1)}/5 (${bacSi.tongDanhGia} đánh giá)` : "Chưa có"} />
                    <Row label="Số ngày lịch" value={`${bacSi.lichLamViec?.length || 0} ngày đã đăng ký`} />
                    {bacSi.moTa && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>Giới thiệu</div>
                            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{bacSi.moTa}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Reusable nhỏ ──────────────────────────────────────────────────────────────
function Badge({ ok, children }) {
    return (
        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: ok ? "#D1FAE5" : "#FEF3C7", color: ok ? "#065F46" : "#92400E" }}>
            {children}
        </span>
    );
}

function Btn({ children, onClick, green, red, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            height: 26, padding: "0 10px", borderRadius: 6, fontSize: 11, cursor: disabled ? "default" : "pointer",
            border: `0.5px solid ${red ? "#FCA5A5" : green ? "#6EE7B7" : "#E5E7EB"}`,
            background: red ? "#FEF2F2" : green ? "#ECFDF5" : "#fff",
            color: red ? "#DC2626" : green ? "#065F46" : "#374151",
            opacity: disabled ? 0.5 : 1,
        }}>{children}</button>
    );
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</span>
            <span style={{ fontSize: 13, color: "#111" }}>{value}</span>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
    toolbar:    { display: "flex", gap: 8, marginBottom: 14, alignItems: "center" },
    searchInput:{ flex: 1, height: 32, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#111" },
    select:     { height: 32, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 8px", fontSize: 13 },
    total:      { fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" },
    tableWrap:  { border: "0.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden" },
    table:      { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    thead:      { background: "#F8F9FA" },
    th:         { padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "#6B7280", borderBottom: "0.5px solid #E5E7EB", fontSize: 12 },
    tr:         { borderBottom: "0.5px solid #F3F4F6" },
    td:         { padding: "9px 12px", verticalAlign: "middle" },
    empty:      { padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 13 },
    nameCell:   { display: "flex", alignItems: "center", gap: 8 },
    avatar:     { width: 28, height: 28, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    name:       { fontSize: 13, fontWeight: 500, color: "#111" },
    email:      { fontSize: 11, color: "#9CA3AF" },
    paging:     { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 14 },
    overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
    modal:      { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440, overflow: "hidden" },
    modalHeader:{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "0.5px solid #E5E7EB" },
    modalAvatar:{ width: 44, height: 44, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    modalBody:  { padding: "14px 20px 20px" },
    closeBtn:   { marginLeft: "auto", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9CA3AF" },
};