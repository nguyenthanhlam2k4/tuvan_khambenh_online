import express from "express";
import dotenv from "dotenv";
import { connecDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5001
const app = express();

connecDB();

app.listen(PORT, () => {
    console.log(`Chạy thành công trên cổng ${PORT}`);
});

app.get("/api/doctor", (req, res) => {
    res.send("nguyenthanhsa");
});

