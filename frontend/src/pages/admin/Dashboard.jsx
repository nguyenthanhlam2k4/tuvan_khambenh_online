import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";

// Các trang con — sẽ build từng cái sau
import TongQuan   from "./TongQuan";
import NguoiDung  from "./NguoiDung";
// import UserManagement from "./UserManagement";

const TRANG = {
    "tong-quan":  <TongQuan />,
    "nguoi-dung": <NguoiDung />,
    "bac-si":     <Placeholder title="Quản lý bác sĩ" />,
    "lich-kham":  <Placeholder title="Lịch khám" />,
    "chat":       <Placeholder title="Chat & tư vấn" />,
};

export default function AdminDashboard() {
    const [active, setActive] = useState("tong-quan");

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <Sidebar active={active} setActive={setActive} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header */}
                <div style={s.header}>
                    <span style={s.breadcrumb}>Admin / <strong>{active.replace("-", " ")}</strong></span>
                </div>

                {/* Nội dung trang */}
                <div style={s.content}>
                    {TRANG[active]}
                </div>
            </div>
        </div>
    );
}

function Placeholder({ title }) {
    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <h2 style={{ color: "#111" }}>{title}</h2>
            <p style={{ color: "#9CA3AF", marginTop: 8 }}>Đang xây dựng — Phase 2</p>
        </div>
    );
}

const s = {
    header:     { padding: "10px 20px", borderBottom: "0.5px solid #E5E7EB", display: "flex", alignItems: "center", flexShrink: 0 },
    breadcrumb: { fontSize: 12, color: "#9CA3AF" },
    content:    { flex: 1, overflow: "auto", padding: 20 },
};