import { useState } from "react";
import SidebarBacSi  from "../../components/bacsi/Sidebar";
import TongQuan      from "./TongQuan";
import LichLamViec   from "./LichLamViec";
import LichHen       from "./LichHen";
import HoSo          from "./HoSoBacSi";

const TRANG = {
    "tong-quan":     TongQuan,
    "lich-lam-viec": LichLamViec,
    "lich-hen":      LichHen,
    "ho-so":         HoSo,
};

const TIEU_DE = {
    "tong-quan":     "Tổng quan",
    "lich-lam-viec": "Lịch làm việc",
    "lich-hen":      "Lịch hẹn",
    "ho-so":         "Hồ sơ cá nhân",
};

export default function BacSiDashboard() {
    const [active, setActive] = useState("tong-quan");
    const Trang = TRANG[active];

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <SidebarBacSi active={active} setActive={setActive} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "10px 24px", borderBottom: "0.5px solid #E5E7EB", background: "#fff", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>Bác sĩ / </span>
                    <strong style={{ fontSize: 14, color: "#111" }}>{TIEU_DE[active]}</strong>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 24, background: "#F8FAFC" }}>
                    <Trang />
                </div>
            </div>
        </div>
    );
}