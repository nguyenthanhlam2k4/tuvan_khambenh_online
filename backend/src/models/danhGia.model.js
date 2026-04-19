import mongoose from "mongoose";

const danhGiaSchema = new mongoose.Schema({
    lichKhamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LichKham",
        required: true,
        unique: true,   // 1 lịch chỉ được đánh giá 1 lần
    },
    benhNhanId: { type: mongoose.Schema.Types.ObjectId, ref: "BenhNhan", required: true },
    bacSiId:    { type: mongoose.Schema.Types.ObjectId, ref: "BacSi",    required: true },
    soSao:      { type: Number, required: true, min: 1, max: 5 },
    nhanXet:    { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

export default mongoose.model("DanhGia", danhGiaSchema);