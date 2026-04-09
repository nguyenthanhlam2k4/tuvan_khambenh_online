import NguoiDung from "../models/nguoiDung.model.js";

//thêm
export const taoNguoiDung = async (data) => {
   const { email } = data;
   const tonTai = await NguoiDung.findOne({ email })
   if (tonTai) throw new Error("Email đã tồn tại");
   const nguoiDung = await NguoiDung.create(data);
   return nguoiDung;
}

//lấy sách người dùng
export const layDanhSachNguoiDung = async () => {
   return await NguoiDung.find();
}

//lấy sách người dùng theo vai trò
export const layDanhSachNguoiDungTheVaiTro = async (vaiTro, cursor, limit = 10) => {
    const query = { vaiTro };
    if (cursor) query._id = { $gt: cursor }; // lấy những _id lớn hơn cursor cuối

    const danhSach = await NguoiDung.find(query)
        .select("_id ten email")
        .sort({ _id: 1 })
        .limit(limit);

    return {
        danhSach,
        cursorMoi: danhSach.length > 0 ? danhSach[danhSach.length - 1]._id : null,
        conNua: danhSach.length === limit
    };
};

//lấy 1 người
export const layChiTietNguoiDung = async (id) => {
   const nguoiDung = await NguoiDung.findById(id);
   if(!nguoiDung) throw new Error("Không tìm thấy người dùng");
   return nguoiDung;
}

//cập nhật người dùng
export const capNhatNguoiDung = async (id, data) => {
   const nguoiDung = await NguoiDung.findByIdAndUpdate(id, data, {new: true});
   if(!nguoiDung) throw new Error("không tìm thấy người dùng");
   return nguoiDung;
}

//xóa người dùng
export const xoaNguoiDung = async (id, data) => {
   const nguoiDung = await NguoiDung.findByIdAndDelete(id, data);
   if(!nguoiDung) throw new Error("Không tìm thấy người dùng");
   return {message: "Xóa thành công"};
}