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

//xem danh sách
export const layDanhSachNguoiDung = async (req, res) => {
    try {
        const data = await nguoiDungService.layDanhSachNguoiDung();
        res.json(data);
    } catch (error) {
        res.status(501).json({message: error.message})
    }

}