import * as nguoiDungService from "../services/nguoiDung.service.js";

//thêm
export const taoNguoiDungController = async (req, res) => {
    try {
        const data = await nguoiDungService.taoNguoiDung(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(501).json({message: error.message})
    }
}

//lấy danh sách tất cả người dùng
export const layDanhSachNguoiDungController = async (req, res) => {
    try {
        const data = await nguoiDungService.layDanhSachNguoiDung();
        res.json(data);
    } catch (error) {
        res.status(501).json({message: error.message})
    }
}
//lấy danh sách tất cả người dùng với vai trò bác sĩ
export const layDanhSachNguoiDungTheoVaiTroController = async (req, res) => {
    try {
        const { vaiTro = "bacsi", cursor, limit = 10 } = req.query;
        const data = await nguoiDungService.layDanhSachNguoiDungTheVaiTro(vaiTro, cursor, Number(limit));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//xem chi tiết người dùng
export const layChiTietNguoiDungController = async (req, res) => {
    try {
        const data = await nguoiDungService.layChiTietNguoiDung(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

//cập nhật người dùng
export const capNhatNguoiDungController = async (req, res) =>{
    try {
        const data = await nguoiDungService.capNhatNguoiDung(req.params.id, req.body);
        res.json(data);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

//xóa người dùng
export const xoaNguoiDungController = async(req, res) => {
    try {
        const data = await nguoiDungService.xoaNguoiDung(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}