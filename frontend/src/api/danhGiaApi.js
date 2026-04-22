import api from "./axios";

export const taoDanhGia        = (data)      => api.post("/danh-gia", data);
export const layDanhGiaBacSi   = (bacSiId, params) => api.get(`/danh-gia/bac-si/${bacSiId}`, { params });
export const kiemTraDaDanhGia  = (lichKhamId) => api.get(`/danh-gia/kiem-tra/${lichKhamId}`);