import api from "./axios";

// REST — phòng chat
export const layHoacTaoPhong   = (bacSiNguoiDungId, lichKhamId) =>
    api.post("/chat/phong", { bacSiNguoiDungId, lichKhamId });

export const layDanhSachPhong  = ()         => api.get("/chat/phong");
export const layChiTietPhong   = (phongId)  => api.get(`/chat/phong/${phongId}`);
export const layTinNhan        = (phongId, params) =>
    api.get(`/chat/phong/${phongId}/tin-nhan`, { params });
export const danhDauDaDoc      = (phongId)  => api.patch(`/chat/phong/${phongId}/da-doc`);