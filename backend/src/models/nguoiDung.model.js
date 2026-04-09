import mongoose from "mongoose";

const nguoiDungSchema = new mongoose.Schema({
    ten: {type: String, require: true}, //require: bắt buộc phải có (thiếu là lỗi)
    email: {type: String, require: true, unique: true},  //unique: không được trùng
    matKhau: {type: String, require: true},
    soDienThoai: {type: String},
    vaiTro: {
        type: String,
        enum: ["benhnhan", "bacsi", "admin"], //enum: chỉ cho phép các giá trị trong mảng
        default: "benhnhan" //default: nếu không truyền → tự gán "benhnhan"
    },
    ngayTao: {type: Date, default: Date.now} //Date: kiểu ngày giờ, Date.now: tự lấy thời gian hiện tại
})

export default mongoose.model("NguoiDung", nguoiDungSchema);