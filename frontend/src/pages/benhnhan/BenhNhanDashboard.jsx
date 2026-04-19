import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import SidebarBenhNhan from "../../components/benhnhan/SidebarBenhNhan";
import TongQuan  from "./TongQuan";
import LichKham  from "./LichKham";
import HoSo      from "./HoSo";
import TimBacSi  from "../public/TimBacSi.jsx";
import ChatBenhNhan from "./ChatBenhNhan.jsx";

const TRANG = {
    "tong-quan":  TongQuan,
    "lich-kham":  LichKham,
    "tim-bac-si": TimBacSi,
    "ho-so":      HoSo,
    "chat": ChatBenhNhan,
};
const TIEU_DE = {
    "tong-quan":  "Tổng quan",
    "lich-kham":  "Lịch khám",
    "tim-bac-si": "Tìm bác sĩ",
    "ho-so":      "Hồ sơ cá nhân",
    "chat": "Chat",
};

export default function BenhNhanDashboard() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const tabParam = params.get("tab");
    const [active, setActive] = useState(tabParam || "tong-quan");
    const Trang = TRANG[active] || TongQuan;

    // Thông báo đặt lịch thành công
    const ok = params.get("ok");
    useEffect(() => {
        if (tabParam) setActive(tabParam);
    }, [tabParam]);

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <SidebarBenhNhan active={active} setActive={(k) => {
                setActive(k);
                navigate(`/benh-nhan?tab=${k}`, { replace: true });
            }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "10px 20px", borderBottom: "0.5px solid #E5E7EB", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>Bệnh nhân / </span>
                        <strong style={{ fontSize: 13, color: "#111" }}>{TIEU_DE[active]}</strong>
                    </div>
                    {ok === "1" && active === "lich-kham" && (
                        <div style={{ fontSize: 12, background: "#ECFDF5", color: "#065F46", padding: "4px 12px", borderRadius: 20 }}>
                            Đặt lịch thành công!
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: active === "tim-bac-si" ? 0 : 20, background: "#F8FAFC" }}>
                    <Trang />
                </div>
            </div>
        </div>
    );
}