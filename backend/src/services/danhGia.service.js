import DanhGia  from "../models/danhGia.model.js";
import BacSi    from "../models/bacSi.model.js";
import BenhNhan from "../models/benhNhan.model.js";
import LichKham from "../models/lichKham.model.js";

// ── Tạo đánh giá ─────────────────────────────────────────────────────────────
export const taoDanhGia = async (nguoiDungId, { lichKhamId, soSao, nhanXet }) => {
    // 1. Lấy lịch khám
    const lich = await LichKham.findById(lichKhamId);
    if (!lich) throw new Error("Không tìm thấy lịch khám");

    // 2. Chỉ đánh giá được khi đã khám xong
    if (lich.trangThai !== "dakham")
        throw new Error("Chỉ có thể đánh giá sau khi đã khám xong");

    // 3. Kiểm tra bệnh nhân là chủ lịch khám
    const benhNhan = await BenhNhan.findOne({ nguoiDungId });
    if (!benhNhan || benhNhan._id.toString() !== lich.benhNhanId.toString())
        throw new Error("Bạn không có quyền đánh giá lịch khám này");

    // 4. Kiểm tra chưa đánh giá lần nào (unique index sẽ bắt nếu duplicate)
    const daCoRoi = await DanhGia.findOne({ lichKhamId });
    if (daCoRoi) throw new Error("Bạn đã đánh giá lịch khám này rồi");

    // 5. Tạo đánh giá
    const danhGia = await DanhGia.create({
        lichKhamId,
        benhNhanId: benhNhan._id,
        bacSiId:    lich.bacSiId,
        soSao:      Number(soSao),
        nhanXet:    nhanXet || "",
    });

    // 6. Tính lại điểm trung bình cho bác sĩ
    await tinhLaiDiemTrungBinh(lich.bacSiId);

    return DanhGia.findById(danhGia._id)
        .populate({ path: "benhNhanId", populate: { path: "nguoiDungId", select: "ten" } });
};

// ── Tính lại điểm trung bình (gọi mỗi khi có đánh giá mới) ──────────────────
const tinhLaiDiemTrungBinh = async (bacSiId) => {
    const ketQua = await DanhGia.aggregate([
        { $match: { bacSiId: bacSiId } },
        { $group: {
            _id:        "$bacSiId",
            trungBinh:  { $avg: "$soSao" },
            tongSo:     { $sum: 1 },
        }},
    ]);

    if (ketQua.length === 0) return;

    const { trungBinh, tongSo } = ketQua[0];
    await BacSi.findByIdAndUpdate(bacSiId, {
        diemDanhGia: Math.round(trungBinh * 10) / 10, // làm tròn 1 chữ số thập phân
        tongDanhGia: tongSo,
    });
};

// ── Lấy đánh giá của 1 bác sĩ ────────────────────────────────────────────────
export const layDanhGiaBacSi = async (bacSiId, { trang = 1, gioiHan = 10 } = {}) => {
    const skip = (Number(trang) - 1) * Number(gioiHan);
    const [danhSach, tongSo] = await Promise.all([
        DanhGia.find({ bacSiId })
            .populate({ path: "benhNhanId", populate: { path: "nguoiDungId", select: "ten" } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(gioiHan)),
        DanhGia.countDocuments({ bacSiId }),
    ]);

    // Thống kê phân bổ sao
    const phanBo = await DanhGia.aggregate([
        { $match: { bacSiId: bacSiId } },
        { $group: { _id: "$soSao", soLuong: { $sum: 1 } } },
        { $sort: { _id: -1 } },
    ]);

    return {
        danhSach,
        tongSo,
        tongTrang: Math.ceil(tongSo / Number(gioiHan)),
        phanBo: [5,4,3,2,1].map(s => ({
            sao:     s,
            soLuong: phanBo.find(p => p._id === s)?.soLuong || 0,
        })),
    };
};

// ── Kiểm tra lịch đã được đánh giá chưa ──────────────────────────────────────
export const kiemTraDaDanhGia = async (lichKhamId) => {
    const dg = await DanhGia.findOne({ lichKhamId });
    return { daDanhGia: !!dg, danhGia: dg || null };
};