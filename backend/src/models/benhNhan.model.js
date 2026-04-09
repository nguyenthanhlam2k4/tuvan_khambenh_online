import mongoose from "mongoose";

const benhNhanSchema = new mongoose.Schema({
  nguoiDungId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NguoiDung",
    required: true
  },
  ngaySinh: Date,
  gioiTinh: String,
  diaChi: String
});

export default mongoose.model("BenhNhan", benhNhanSchema);