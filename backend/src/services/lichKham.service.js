import LichKham from "../models/lichKham.model.js";
import BacSi from "../models/bacSi.model.js";
import BenhNhan from "../models/benhNhan.model.js";

const populate = (q) =>
  q
    .populate({
      path: "benhNhanId",
      populate: { path: "nguoiDungId", select: "ten email soDienThoai" },
    })
    .populate({
      path: "bacSiId",
      populate: { path: "nguoiDungId", select: "ten email" },
      select: "nguoiDungId chuyenKhoa benhVien lichLamViec",
    });

// ── Bệnh nhân: đặt lịch ──────────────────────────────────────────────────────
export const datLich = async (nguoiDungId, { bacSiId, ngay, gio, ghiChu }) => {
  // Tìm hoặc tạo hồ sơ bệnh nhân
  let benhNhan = await BenhNhan.findOne({ nguoiDungId });
  if (!benhNhan) benhNhan = await BenhNhan.create({ nguoiDungId });

  // Kiểm tra slot tồn tại và chưa bị đặt
  const bacSi = await BacSi.findById(bacSiId);

  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");

  if (!Array.isArray(bacSi.lichLamViec)) {
    throw new Error("Bác sĩ chưa có lịch làm việc");
  }
  if (!bacSi.daXacMinh) throw new Error("Bác sĩ chưa được xác minh");

  const ngayObj = bacSi.lichLamViec?.find((n) => n.ngay === ngay);

  if (!ngayObj) throw new Error("Bác sĩ không có lịch ngày này");

  const slot = ngayObj.khungGio.find((k) => k.gio === gio);
  if (!slot) throw new Error("Không tìm thấy khung giờ này");
  if (slot.daDat) throw new Error("Khung giờ này đã có người đặt");

  // Đánh dấu slot đã đặt
  slot.daDat = true;
  await bacSi.save();

  // Tạo lịch khám
  const lich = await LichKham.create({
    benhNhanId: benhNhan._id,
    bacSiId,
    ngay,
    gio,
    ghiChu,
  });
  return populate(LichKham.findById(lich._id));
};

// ── Bệnh nhân: lấy danh sách lịch của mình ───────────────────────────────────
export const layLichCuaBenhNhan = async (
  nguoiDungId,
  { trangThai, trang = 1, gioiHan = 10 },
) => {
  const benhNhan = await BenhNhan.findOne({ nguoiDungId });
  if (!benhNhan)
    return { danhSach: [], tongSo: 0, tongTrang: 1, trangHienTai: 1 };

  const filter = { benhNhanId: benhNhan._id };
  if (trangThai) filter.trangThai = trangThai;

  const skip = (Number(trang) - 1) * Number(gioiHan);
  const [danhSach, tongSo] = await Promise.all([
    populate(
      LichKham.find(filter)
        .sort({ ngay: -1, gio: -1 })
        .skip(skip)
        .limit(Number(gioiHan)),
    ),
    LichKham.countDocuments(filter),
  ]);
  return {
    danhSach,
    tongSo,
    tongTrang: Math.ceil(tongSo / Number(gioiHan)),
    trangHienTai: Number(trang),
  };
};

// ── Bệnh nhân: hủy lịch ──────────────────────────────────────────────────────
export const huyLich = async (lichId, nguoiDungId) => {
  const benhNhan = await BenhNhan.findOne({ nguoiDungId });
  if (!benhNhan) throw new Error("Không tìm thấy hồ sơ bệnh nhân");

  const lich = await LichKham.findOne({
    _id: lichId,
    benhNhanId: benhNhan._id,
  });
  if (!lich) throw new Error("Không tìm thấy lịch khám");
  if (["dakham", "dahuy"].includes(lich.trangThai))
    throw new Error("Không thể hủy lịch đã khám hoặc đã hủy");

  // Mở lại slot
  await BacSi.updateOne(
    { _id: lich.bacSiId, "lichLamViec.ngay": lich.ngay },
    { $set: { "lichLamViec.$[ngay].khungGio.$[slot].daDat": false } },
    { arrayFilters: [{ "ngay.ngay": lich.ngay }, { "slot.gio": lich.gio }] },
  );

  lich.trangThai = "dahuy";
  await lich.save();
  return { message: "Đã hủy lịch khám" };
};

