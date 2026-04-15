import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const VAI_TRO = [
    { value: "benhnhan", label: "Bệnh nhân", moTa: "Tìm bác sĩ và đặt lịch khám" },
    { value: "bacsi",    label: "Bác sĩ",    moTa: "Đăng ký hành nghề, nhận bệnh nhân" },
];

export default function DangKy() {
    const { dangKy } = useAuth();
    const navigate = useNavigate();

    const [form, setForm]     = useState({ ten: "", email: "", matKhau: "", xacNhan: "", soDienThoai: "", vaiTro: "benhnhan" });
    const [loi, setLoi]       = useState({});
    const [loiChung, setLC]   = useState("");
    const [loading, setLoad]  = useState(false);
    const [ok, setOk]         = useState(false);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setLoi({ ...loi, [e.target.name]: "" });
    };

    const validate = () => {
        const e = {};
        if (!form.ten.trim())                           e.ten     = "Vui lòng nhập họ tên";
        if (!form.email)                                e.email   = "Vui lòng nhập email";
        else if (!/\S+@\S+\.\S+/.test(form.email))     e.email   = "Email không hợp lệ";
        if (!form.matKhau)                              e.matKhau = "Vui lòng nhập mật khẩu";
        else if (form.matKhau.length < 6)               e.matKhau = "Tối thiểu 6 ký tự";
        if (form.matKhau !== form.xacNhan)              e.xacNhan = "Mật khẩu không khớp";
        return e;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLC("");
        const errs = validate();
        if (Object.keys(errs).length) { setLoi(errs); return; }
        setLoad(true);
        try {
            await dangKy({ ten: form.ten, email: form.email, matKhau: form.matKhau, soDienThoai: form.soDienThoai, vaiTro: form.vaiTro });
            setOk(true);
        } catch (err) {
            setLC(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoad(false);
        }
    };

    if (ok) return (
        <div style={s.page}>
            <div style={{ ...s.card, textAlign: "center" }}>
                <div style={s.checkIcon}>✓</div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111", margin: "0 0 8px" }}>Đăng ký thành công!</h2>
                <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>
                    Tài khoản <strong>{form.email}</strong> đã được tạo.
                </p>
                <button onClick={() => navigate("/dang-nhap")} style={s.btn}>Đăng nhập ngay</button>
            </div>
        </div>
    );

    return (
        <div style={s.page}>
            <div style={s.card}>
                <Logo />
                <h1 style={s.title}>Tạo tài khoản</h1>
                <p style={s.sub}>Miễn phí, chỉ mất vài giây</p>

                {/* Chọn vai trò */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {VAI_TRO.map((vt) => (
                        <div key={vt.value} onClick={() => setForm({ ...form, vaiTro: vt.value })}
                            style={{ ...s.vaiTroItem, ...(form.vaiTro === vt.value ? s.vaiTroActive : {}) }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{vt.label}</div>
                            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{vt.moTa}</div>
                        </div>
                    ))}
                </div>

                {loiChung && <div style={s.error}>{loiChung}</div>}

                <form onSubmit={onSubmit} style={s.form}>
                    <Field label="Họ và tên" error={loi.ten}>
                        <input name="ten" value={form.ten} onChange={onChange}
                            placeholder="Nguyễn Văn A" style={inp(loi.ten)} autoFocus />
                    </Field>

                    <Field label="Email" error={loi.email}>
                        <input name="email" type="email" value={form.email} onChange={onChange}
                            placeholder="ten@email.com" style={inp(loi.email)} />
                    </Field>

                    <Field label="Số điện thoại">
                        <input name="soDienThoai" value={form.soDienThoai} onChange={onChange}
                            placeholder="09xx xxx xxx (tùy chọn)" style={inp()} />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <Field label="Mật khẩu" error={loi.matKhau}>
                            <input name="matKhau" type="password" value={form.matKhau}
                                onChange={onChange} placeholder="Tối thiểu 6 ký tự" style={inp(loi.matKhau)} />
                        </Field>
                        <Field label="Xác nhận mật khẩu" error={loi.xacNhan}>
                            <input name="xacNhan" type="password" value={form.xacNhan}
                                onChange={onChange} placeholder="Nhập lại" style={inp(loi.xacNhan)} />
                        </Field>
                    </div>

                    <button type="submit" style={{ ...s.btn, opacity: loading ? .7 : 1 }} disabled={loading}>
                        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                    </button>
                </form>

                <p style={s.footer}>
                    Đã có tài khoản? <Link to="/dang-nhap" style={s.link}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

function Logo() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>MediBook</span>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{label}</label>
            {children}
            {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
        </div>
    );
}

const inp = (err) => ({
    height: 40, border: `0.5px solid ${err ? "#FCA5A5" : "#D1D5DB"}`,
    borderRadius: 8, padding: "0 12px", fontSize: 14, color: "#111",
    width: "100%", boxSizing: "border-box",
});

const s = {
    page:       { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 20 },
    card:       { width: "100%", maxWidth: 460, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 16, padding: "32px 32px" },
    title:      { fontSize: 22, fontWeight: 600, color: "#111", margin: "0 0 4px" },
    sub:        { fontSize: 14, color: "#6B7280", margin: "0 0 20px" },
    error:      { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 14 },
    form:       { display: "flex", flexDirection: "column", gap: 14 },
    btn:        { height: 42, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4, width: "100%" },
    vaiTroItem: { border: "0.5px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", cursor: "pointer" },
    vaiTroActive:{ border: "1.5px solid #1D9E75", background: "#F0FDF9" },
    checkIcon:  { width: 52, height: 52, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    footer:     { textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 20 },
    link:       { color: "#1D9E75", textDecoration: "none", fontWeight: 500 },
};