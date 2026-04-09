import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connecDB } from "./config/db.js";
import bacSiRouter from "./routers/bacSi.Routers.js";
import nguoiDungRouter from "./routers/nguoiDung.Routers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// connect DB
connecDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/bac-si", bacSiRouter);
app.use("/api/nguoi-dung", nguoiDungRouter);

// test API
app.get("/", (req, res) => {
  res.send("🚀 Server đang chạy...");
});

// start server
app.listen(PORT, () => {
  console.log(`Chạy thành công trên cổng ${PORT}`);
});