// ── Bác sĩ: lấy danh sách lịch hẹn của mình ─────────────────────────────────
export const layLichCuaBacSi = async (
  nguoiDungId,
  { trangThai, tuNgay, denNgay, trang = 1, gioiHan = 20 },
) => {
  const bacSi = await BacSi.findOne({ nguoiDungId });
  if (!bacSi) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const filter = { bacSiId: bacSi._id };
  if (trangThai) filter.trangThai = trangThai;
  if (tuNgay) filter.ngay = { ...filter.ngay, $gte: tuNgay };
  if (denNgay) filter.ngay = { ...filter.ngay, $lte: denNgay };

  const skip = (Number(trang) - 1) * Number(gioiHan);
  const [danhSach, tongSo] = await Promise.all([
    populate(
      LichKham.find(filter)
        .sort({ ngay: 1, gio: 1 })
        .skip(skip)
        .limit(Number(gioiHan)),
    ),
    LichKham.countDocuments(filter),
  ]);
  return {
    danhSach,
    tongSo,
    tongTrang: Math.ceil(tongSo / Number(gioiHan)),
    trangHienTai: Number(trang),
  };
};

// ── Bác sĩ: đổi trạng thái lịch ─────────────────────────────────────────────
export const doiTrangThai = async (lichId, nguoiDungId, trangThaiMoi) => {
  const bacSi = await BacSi.findOne({ nguoiDungId });
  if (!bacSi) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const lich = await LichKham.findOne({ _id: lichId, bacSiId: bacSi._id });
  if (!lich) throw new Error("Không tìm thấy lịch khám");

  const CHUYEN = {
    choduyet: ["daxacnhan", "dahuy"],
    daxacnhan: ["dakham", "dahuy"],
    dakham: [],
    dahuy: [],
  };
  if (!CHUYEN[lich.trangThai].includes(trangThaiMoi))
    throw new Error(
      `Không thể chuyển từ "${lich.trangThai}" sang "${trangThaiMoi}"`,
    );

  if (trangThaiMoi === "dahuy") {
    await BacSi.updateOne(
      { _id: bacSi._id, "lichLamViec.ngay": lich.ngay },
      { $set: { "lichLamViec.$[ngay].khungGio.$[slot].daDat": false } },
      { arrayFilters: [{ "ngay.ngay": lich.ngay }, { "slot.gio": lich.gio }] },
    );
  }
  lich.trangThai = trangThaiMoi;
  await lich.save();
  return populate(LichKham.findById(lich._id));
};

// ── Admin: xem tất cả lịch ───────────────────────────────────────────────────
export const layTatCa = async ({
  trangThai,
  tuNgay,
  denNgay,
  trang = 1,
  gioiHan = 20,
}) => {
  const filter = {};
  if (trangThai) filter.trangThai = trangThai;
  if (tuNgay) filter.ngay = { ...filter.ngay, $gte: tuNgay };
  if (denNgay) filter.ngay = { ...filter.ngay, $lte: denNgay };

  const skip = (Number(trang) - 1) * Number(gioiHan);
  const [danhSach, tongSo] = await Promise.all([
    populate(
      LichKham.find(filter)
        .sort({ ngay: -1, gio: -1 })
        .skip(skip)
        .limit(Number(gioiHan)),
    ),
    LichKham.countDocuments(filter),
  ]);
  return {
    danhSach,
    tongSo,
    tongTrang: Math.ceil(tongSo / Number(gioiHan)),
    trangHienTai: Number(trang),
  };
};

// ── Admin: thống kê nhanh ─────────────────────────────────────────────────────
export const thongKe = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const [tongLich, homNay, choduyet, daxacnhan] = await Promise.all([
    LichKham.countDocuments(),
    LichKham.countDocuments({ ngay: today }),
    LichKham.countDocuments({ trangThai: "choduyet" }),
    LichKham.countDocuments({ trangThai: "daxacnhan" }),
  ]);
  return { tongLich, homNay, choduyet, daxacnhan };
};
