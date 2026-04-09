import mongoose from "mongoose";

const lichKhamSchema = new mongoose.Schema({
  benhNhanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BenhNhan",
    required: true
  },
  bacSiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BacSi",
    required: true
  },

  ngay: { type: String, required: true },
  gio: { type: String, required: true },

  trangThai: {
    type: String,
    enum: ["choduyet", "daxacnhan", "dakham", "dahuy"],
    default: "choduyet"
  },

  ghiChu: String,
  ngayTao: { type: Date, default: Date.now }
});

// 🔥 chống trùng lịch
lichKhamSchema.index({ bacSiId: 1, ngay: 1, gio: 1 }, { unique: true });

export default mongoose.model("LichKham", lichKhamSchema);