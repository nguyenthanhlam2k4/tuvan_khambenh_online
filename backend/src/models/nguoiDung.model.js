import mongoose from "mongoose";

const nguoiDungSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    matKhau: { type: String, required: true, minlength: 6 },
    soDienThoai: { type: String, trim: true },
    ngaySinh: { type: String },
    gioiTinh: { type: String },
    diaChi: { type: String },
    nhomMau: { type: String },
    tienSuBenh: { type: String },
    diUng: { type: String },
    vaiTro: {
      type: String,
      enum: ["benhnhan", "bacsi", "admin"],
      default: "benhnhan",
    },
    daXacThuc: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    ngayTao: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Không trả matKhau & refreshToken khi .toJSON()
nguoiDungSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.matKhau;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model("NguoiDung", nguoiDungSchema);
