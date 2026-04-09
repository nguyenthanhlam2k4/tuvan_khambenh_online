import * as bacSiService from "../services/bacSi.service.js";

//thêm
export const taoBacSiController = async (req, res) => {
    try {
        const data = await bacSiService.taoBacSi(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

//lấy danh sách bác sĩ
export const layDanhSachBacSiController = async (req, res) => {
    try {
        const data = await bacSiService.layDanhSachBacSi();
        res.json(data);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

//cập nhật bác sĩ
export const capNhatBacSiController = async(req, res) =>{
    try {
        const data = await bacSiService.capNhatBacSi(req.params.id, req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

//xóa bác sĩ
export const xoaBacSiController = async(req, res) =>{
    try {
        const data = await bacSiService.xoaBacSi(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
