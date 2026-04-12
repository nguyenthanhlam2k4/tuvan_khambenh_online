import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || "access_secret_change_me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_change_me";

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

// Tạo access token (ngắn hạn)
export const taoAccessToken = (payload) =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

// Tạo refresh token (dài hạn)
export const taoRefreshToken = (payload) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

// Xác minh access token — trả payload hoặc throw error
export const xacMinhAccessToken = (token) =>
    jwt.verify(token, ACCESS_SECRET);

// Xác minh refresh token — trả payload hoặc throw error
export const xacMinhRefreshToken = (token) =>
    jwt.verify(token, REFRESH_SECRET);