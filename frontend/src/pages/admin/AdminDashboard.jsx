import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import QuanLyNguoiDung from "./QuanLyNguoiDung";
import QuanLyBacSi from "./QuanLyBacSi";
import TongQuan from "./TongQuan";
import LichKham from "./Lichkham";

function Placeholder({ title }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2 style={{ color: "#111", marginBottom: 8 }}>{title}</h2>
      <p style={{ color: "#9CA3AF", fontSize: 13 }}>Đang xây dựng — Phase 3</p>
    </div>
  );
}

const TRANG = {
  "tong-quan": TongQuan,
  "nguoi-dung": QuanLyNguoiDung,
  "bac-si": QuanLyBacSi,
  "lich-kham": LichKham,
  chat: () => <Placeholder title="Chat & tư vấn" />,
};

const TIEU_DE = {
  "tong-quan": "Tổng quan",
  "nguoi-dung": "Người dùng",
  "bac-si": "Bác sĩ",
  "lich-kham": "Lịch khám",
  chat: "Chat & tư vấn",
};

export default function AdminDashboard() {
  const [active, setActive] = useState("bac-si");

  const Trang = TRANG[active] || (() => <div>Không tìm thấy trang</div>);
//   console.log("active:", active);
//   console.log("TRANG keys:", Object.keys(TRANG));
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar active={active} setActive={setActive} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={s.header}>
          <span style={s.breadcrumb}>
            Admin / <strong style={{ color: "#111" }}>{TIEU_DE[active]}</strong>
          </span>
        </div>

        <div style={s.content}>
          <Trang />
        </div>
      </div>
    </div>
  );
}

const s = {
  header: {
    padding: "10px 20px",
    borderBottom: "0.5px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  breadcrumb: { fontSize: 12, color: "#9CA3AF" },
  content: { flex: 1, overflow: "auto", padding: 20, background: "#F8FAFC" },
};
