import { useState, useEffect } from "react";
import { layHoSoCaNhan, taoBacSi, capNhatBacSi } from "../../api/bacSiApi";
import { useAuth } from "../../context/AuthContext";

const CHUYEN_KHOA = ["Tim mạch", "Nội khoa", "Nhi khoa", "Da liễu", "Sản phụ khoa", "Tâm lý", "Xương khớp", "Mắt", "Tai mũi họng", "Răng hàm mặt"];

export default function HoSoBacSi() {
    const { nguoiDung } = useAuth();
    const [hoSo, setHoSo]   = useState(null);
    const [form, setForm]   = useState({ chuyenKhoa: "", soNamKinhNghiem: "", benhVien: "", moTa: "" });
    const [loading, setLoad] = useState(true);
    const [saving, setSave]  = useState(false);
    const [msg, setMsg]      = useState({ text: "", ok: true });

    useEffect(() => {
        layHoSoCaNhan()
            .then(res => {
                const d = res.data.data;
                setHoSo(d);
                setForm({
                    chuyenKhoa:      d.chuyenKhoa || "",
                    soNamKinhNghiem: d.soNamKinhNghiem ?? "",
                    benhVien:        d.benhVien || "",
                    moTa:            d.moTa || "",
                });
            })
            .catch(() => {}) // chưa có hồ sơ → form tạo mới
            .finally(() => setLoad(false));
    }, []);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const onSave = async (e) => {
    e.preventDefault();

    if (!form.chuyenKhoa)
        return setMsg({ text: "Vui lòng chọn chuyên khoa", ok: false });

    setSave(true);
    setMsg({ text: "", ok: true });

    try {
        const payload = {
            ...form,
            soNamKinhNghiem: form.soNamKinhNghiem
                ? Number(form.soNamKinhNghiem)
                : 0,
        };

        if (hoSo) {
            const res = await capNhatBacSi(hoSo._id, payload);
            setHoSo(res.data.data);
        } else {
            const res = await taoBacSi(payload);
            setHoSo(res.data.data);
        }

        setMsg({ text: hoSo ? "Đã lưu thay đổi" : "Tạo hồ sơ thành công!", ok: true });

    } catch (err) {
        console.log("ERROR:", err.response?.data); // 👈 thêm dòng này
        setMsg({ text: err.response?.data?.message || "Lưu thất bại", ok: false });
    } finally {
        setSave(false);
    }
};

    if (loading) return <div style={s.center}>Đang tải hồ sơ...</div>;

    return (
        <div style={s.wrap}>
            {/* Header hồ sơ */}
            <div style={s.profileCard}>
                <div style={s.bigAvatar}>{nguoiDung?.ten?.[0] || "B"}</div>
                <div>
                    <div style={s.profileName}>{nguoiDung?.ten}</div>
                    <div style={s.profileSub}>{nguoiDung?.email}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        {hoSo?.daXacMinh
                            ? <Badge green>Đã xác minh</Badge>
                            : <Badge warn>Chờ admin duyệt</Badge>
                        }
                        {hoSo?.chuyenKhoa && <Badge>{hoSo.chuyenKhoa}</Badge>}
                    </div>
                </div>
            </div>

            {/* Form chỉnh sửa */}
            <form onSubmit={onSave} style={s.form}>
                <SectionTitle>Thông tin chuyên môn</SectionTitle>

                <div style={s.twoCol}>
                    <Field label="Chuyên khoa *">
                        <select name="chuyenKhoa" value={form.chuyenKhoa} onChange={onChange} style={s.input}>
                            <option value="">— Chọn chuyên khoa —</option>
                            {CHUYEN_KHOA.map(ck => <option key={ck} value={ck}>{ck}</option>)}
                        </select>
                    </Field>
                    <Field label="Số năm kinh nghiệm">
                        <input name="soNamKinhNghiem" type="number" min="0" max="60"
                            value={form.soNamKinhNghiem} onChange={onChange}
                            placeholder="0" style={s.input} />
                    </Field>
                </div>

                <Field label="Bệnh viện / Phòng khám">
                    <input name="benhVien" value={form.benhVien} onChange={onChange}
                        placeholder="VD: Bệnh viện Chợ Rẫy" style={s.input} />
                </Field>

                <Field label="Giới thiệu bản thân">
                    <textarea name="moTa" value={form.moTa} onChange={onChange}
                        placeholder="Mô tả kinh nghiệm, thế mạnh, phương pháp điều trị..."
                        style={{ ...s.input, height: 100, resize: "vertical" }} />
                </Field>

                {msg.text && (
                    <div style={{ ...s.msg, background: msg.ok ? "#ECFDF5" : "#FEF2F2", color: msg.ok ? "#065F46" : "#DC2626" }}>
                        {msg.text}
                    </div>
                )}

                <button type="submit" style={{ ...s.btn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                    {saving ? "Đang lưu..." : hoSo ? "Lưu thay đổi" : "Tạo hồ sơ"}
                </button>
            </form>

            {/* Thống kê nhanh */}
            {hoSo && (
                <div style={s.statsRow}>
                    <StatCard label="Đánh giá" value={hoSo.diemDanhGia > 0 ? `${hoSo.diemDanhGia.toFixed(1)} ★` : "—"} />
                    <StatCard label="Lượt đánh giá" value={hoSo.tongDanhGia} />
                    <StatCard label="Ngày đã đăng ký" value={hoSo.lichLamViec?.length || 0} />
                </div>
            )}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{label}</label>
            {children}
        </div>
    );
}

function SectionTitle({ children }) {
    return <div style={{ fontSize: 13, fontWeight: 600, color: "#111", borderBottom: "0.5px solid #E5E7EB", paddingBottom: 8, marginBottom: 4 }}>{children}</div>;
}

function Badge({ children, green, warn }) {
    const bg = green ? "#D1FAE5" : warn ? "#FEF3C7" : "#F3F4F6";
    const cl = green ? "#065F46" : warn ? "#92400E" : "#374151";
    return <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: cl }}>{children}</span>;
}

function StatCard({ label, value }) {
    return (
        <div style={{ flex: 1, background: "#F8F9FA", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
        </div>
    );
}

const s = {
    wrap:        { maxWidth: 640 },
    center:      { padding: 40, textAlign: "center", color: "#9CA3AF" },
    profileCard: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, marginBottom: 20 },
    bigAvatar:   { width: 52, height: 52, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    profileName: { fontSize: 15, fontWeight: 600, color: "#111" },
    profileSub:  { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    form:        { display: "flex", flexDirection: "column", gap: 14, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "18px 20px", marginBottom: 16 },
    twoCol:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    input:       { height: 36, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#111", width: "100%", boxSizing: "border-box" },
    msg:         { padding: "8px 12px", borderRadius: 8, fontSize: 13 },
    btn:         { height: 38, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "fit-content", padding: "0 20px" },
    statsRow:    { display: "flex", gap: 10 },
};