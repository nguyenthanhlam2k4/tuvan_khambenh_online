import BacSi from "../models/bacSi.model.js";
import NguoiDung from "../models/nguoiDung.model.js";

const populate = (query) =>
  query.populate("nguoiDungId", "ten email soDienThoai");

// ── CRUD hồ sơ ───────────────────────────────────────────────────────────────

export const taoBacSi = async (nguoiDungId, data) => {
  const nguoiDung = await NguoiDung.findById(nguoiDungId);
  if (!nguoiDung) throw new Error("Không tìm thấy tài khoản");
  if (nguoiDung.vaiTro !== "bacsi")
    throw new Error("Tài khoản không phải bác sĩ");
  if (await BacSi.findOne({ nguoiDungId }))
    throw new Error("Đã có hồ sơ bác sĩ");

  const bacSi = await BacSi.create({ nguoiDungId, ...data });
  return populate(BacSi.findById(bacSi._id));
};

export const layDanhSach = async ({
  chuyenKhoa,
  daXacMinh,
  trang = 1,
  gioiHan = 10,
}) => {
  const filter = {};
  if (chuyenKhoa) filter.chuyenKhoa = new RegExp(chuyenKhoa, "i");
  if (daXacMinh !== undefined) filter.daXacMinh = daXacMinh === "true";

  const skip = (Number(trang) - 1) * Number(gioiHan);
  const [danhSach, tongSo] = await Promise.all([
    populate(
      BacSi.find(filter)
        .select("-lichLamViec")
        .sort({ diemDanhGia: -1 })
        .skip(skip)
        .limit(Number(gioiHan)),
    ),
    BacSi.countDocuments(filter),
  ]);

  return {
    danhSach,
    tongSo,
    tongTrang: Math.ceil(tongSo / Number(gioiHan)),
    trangHienTai: Number(trang),
  };
};

export const layChiTiet = async (id) => {
  const bacSi = await populate(BacSi.findById(id));
  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");
  return bacSi;
};

export const layHoSoCaNhan = async (nguoiDungId) => {
  const bacSi = await populate(BacSi.findOne({ nguoiDungId }));
  if (!bacSi) throw new Error("Chưa có hồ sơ bác sĩ");
  return bacSi;
};

export const capNhat = async (id, nguoiDungId, vaiTro, data) => {
  const bacSi = await BacSi.findById(id);
  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");
  if (vaiTro !== "admin" && bacSi.nguoiDungId.toString() !== nguoiDungId) {
    throw new Error("Không có quyền sửa hồ sơ này");
  }
  // Không cho sửa nguoiDungId hay lichLamViec qua endpoint này
  const { nguoiDungId: _, lichLamViec: __, ...safeData } = data;
  return populate(
    BacSi.findByIdAndUpdate(id, safeData, {
      returnDocument: "after",
      runValidators: true,
    }),
  );
};

export const xoa = async (id) => {
  const bacSi = await BacSi.findByIdAndDelete(id);
  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");
  return { message: "Đã xoá hồ sơ bác sĩ" };
};

export const duyetBacSi = async (id, daXacMinh) => {
  const bacSi = await BacSi.findByIdAndUpdate(
    id,
    { daXacMinh },
    { returnDocument: "after" },
  ).populate("nguoiDungId", "ten email");
  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");
  return bacSi;
};

// ── Lịch làm việc ────────────────────────────────────────────────────────────

// Đăng ký lịch cả tuần 1 lần
// body: { lichTuan: [{ ngay: "2026-04-14", khungGios: ["08:00","09:30","14:00"] }] }
export const dangKyLich = async (nguoiDungId, lichTuan) => {
  const bacSi = await BacSi.findOne({ nguoiDungId });
  if (!bacSi) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  for (const { ngay, khungGio } of lichTuan) {
    const cacSlot = (khungGio || []).map((gio) => ({
      gio,
      daDat: false,
    }));

    const viTri = bacSi.lichLamViec.findIndex((n) => n.ngay === ngay);

    if (viTri === -1) {
      bacSi.lichLamViec.push({ ngay, khungGio: cacSlot });
    } else {
      const daCoGio = new Set(
        (bacSi.lichLamViec[viTri].khungGio || []).map((k) => k.gio)
      );

      const moiThem = cacSlot.filter((s) => !daCoGio.has(s.gio));

      bacSi.lichLamViec[viTri].khungGio.push(...moiThem);

      bacSi.lichLamViec[viTri].khungGio.sort((a, b) =>
        a.gio.localeCompare(b.gio)
      );
    }
  }

  bacSi.markModified("lichLamViec");
  await bacSi.save();

  return bacSi.lichLamViec;
};

// Xoá 1 slot cụ thể
export const xoaSlot = async (nguoiDungId, bacSiId, ngay, slotId) => {
  const bacSi = await BacSi.findOne({ _id: bacSiId, nguoiDungId });
  if (!bacSi) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const ngayObj = bacSi.lichLamViec.find((n) => n.ngay === ngay);
  if (!ngayObj) throw new Error("Không tìm thấy ngày này");

  const slot = ngayObj.khungGios.id(slotId);
  if (!slot) throw new Error("Không tìm thấy khung giờ");
  if (slot.daDat) throw new Error("Không thể xoá slot đã có người đặt");

  slot.deleteOne();
  await bacSi.save();
  return { message: "Đã xoá khung giờ" };
};

// Xoá toàn bộ lịch 1 ngày
export const xoaNgay = async (nguoiDungId, bacSiId, ngay) => {
  const bacSi = await BacSi.findOne({ _id: bacSiId, nguoiDungId });
  if (!bacSi) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const truoc = bacSi.lichLamViec.length;
  bacSi.lichLamViec = bacSi.lichLamViec.filter((n) => n.ngay !== ngay);
  if (bacSi.lichLamViec.length === truoc)
    throw new Error("Không tìm thấy ngày này");

  await bacSi.save();
  return { message: `Đã xoá lịch ngày ${ngay}` };
};

// Lấy lịch còn trống (public — bệnh nhân dùng để đặt)
export const layLichTrong = async (bacSiId, tuNgay, denNgay) => {
  const bacSi = await BacSi.findById(bacSiId);

  if (!bacSi) throw new Error("Không tìm thấy bác sĩ");

  console.log("====== RAW DATA ======");
  console.log(JSON.stringify(bacSi.lichLamViec, null, 2));

  const result = (bacSi.lichLamViec || [])
    .filter((item) => {
      const d = item.ngay?.slice(0, 10);
      return d >= tuNgay && d <= denNgay;
    })
    .map((item) => ({
      ngay: item.ngay?.slice(0, 10),
      khungGios: Array.isArray(item.khungGio)
        ? item.khungGio.filter((k) => !k.daDat)
        : [],
    }));

  console.log("====== RESPONSE ======");
  console.log(JSON.stringify(result, null, 2));

  return result;
};
