import api from "./axios";

// Bệnh nhân
export const datLich            = (data)         => api.post("/lich-kham", data);
export const layLichCuaBenhNhan = (query)        => api.get("/lich-kham/benh-nhan", { params: query });
export const huyLich            = (id)           => api.delete(`/lich-kham/${id}`);

// Bác sĩ
export const layLichCuaBacSi    = (query)        => api.get("/lich-kham/bac-si", { params: query });
export const doiTrangThai       = (id, trangThai) => api.patch(`/lich-kham/${id}/trang-thai`, { trangThai });

// Admin
export const layTatCaLich       = (query)        => api.get("/lich-kham/admin", { params: query });
export const thongKeLich        = ()             => api.get("/lich-kham/admin/thong-ke");