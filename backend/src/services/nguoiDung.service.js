import NguoiDung from "../models/nguoiDung.model.js";

//thêm
 export const taoNguoiDung = async(data) => {
    const nguoiDung = await NguoiDung.create(data);
    return nguoiDung;
 }

 //danh sách người dùng
 export const layDanhSachNguoiDung = async () => {
  return await NguoiDung.find();
 }