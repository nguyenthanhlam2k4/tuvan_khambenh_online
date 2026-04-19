import { useAuth } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";

const MENU = [
    { key: "tong-quan",     label: "Tổng quan",     Icon: IconGrid   },
    { key: "lich-hen",      label: "Lịch hẹn",      Icon: IconCal    },
    { key: "lich-lam-viec", label: "Lịch làm việc", Icon: IconClock  },
    { key: "chat",          label: "Chat",           Icon: IconChat, badge: true },
    { key: "ho-so",         label: "Hồ sơ",         Icon: IconUser   },
];

export default function SidebarBacSi({ active, setActive, chatBadge = 0 }) {
    const { nguoiDung, dangXuat } = useAuth();
    const { connected }           = useSocketContext();

    return (
        <div style={s.wrap}>
            <div style={s.logo}>
                <div style={s.dot} />
                <span style={s.logoText}>MediBook</span>
                <span style={s.logoSub}>Bác sĩ</span>
                {connected && <div style={s.socketDot} title="Socket đang kết nối" />}
            </div>
            <div style={s.userCard}>
                <div style={s.avatar}>{nguoiDung?.ten?.[0] || "B"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.userName}>{nguoiDung?.ten}</div>
                    <div style={s.userSub}>Bác sĩ</div>
                </div>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {MENU.map(({ key, label, Icon, badge }) => {
                    const on = active === key;
                    return (
                        <button key={key} onClick={() => setActive(key)}
                            style={{ ...s.item, ...(on ? s.on : {}) }}>
                            <div style={{ ...s.iconWrap, ...(on ? s.iconOn : {}) }}><Icon /></div>
                            <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                            {badge && chatBadge > 0 && (
                                <div style={s.badge}>{chatBadge > 9 ? "9+" : chatBadge}</div>
                            )}
                            {on && !badge && <div style={s.dot2} />}
                        </button>
                    );
                })}
            </nav>
            <div style={{ flex: 1 }} />
            <button onClick={dangXuat} style={s.logout}><IconLogout /><span>Đăng xuất</span></button>
        </div>
    );
}

function IconGrid()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="currentColor"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1" fill="currentColor"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor"/></svg>; }
function IconCal()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1"/><path d="M4 1v3M9 1v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M1 5.5h11" stroke="currentColor" strokeWidth="1"/><rect x="3.5" y="7.5" width="2" height="2" rx=".5" fill="currentColor"/><rect x="7.5" y="7.5" width="2" height="2" rx=".5" fill="currentColor"/></svg>; }
function IconClock()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/><path d="M6.5 3.5v3l2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>; }
function IconChat()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5h10a1 1 0 011 1v6a1 1 0 01-1 1H4.5l-3 2.5V2.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>; }
function IconUser()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1"/><path d="M1.5 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1"/></svg>; }
function IconLogout() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2H2.5A1.5 1.5 0 001 3.5v6A1.5 1.5 0 002.5 11H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M9 9.5l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

const s = {
    wrap:      { width: 196, minWidth: 196, background: "#F8F9FA", borderRight: "0.5px solid #E5E7EB", display: "flex", flexDirection: "column", padding: "16px 10px" },
    logo:      { display: "flex", alignItems: "center", gap: 6, padding: "0 4px 14px", borderBottom: "0.5px solid #E5E7EB", marginBottom: 12 },
    dot:       { width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" },
    logoText:  { fontSize: 13, fontWeight: 600, color: "#111" },
    logoSub:   { fontSize: 10, color: "#9CA3AF", marginLeft: 2 },
    socketDot: { width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", marginLeft: "auto", boxShadow: "0 0 0 2px #D1FAE5" },
    userCard:  { display: "flex", alignItems: "center", gap: 8, padding: 8, background: "#fff", border: "0.5px solid #E5E7EB", borderRadius: 8, marginBottom: 12 },
    avatar:    { width: 30, height: 30, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    userName:  { fontSize: 12, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    userSub:   { fontSize: 10, color: "#9CA3AF" },
    item:      { display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, border: "none", background: "transparent", fontSize: 12, color: "#6B7280", cursor: "pointer", width: "100%" },
    on:        { background: "#fff", color: "#111", fontWeight: 500 },
    iconWrap:  { width: 22, height: 22, borderRadius: 6, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 },
    iconOn:    { background: "#D1FAE5", color: "#065F46" },
    dot2:      { width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 },
    badge:     { minWidth: 16, height: 16, borderRadius: 8, background: "#E24B4A", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
    logout:    { display: "flex", alignItems: "center", gap: 8, width: "100%", height: 34, padding: "0 8px", border: "0.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 12, color: "#6B7280", cursor: "pointer" },
};