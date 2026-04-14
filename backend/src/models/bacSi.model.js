import mongoose from "mongoose";

const lichSchema = new mongoose.Schema({
    ngay: String,
    khungGio: [
        {
            gio: String,
            daDat: {type: Boolean, default: false} //daDat: đã có người đặt chưa
        }
    ]

})

const bacSiSchema = new mongoose.Schema({
    nguoiDungId: {
        type: mongoose.Schema.Types.ObjectId, //id tự sinh
        ref: "NguoiDung", //tham chiếu đến bảng NguoiDung
        required: true
    },
    chuyenKhoa: String,
  soNamKinhNghiem: Number,
  benhVien: String,
  moTa: String,
  hinhAnh: String,
  daXacMinh: {
        type: Boolean,
        default: false
    },

  lichLamViec: [lichSchema]
});

export default mongoose.model("BacSi", bacSiSchema);