import { useState, useEffect } from "react";
import api from "../../api/axios";

const VAI_TRO_STYLE = {
    admin:    { bg: "#EDE9FE", color: "#6D28D9" },
    bacsi:    { bg: "#D1FAE5", color: "#065F46" },
    benhnhan: { bg: "#E0E7FF", color: "#3730A3" },
};
const VAI_TRO_LABEL = { admin: "Admin", bacsi: "Bác sĩ", benhnhan: "Bệnh nhân" };

function fmtDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export default function QuanLyNguoiDung() {
    const [ds, setDs]         = useState([]);
    const [loading, setLoad]  = useState(true);
    const [tuKhoa, setTuKhoa] = useState("");
    const [vaiTro, setVaiTro] = useState("");
    const [trang, setTrang]   = useState(1);
    const [tongTrang, setTT]  = useState(1);
    const [tongSo, setTS]     = useState(0);
    const [msg, setMsg]       = useState("");

    const tai = async (t = 1, tk = tuKhoa, vt = vaiTro) => {
        setLoad(true);
        try {
            const params = { trang: t, gioiHan: 10 };
            if (vt) params.vaiTro  = vt;
            if (tk) params.tuKhoa  = tk;
            const r = await api.get("/nguoi-dung", { params });
            const { danhSach, tongSo: ts, tongTrang: tt } = r.data.data;
            setDs(danhSach);
            setTS(ts);
            setTT(tt);
            setTrang(t);
        } catch { setDs([]); }
        finally { setLoad(false); }
    };

    useEffect(() => { tai(); }, []);

    const onSearch = e => { e.preventDefault(); tai(1); };

    const onVaiTro = (vt) => {
        setVaiTro(vt);
        setTrang(1);
        tai(1, tuKhoa, vt);
    };

    const onXoa = async (id, ten) => {
        if (!confirm(`Xoá người dùng "${ten}"?`)) return;
        try {
            await api.delete(`/nguoi-dung/${id}`);
            setMsg("✓ Đã xoá người dùng");
            tai(trang);
        } catch (e) {
            setMsg(e.response?.data?.message || "Xoá thất bại");
        }
    };

    return (
        <div>
            {/* Toolbar */}
            <div style={s.toolbar}>
                <form onSubmit={onSearch} style={{ display: "flex", gap: 6, flex: 1 }}>
                    <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
                        placeholder="Tìm theo tên, email..."
                        style={s.searchInput} />
                    <button type="submit" style={s.searchBtn}>Tìm</button>
                </form>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{tongSo} người dùng</span>
            </div>

            {/* Filter vai trò */}
            <div style={s.filterRow}>
                {[
                    { key: "",          label: "Tất cả" },
                    { key: "benhnhan",  label: "Bệnh nhân" },
                    { key: "bacsi",     label: "Bác sĩ" },
                    { key: "admin",     label: "Admin" },
                ].map(f => (
                    <button key={f.key} onClick={() => onVaiTro(f.key)}
                        style={{ ...s.filterBtn, ...(vaiTro === f.key ? s.filterActive : {}) }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {msg && (
                <div style={{ ...s.msgBox, background: msg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2", color: msg.startsWith("✓") ? "#065F46" : "#DC2626" }}>
                    {msg}
                </div>
            )}

            {/* Bảng */}
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            {["Người dùng", "Vai trò", "Số điện thoại", "Ngày tạo", "Thao tác"].map(h => (
                                <th key={h} style={s.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={s.empty}>Đang tải...</td></tr>
                        ) : ds.length === 0 ? (
                            <tr><td colSpan={5} style={s.empty}>Không có dữ liệu</td></tr>
                        ) : ds.map(u => {
                            const vt = VAI_TRO_STYLE[u.vaiTro] || { bg: "#F3F4F6", color: "#374151" };
                            return (
                                <tr key={u._id} style={s.tr}>
                                    <td style={s.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ ...s.avatar, background: vt.bg, color: vt.color }}>
                                                {u.ten?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{u.ten}</div>
                                                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={s.td}>
                                        <span style={{ ...s.badge, background: vt.bg, color: vt.color }}>
                                            {VAI_TRO_LABEL[u.vaiTro] || u.vaiTro}
                                        </span>
                                    </td>
                                    <td style={s.td}>{u.soDienThoai || "—"}</td>
                                    <td style={s.td}>{fmtDate(u.ngayTao || u.createdAt)}</td>
                                    <td style={s.td}>
                                        {u.vaiTro !== "admin" && (
                                            <button onClick={() => onXoa(u._id, u.ten)} style={s.xoaBtn}>Xoá</button>
                                        )}
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
                        style={{ ...s.pageBtn, opacity: trang === 1 ? 0.4 : 1 }}>← Trước</button>
                    {Array.from({ length: tongTrang }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => tai(p)}
                            style={{ ...s.pageBtn, ...(p === trang ? s.pageBtnActive : {}) }}>{p}</button>
                    ))}
                    <button disabled={trang === tongTrang} onClick={() => tai(trang + 1)}
                        style={{ ...s.pageBtn, opacity: trang === tongTrang ? 0.4 : 1 }}>Sau →</button>
                </div>
            )}
        </div>
    );
}

const s = {
    toolbar:    { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" },
    searchInput:{ flex: 1, height: 32, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#111" },
    searchBtn:  { height: 32, padding: "0 14px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" },
    filterRow:  { display: "flex", gap: 4, marginBottom: 12 },
    filterBtn:  { height: 28, padding: "0 14px", border: "0.5px solid #E5E7EB", borderRadius: 20, fontSize: 12, background: "#fff", color: "#6B7280", cursor: "pointer" },
    filterActive:{ background: "#111", color: "#fff", borderColor: "#111" },
    msgBox:     { padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 10 },
    tableWrap:  { border: "0.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden" },
    table:      { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    thead:      { background: "#F8F9FA" },
    th:         { padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "#6B7280", borderBottom: "0.5px solid #E5E7EB", fontSize: 12 },
    tr:         { borderBottom: "0.5px solid #F3F4F6" },
    td:         { padding: "9px 12px", verticalAlign: "middle" },
    empty:      { padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 13 },
    avatar:     { width: 28, height: 28, borderRadius: "50%", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    badge:      { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
    xoaBtn:     { height: 26, padding: "0 10px", border: "0.5px solid #FCA5A5", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer" },
    paging:     { display: "flex", justifyContent: "center", gap: 6, alignItems: "center", marginTop: 12 },
    pageBtn:    { height: 28, minWidth: 28, padding: "0 8px", border: "0.5px solid #E5E7EB", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" },
    pageBtnActive:{ background: "#111", color: "#fff", borderColor: "#111" },
};