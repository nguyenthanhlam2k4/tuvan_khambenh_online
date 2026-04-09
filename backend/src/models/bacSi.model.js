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
    nguoidungId: {
        type: mongoose.Schema.Types.ObjectId, //id tự sinh
        ref: "NguoiDung", //tham chiếu đến bảng NguoiDung
        required: true
    },
    chuyenKhoa: String,
  soNamKinhNghiem: Number,
  moTa: String,
  hinhAnh: String,

  lichLamViec: [lichSchema]
});

export default mongoose.model("BacSi", bacSiSchema);