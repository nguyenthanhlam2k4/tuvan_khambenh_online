import api from "./axios.js";

export const dangKyAPI = (data) =>
    api.post("/auth/dang-ky", data);

export const dangNhapAPI = (data) =>
    api.post("/auth/dang-nhap", data);

export const lamMoiTokenAPI = () =>
    api.post("/auth/lam-moi-token");

export const dangXuatAPI = () =>
    api.post("/auth/dang-xuat");

export const layCaNhanAPI = () =>
    api.get("/auth/ca-nhan");