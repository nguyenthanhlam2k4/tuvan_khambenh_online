import mongoose from "mongoose";

const phongChatSchema = new mongoose.Schema({
  benhNhanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BenhNhan"
  },
  bacSiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BacSi"
  },
  ngayTao: { type: Date, default: Date.now }
});

export default mongoose.model("PhongChat", phongChatSchema);