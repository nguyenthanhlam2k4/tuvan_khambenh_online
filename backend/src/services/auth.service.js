import NguoiDung from "../models/nguoiDung.model.js";
import bcrypt from "bcryptjs";
import {
    taoAccessToken,
    taoRefreshToken,
    xacMinhRefreshToken
} from "../utils/jwt.js";

//đăng ký
export const dangKy = async ({ ten, email, matKhau, soDienThoai, vaiTro }) => {
  //kiểm tra đã có email hay chưa
  const daCoEmail  = await NguoiDung.findOne({ email });
  if (daCoEmail) throw new Error("Email đã được sử dụng");

  //mã hóa mật khẩu trước khi lưu vào database
  const matKhauHash = await bcrypt.hash(matKhau, 12);
  //Tạo tài khoản
  const nguoiDung = await NguoiDung.create({
    ten,
    email,
    matKhau: matKhauHash,
    soDienThoai,
    // Chỉ cho phép benhnhan/bacsi tự đăng ký; admin phải tạo thủ công
    vaiTro: ["benhnhan", "bacsi"].includes(vaiTro) ? vaiTro : "benhnhan",
  });

  return nguoiDung;
};

//đăng nhập
export const dangNhap = async ({ email, matKhau }) => {
  //
  const nguoiDung = await NguoiDung.findOne({ email }).select(
    "+matkhau +refreshToken",
  );
  // NguoiDung.findOne({ email })
  // → Tìm 1 user trong database có email trùng với email nhập vào
  // .select("+matKhau +refreshToken")
  // → Lấy thêm 2 field:
  // matKhau (mật khẩu đã hash)
  // refreshToken
  if (!nguoiDung) throw new Error("Email hoặc mật khẩu không đúng");

  const hopLe = await bcrypt.compare(matKhau, nguoiDung.matKhau);
    // matKhau: mật khẩu user vừa nhập
    // nguoiDung.matKhau: mật khẩu đã hash trong DB
    // bcrypt.compare() sẽ:
    // Hash mật khẩu nhập vào
    // So sánh với hash trong DB
  if (!hopLe) throw new Error("Email hoặc mật khẩu không đúng");

  //DÙNG VỚI JWT
  const payload = {
        id: nguoiDung._id,
        vaiTro: nguoiDung.vaiTro,
    };
    const accessToken  = taoAccessToken(payload);
    const refreshToken = taoRefreshToken(payload);

    // Lưu refreshToken vào DB để có thể revoke sau này
    nguoiDung.refreshToken = refreshToken;
    await nguoiDung.save();
 
    return {
        nguoiDung, // toJSON() đã ẩn matKhau & refreshToken
        accessToken,
        // refreshToken,
    };
};

// LÀM MỚI ACCESS TOKEN
export const lamMoiToken = async (refreshToken) => {
    if (!refreshToken) throw new Error("Không có refresh token");
 
    // Xác minh chữ ký
    let payload;
    try {
        payload = xacMinhRefreshToken(refreshToken);
    } catch {
        throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    }
 
    // Kiểm tra token khớp trong DB (chống dùng token cũ sau logout)
    const nguoiDung = await NguoiDung.findById(payload.id).select("+refreshToken");
    if (!nguoiDung || nguoiDung.refreshToken !== refreshToken) {
        throw new Error("Refresh token đã bị thu hồi");
    }
 
    const newAccessToken  = taoAccessToken({ id: nguoiDung._id, vaiTro: nguoiDung.vaiTro });
    const newRefreshToken = taoRefreshToken({ id: nguoiDung._id, vaiTro: nguoiDung.vaiTro });
 
    // Xoay refreshToken (rotation) — giảm rủi ro bị đánh cắp
    nguoiDung.refreshToken = newRefreshToken;
    await nguoiDung.save();
 
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

//ĐĂNG XUẤT
export const dangXuat = async (nguoiDungId) => {
    await NguoiDung.findByIdAndUpdate(nguoiDungId, {refreshToken: null}) //refreshToken: null: Xóa refresh token khỏi database
}

//lấy thông tin cá nhân
export const layCaNhan = async (id) => {
    const nguoiDung = await NguoiDung.findById(id);
    if (!nguoiDung) throw new Error("Không tìm thấy người dùng");
    return nguoiDung;
};