import api from "./axios";

// ── Public ────────────────────────────────────────────────────────────────────
// query: { chuyenKhoa, daXacMinh, trang, gioiHan }
export const layDanhSachBacSi   = (query)          => api.get("/bac-si", { params: query });
export const layChiTietBacSi    = (id)             => api.get(`/bac-si/${id}`);
export const layLichTrong       = (id, tuNgay, denNgay) =>
    api.get(`/bac-si/${id}/lich-trong`, { params: { tuNgay, denNgay } });

// ── Bác sĩ (cần đăng nhập) ───────────────────────────────────────────────────
export const layHoSoCaNhan      = ()               => api.get("/bac-si/ho-so/ca-nhan");
export const taoBacSi           = (data)           => api.post("/bac-si", data);
export const capNhatBacSi       = (id, data)       => api.put(`/bac-si/${id}`, data);

// lichTuan: [{ ngay: "2026-04-14", khungGios: ["08:00","09:30","14:00"] }]
export const dangKyLich         = (id, lichTuan)   => api.post(`/bac-si/${id}/lich`, { lichTuan });
export const xoaSlot            = (id, ngay, slotId) => api.delete(`/bac-si/${id}/lich/${ngay}/${slotId}`);
export const xoaNgay            = (id, ngay)       => api.delete(`/bac-si/${id}/lich/${ngay}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const duyetBacSi         = (id, daXacMinh)  => api.patch(`/bac-si/${id}/duyet`, { daXacMinh });
export const xoaBacSi           = (id)             => api.delete(`/bac-si/${id}`);