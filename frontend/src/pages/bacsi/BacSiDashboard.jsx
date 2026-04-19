import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import SidebarBacSi  from "../../components/bacsi/SidebarBacSi";
import TongQuan      from "./TongQuan";
import LichLamViec   from "./LichLamViec";
import LichHen       from "./LichHen";
import Chat          from "./ChatBacSi";
import HoSo          from "./HoSoBacSi";

const TRANG = {
    "tong-quan":     TongQuan,
    "lich-hen":      LichHen,
    "lich-lam-viec": LichLamViec,
    "chat":          Chat,
    "ho-so":         HoSo,
};
const TIEU_DE = {
    "tong-quan":     "Tổng quan",
    "lich-hen":      "Lịch hẹn",
    "lich-lam-viec": "Lịch làm việc",
    "chat":          "Chat & tư vấn",
    "ho-so":         "Hồ sơ cá nhân",
};

const NO_PADDING = ["chat"];

export default function BacSiDashboard() {
    const [params]  = useSearchParams();
    const navigate  = useNavigate();
    const tabParam  = params.get("tab");
    const [active, setActive] = useState(tabParam || "tong-quan");
    const Trang = TRANG[active] || TongQuan;

    useEffect(() => { if (tabParam) setActive(tabParam); }, [tabParam]);

    const goTab = (k) => {
        setActive(k);
        navigate(`/bac-si?tab=${k}`, { replace: true });
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <SidebarBacSi active={active} setActive={goTab} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "10px 24px", borderBottom: "0.5px solid #E5E7EB", background: "#fff", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>Bác sĩ / </span>
                    <strong style={{ fontSize: 14, color: "#111" }}>{TIEU_DE[active]}</strong>
                </div>
                <div style={{ flex: 1, overflow: NO_PADDING.includes(active) ? "hidden" : "auto", padding: NO_PADDING.includes(active) ? 12 : 24, background: "#F8FAFC" }}>
                    <Trang />
                </div>
            </div>
        </div>
    );
}