import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function DangNhap() {
    const { dangNhap } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm]   = useState({ email: "", matKhau: "" });
    const [loi, setLoi]     = useState("");
    const [loading, setLoad] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoi("");
        setLoad(true);
        try {
            const user = await dangNhap(form.email, form.matKhau);
            const from = location.state?.from?.pathname;
            const map  = { admin: "/admin", bacsi: "/bac-si", benhnhan: "/benh-nhan" };
            navigate(from || map[user.vaiTro] || "/", { replace: true });
        } catch (err) {
            setLoi(err.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoad(false);
        }
    };

    return (
        <div style={s.page}>
            <div style={s.card}>
                <Logo />
                <h1 style={s.title}>Đăng nhập</h1>
                <p style={s.sub}>Chào mừng bạn trở lại</p>

                {loi && <div style={s.error}>{loi}</div>}

                <form onSubmit={onSubmit} style={s.form}>
                    <Field label="Email">
                        <input name="email" type="email" value={form.email}
                            onChange={onChange} placeholder="ten@email.com"
                            style={s.input} autoFocus required />
                    </Field>

                    <Field label="Mật khẩu">
                        <input name="matKhau" type="password" value={form.matKhau}
                            onChange={onChange} placeholder="••••••••"
                            style={s.input} required />
                    </Field>

                    <button type="submit" style={{ ...s.btn, opacity: loading ? .7 : 1 }} disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <p style={s.footer}>
                    Chưa có tài khoản? <Link to="/dang-ky" style={s.link}>Đăng ký</Link>
                </p>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Logo() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>MediBook</span>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{label}</label>
            {children}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
    page:  { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 20 },
    card:  { width: "100%", maxWidth: 400, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 16, padding: "36px 32px" },
    title: { fontSize: 22, fontWeight: 600, color: "#111", margin: "0 0 4px" },
    sub:   { fontSize: 14, color: "#6B7280", margin: "0 0 24px" },
    error: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 16 },
    form:  { display: "flex", flexDirection: "column", gap: 16 },
    input: { height: 40, border: "0.5px solid #D1D5DB", borderRadius: 8, padding: "0 12px", fontSize: 14, color: "#111", width: "100%", boxSizing: "border-box" },
    btn:   { height: 42, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 },
    footer:{ textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 20 },
    link:  { color: "#1D9E75", textDecoration: "none", fontWeight: 500 },
};