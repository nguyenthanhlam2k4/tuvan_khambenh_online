import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function HoSo() {
    const { nguoiDung } = useAuth();

    const [form, setForm] = useState({
        ten: "",
        soDienThoai: "",
        ngaySinh: "",
        gioiTinh: "",
        diaChi: "",
        nhomMau: "",
        tienSuBenh: "",
        diUng: "",
    });

    const [saving, setSave] = useState(false);
    const [msg, setMsg] = useState({ text: "", ok: true });

    // ✅ LOAD DATA TỪ BACKEND
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/nguoi-dung/${nguoiDung._id}`);
                const u = res.data.data;

                setForm({
                    ten: u.ten || "",
                    soDienThoai: u.soDienThoai || "",
                    ngaySinh: u.ngaySinh || "",
                    gioiTinh: u.gioiTinh || "",
                    diaChi: u.diaChi || "",
                    nhomMau: u.nhomMau || "",
                    tienSuBenh: u.tienSuBenh || "",
                    diUng: u.diUng || "",
                });
            } catch (err) {
                console.log(err);
            }
        };

        if (nguoiDung?._id) fetchData();
    }, [nguoiDung]);

    const onChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ SAVE + UPDATE UI NGAY
    const onSave = async e => {
        e.preventDefault();
        setSave(true);
        setMsg({ text: "", ok: true });

        try {
            const res = await api.put(
                `/nguoi-dung/${nguoiDung._id}`,
                form
            );

            const u = res.data.data;

            // cập nhật lại form ngay
            setForm({
                ten: u.ten || "",
                soDienThoai: u.soDienThoai || "",
                ngaySinh: u.ngaySinh || "",
                gioiTinh: u.gioiTinh || "",
                diaChi: u.diaChi || "",
                nhomMau: u.nhomMau || "",
                tienSuBenh: u.tienSuBenh || "",
                diUng: u.diUng || "",
            });

            setMsg({ text: "Đã lưu thay đổi", ok: true });
        } catch (err) {
            setMsg({
                text: err.response?.data?.message || "Lưu thất bại",
                ok: false,
            });
        } finally {
            setSave(false);
        }
    };

    return (
        <div style={{ maxWidth: 580 }}>
            {/* Profile card */}
            <div style={s.profileCard}>
                <div style={s.avatar}>
                    {form.ten?.[0] || "B"}
                </div>
                <div>
                    {/* ✅ dùng form thay vì nguoiDung */}
                    <div style={s.name}>{form.ten}</div>
                    <div style={s.email}>{nguoiDung?.email}</div>
                    <span style={s.badge}>Bệnh nhân</span>
                </div>
            </div>

            <form onSubmit={onSave}>
                <div style={s.section}>
                    <div style={s.sectionTitle}>Thông tin cơ bản</div>

                    <div style={s.twoCol}>
                        <Field label="Họ và tên">
                            <input
                                name="ten"
                                value={form.ten}
                                onChange={onChange}
                                style={s.input}
                            />
                        </Field>

                        <Field label="Số điện thoại">
                            <input
                                name="soDienThoai"
                                value={form.soDienThoai}
                                onChange={onChange}
                                style={s.input}
                            />
                        </Field>
                    </div>

                    <Field label="Email">
                        <input
                            value={nguoiDung?.email || ""}
                            disabled
                            style={{
                                ...s.input,
                                background: "#F8F9FA",
                                color: "#9CA3AF",
                            }}
                        />
                    </Field>

                    <div style={s.twoCol}>
                        <Field label="Ngày sinh">
                            <input
                                type="date"
                                name="ngaySinh"
                                value={form.ngaySinh}
                                onChange={onChange}
                                style={s.input}
                            />
                        </Field>

                        <Field label="Giới tính">
                            <select
                                name="gioiTinh"
                                value={form.gioiTinh}
                                onChange={onChange}
                                style={s.input}
                            >
                                <option value="">— Chọn —</option>
                                <option value="nam">Nam</option>
                                <option value="nu">Nữ</option>
                                <option value="khac">Khác</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Địa chỉ">
                        <input
                            name="diaChi"
                            value={form.diaChi}
                            onChange={onChange}
                            style={s.input}
                        />
                    </Field>
                </div>

                <div style={s.section}>
                    <div style={s.sectionTitle}>Thông tin y tế</div>

                    <div style={s.twoCol}>
                        <Field label="Nhóm máu">
                            <select
                                name="nhomMau"
                                value={form.nhomMau}
                                onChange={onChange}
                                style={s.input}
                            >
                                <option value="">— Chọn —</option>
                                {[
                                    "A+","A-","B+","B-",
                                    "AB+","AB-","O+","O-"
                                ].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Dị ứng">
                            <input
                                name="diUng"
                                value={form.diUng}
                                onChange={onChange}
                                style={s.input}
                            />
                        </Field>
                    </div>

                    <Field label="Tiền sử bệnh">
                        <textarea
                            name="tienSuBenh"
                            value={form.tienSuBenh}
                            onChange={onChange}
                            style={{ ...s.input, height: 80 }}
                        />
                    </Field>
                </div>

                {msg.text && (
                    <div
                        style={{
                            ...s.msg,
                            background: msg.ok ? "#ECFDF5" : "#FEF2F2",
                            color: msg.ok ? "#065F46" : "#DC2626",
                        }}
                    >
                        {msg.text}
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        ...s.btn,
                        opacity: saving ? 0.7 : 1,
                    }}
                    disabled={saving}
                >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
}
function Field({ label, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                {label}
            </label>
            {children}
        </div>
    );
}
const s = {
    profileCard:  { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, marginBottom: 14 },
    avatar:       { width: 52, height: 52, borderRadius: "50%", background: "#EDE9FE", color: "#6D28D9", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    name:         { fontSize: 15, fontWeight: 600, color: "#111" },
    email:        { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    badge:        { display: "inline-block", marginTop: 6, padding: "2px 8px", background: "#EDE9FE", color: "#6D28D9", borderRadius: 20, fontSize: 11, fontWeight: 500 },
    section:      { background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "16px 18px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 },
    sectionTitle: { fontSize: 13, fontWeight: 600, color: "#111", paddingBottom: 8, borderBottom: "0.5px solid #F3F4F6" },
    twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    input:        { height: 36, border: "0.5px solid #E5E7EB", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#111", width: "100%", boxSizing: "border-box" },
    msg:          { padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 10 },
    btn:          { height: 38, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "0 20px" },
};