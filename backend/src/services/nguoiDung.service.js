import NguoiDung from "../models/nguoiDung.model.js";

export const taoNguoiDung = async (data) => {
  const daCoEmail = await NguoiDung.findOne({ email: data.email });
  if (daCoEmail) throw new Error("Email đã được sử dụng");
  return NguoiDung.create(data);
};

export const layDanhSachNguoiDung = async ({
  vaiTro,
  tuKhoa,
  trang = 1,
  gioiHan = 10,
} = {}) => {
  const filter = {};
  if (vaiTro) filter.vaiTro = vaiTro;
  if (tuKhoa) {
    filter.$or = [
      { ten: { $regex: tuKhoa, $options: "i" } },
      { email: { $regex: tuKhoa, $options: "i" } },
    ];
  }
  const skip = (Number(trang) - 1) * Number(gioiHan);
  const [danhSach, tongSo] = await Promise.all([
    NguoiDung.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(gioiHan)),
    NguoiDung.countDocuments(filter),
  ]);
  return {
    danhSach,
    tongSo,
    tongTrang: Math.ceil(tongSo / Number(gioiHan)),
    trangHienTai: Number(trang),
  };
};

export const layChiTietNguoiDung = async (id) => {
  const u = await NguoiDung.findById(id);
  if (!u) throw new Error("Không tìm thấy người dùng");
  return u;
};

// Chỉ cho cập nhật field an toàn, không cho đổi vaiTro/matKhau
export const capNhatNguoiDung = async (id, data, nguoiThucHien = {}) => {
  const FIELDS_PHEP = [
    "ten",
    "soDienThoai",
    "ngaySinh",
    "gioiTinh",
    "diaChi",
    "nhomMau",
    "tienSuBenh",
    "diUng",
  ];
  if (nguoiThucHien.vaiTro === "admin") FIELDS_PHEP.push("vaiTro", "daXacThuc");

  const update = {};
  FIELDS_PHEP.forEach((f) => {
    if (data[f] !== undefined) update[f] = data[f];
  });

  if (Object.keys(update).length === 0)
    throw new Error("Không có thông tin cần cập nhật");

  const u = await NguoiDung.findByIdAndUpdate(id, update, { new: true });
  if (!u) throw new Error("Không tìm thấy người dùng");
  return u;
};

export const xoaNguoiDung = async (id) => {
  const u = await NguoiDung.findByIdAndDelete(id);
  if (!u) throw new Error("Không tìm thấy người dùng");
  return { message: "Đã xoá người dùng" };
};
