import { useState, useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";

function fmtTime(str) {
    if (!str) return "";
    const d = new Date(str);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

function fmtDate(str) {
    if (!str) return "";
    const d  = new Date(str);
    const today    = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, today))     return "Hôm nay";
    if (sameDay(d, yesterday)) return "Hôm qua";
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export default function ChatBox({ socket, phongId, doiPhuong }) {
    const { nguoiDung } = useAuth();
    const { tinNhans, loading, doiDang, gui, onTyping } = useChat(socket, phongId, nguoiDung?._id);
    const [input, setInput]   = useState("");
    const bottomRef           = useRef(null);
    const inputRef            = useRef(null);

    // Auto scroll xuống cuối
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [tinNhans]);

    const onSend = (e) => {
        e?.preventDefault();
        if (!input.trim()) return;
        gui(input);
        setInput("");
        inputRef.current?.focus();
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // Group tin nhắn theo ngày
    const grouped = tinNhans.reduce((acc, tin) => {
        const label = fmtDate(tin.ngayGui || tin.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(tin);
        return acc;
    }, {});

    if (loading) return (
        <div style={s.loadWrap}>
            <div style={s.spinner} />
        </div>
    );

    return (
        <div style={s.wrap}>
            {/* Messages */}
            <div style={s.messages}>
                {Object.keys(grouped).length === 0 && (
                    <div style={s.empty}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                        <div style={s.emptyTitle}>Bắt đầu cuộc trò chuyện</div>
                        <p style={s.emptySub}>
                            Gửi tin nhắn để bắt đầu tư vấn với {doiPhuong?.ten || "bác sĩ"}
                        </p>
                    </div>
                )}

                {Object.entries(grouped).map(([label, tins]) => (
                    <div key={label}>
                        {/* Nhãn ngày */}
                        <div style={s.dateLabel}><span style={s.dateLabelTxt}>{label}</span></div>

                        {tins.map((tin, i) => {
                            const laMine = tin.nguoiGuiId?._id === nguoiDung?._id ||
                                           tin.nguoiGuiId === nguoiDung?._id;
                            const prev = i > 0 ? tins[i - 1] : null;
                            const sameSender = prev && (
                                (prev.nguoiGuiId?._id || prev.nguoiGuiId) ===
                                (tin.nguoiGuiId?._id  || tin.nguoiGuiId)
                            );

                            return (
                                <div key={tin._id}
                                    style={{ ...s.msgRow, justifyContent: laMine ? "flex-end" : "flex-start",
                                             marginTop: sameSender ? 2 : 10 }}>
                                    {/* Avatar đối phương */}
                                    {!laMine && !sameSender && (
                                        <div style={s.avatar}>
                                            {(tin.nguoiGuiId?.ten || doiPhuong?.ten || "?")[0]}
                                        </div>
                                    )}
                                    {!laMine && sameSender && <div style={s.avatarPlaceholder} />}

                                    <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column",
                                                  alignItems: laMine ? "flex-end" : "flex-start" }}>
                                        {/* Tên người gửi (chỉ hiện lần đầu của cụm) */}
                                        {!laMine && !sameSender && (
                                            <div style={s.senderName}>
                                                {tin.nguoiGuiId?.ten || doiPhuong?.ten}
                                            </div>
                                        )}
                                        <div style={{
                                            ...s.bubble,
                                            ...(laMine ? s.bubbleMine : s.bubbleOther),
                                            borderRadius: laMine
                                                ? (sameSender ? "18px 4px 18px 18px" : "18px 4px 4px 18px")
                                                : (sameSender ? "4px 18px 18px 18px" : "4px 18px 18px 4px"),
                                        }}>
                                            {tin.noiDung}
                                        </div>
                                        {/* Giờ gửi */}
                                        {(!tins[i + 1] || (
                                            (tins[i+1]?.nguoiGuiId?._id || tins[i+1]?.nguoiGuiId) !==
                                            (tin.nguoiGuiId?._id || tin.nguoiGuiId)
                                        )) && (
                                            <div style={s.time}>
                                                {fmtTime(tin.ngayGui || tin.createdAt)}
                                                {laMine && tin.daDoc && " · Đã đọc"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Typing indicator */}
                {doiDang && (
                    <div style={{ ...s.msgRow, justifyContent: "flex-start", marginTop: 8 }}>
                        <div style={s.avatar}>{(doiPhuong?.ten || "?")[0]}</div>
                        <div style={{ ...s.bubble, ...s.bubbleOther, borderRadius: "4px 18px 18px 18px" }}>
                            <div style={s.typingDots}>
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSend} style={s.inputWrap}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); onTyping(); }}
                    onKeyDown={onKeyDown}
                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                    style={s.textarea}
                    rows={1}
                />
                <button type="submit" disabled={!input.trim()} style={{
                    ...s.sendBtn,
                    background: input.trim() ? "#1D9E75" : "#E5E7EB",
                    color: input.trim() ? "#fff" : "#9CA3AF",
                    cursor: input.trim() ? "pointer" : "default",
                }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M15.5 9L2.5 2.5l3 6.5-3 6.5L15.5 9z" fill="currentColor"/>
                    </svg>
                </button>
            </form>

            <style>{`
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: .4 }
                    30% { transform: translateY(-4px); opacity: 1 }
                }
                .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #9CA3AF; display: inline-block; margin: 0 2px; animation: typing 1.2s ease infinite; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
}

const s = {
    wrap:             { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" },
    loadWrap:         { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
    spinner:          { width: 24, height: 24, border: "2px solid #E5E7EB", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin .7s linear infinite" },
    messages:         { flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column" },
    empty:            { textAlign: "center", margin: "auto", padding: "40px 20px" },
    emptyTitle:       { fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 },
    emptySub:         { fontSize: 13, color: "#9CA3AF", lineHeight: 1.5, margin: 0 },
    dateLabel:        { textAlign: "center", margin: "12px 0 8px" },
    dateLabelTxt:     { fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 10px", borderRadius: 20 },
    msgRow:           { display: "flex", alignItems: "flex-end", gap: 7 },
    avatar:           { width: 28, height: 28, borderRadius: "50%", background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarPlaceholder:{ width: 28, flexShrink: 0 },
    senderName:       { fontSize: 11, color: "#9CA3AF", marginBottom: 3, marginLeft: 2 },
    bubble:           { padding: "9px 13px", fontSize: 14, lineHeight: 1.45, wordBreak: "break-word", maxWidth: "100%" },
    bubbleMine:       { background: "#1D9E75", color: "#fff" },
    bubbleOther:      { background: "#F3F4F6", color: "#111" },
    time:             { fontSize: 10, color: "#9CA3AF", margin: "3px 4px 0" },
    typingDots:       { display: "flex", alignItems: "center", gap: 2, padding: "2px 0" },
    inputWrap:        { display: "flex", gap: 8, padding: "12px 16px", borderTop: "0.5px solid #E5E7EB", background: "#fff", flexShrink: 0, alignItems: "flex-end" },
    textarea:         { flex: 1, border: "0.5px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "#111", resize: "none", outline: "none", background: "#fff", fontFamily: "inherit", lineHeight: 1.4, maxHeight: 100, overflowY: "auto" },
    sendBtn:          { width: 40, height: 40, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" },
};