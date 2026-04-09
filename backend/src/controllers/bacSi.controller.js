import * as bacSiService from "../services/bacSi.service.js";

export const taoBacSiController = async (req, res) => {
    try {
        const data = await bacSiService.taoBacSi(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(501).json({message: error.message});
    }
}