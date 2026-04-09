import BacSi from "../models/bacSi.model.js"

// thêm
export const taoBacSi = async (data) => {
    const bacSi = await BacSi.create(data);
    return bacSi;
}   

// lấy danh sách tất cả bác sĩ
export const layDanhSachBacSi = async () => {
    return await BacSi.find();
}

//cập nhật bác sĩ
export const capNhatBacSi = async(id, data) => {
    const bacSi = await BacSi.findByIdAndUpdate(id, data, {new: true});
    if(!bacSi) throw new Error("không tìm thấy bác sĩ để cập nhật");
    return bacSi;
}

//xóa bác sĩ
export const xoaBacSi = async (id) => {
    const bacSi = await BacSi.findByIdAndDelete(id);
    if(!bacSi) throw new Error("Không tìm thấy bác sĩ để xóa");
    return bacSi;
}