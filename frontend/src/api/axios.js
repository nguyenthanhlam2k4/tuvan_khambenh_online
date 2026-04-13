import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
    withCredentials: true,
});

// Tự gắn token vào mỗi request
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Tự làm mới token khi nhận lỗi 401
let dangLamMoi = false;
let hangDoi = [];

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const config = error.config;
        const het_han = error.response?.status === 401 && error.response?.data?.hetHan;

        if (het_han && !config._daRetry) {
            config._daRetry = true;

            if (dangLamMoi) {
                return new Promise((resolve, reject) => hangDoi.push({ resolve, reject, config }));
            }

            dangLamMoi = true;
            try {
                const res = await api.post("/auth/lam-moi-token");
                const token = res.data.data.accessToken;
                sessionStorage.setItem("accessToken", token);

                hangDoi.forEach(({ resolve, config: c }) => {
                    c.headers.Authorization = `Bearer ${token}`;
                    resolve(api(c));
                });
                hangDoi = [];

                config.headers.Authorization = `Bearer ${token}`;
                return api(config);
            } catch {
                hangDoi.forEach(({ reject }) => reject(error));
                hangDoi = [];
                sessionStorage.removeItem("accessToken");
                window.location.href = "/dang-nhap";
            } finally {
                dangLamMoi = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;