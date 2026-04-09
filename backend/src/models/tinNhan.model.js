import mongoose from "mongoose";

const tinNhanSchema = new mongoose.Schema({
  phongChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhongChat"
  },
  nguoiGuiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NguoiDung"
  },
  noiDung: String,
  ngayGui: { type: Date, default: Date.now }
});

export default mongoose.model("TinNhan", tinNhanSchema);    