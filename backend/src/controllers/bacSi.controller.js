import * as bacSiService from "../services/bacSi.service.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
const err = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

// ── CRUD hồ sơ ────────────────────────────────────────────────────────────────

// POST /api/bac-si
// Bác sĩ tự tạo hồ sơ sau khi đăng ký tài khoản
export const taoBacSi = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.nguoiDung);
    const data = await bacSiService.taoBacSi(req.nguoiDung.id, req.body);
    ok(res, data, 201);
  } catch (e) {
    err(res, e.message, 400);
  }
};

// GET /api/bac-si?chuyenKhoa=Tim mạch&daXacMinh=true&trang=1&gioiHan=10
export const layDanhSach = async (req, res) => {
  try {
    const data = await bacSiService.layDanhSach(req.query);
    ok(res, data);
  } catch (e) {
    err(res, e.message);
  }
};

// GET /api/bac-si/ho-so — bác sĩ xem hồ sơ của chính mình
export const layHoSoCaNhan = async (req, res) => {
  try {
    const data = await bacSiService.layHoSoCaNhan(req.nguoiDung.id);
    ok(res, data);
  } catch (e) {
    err(res, e.message, 404);
  }
};

// GET /api/bac-si/:id
export const layChiTiet = async (req, res) => {
  try {
    const data = await bacSiService.layChiTiet(req.params.id);
    ok(res, data);
  } catch (e) {
    err(res, e.message, 404);
  }
};

// PUT /api/bac-si/:id
export const capNhat = async (req, res) => {
  try {
    const data = await bacSiService.capNhat(
      req.params.id,
      req.nguoiDung.id,
      req.nguoiDung.vaiTro,
      req.body,
    );
    ok(res, data);
  } catch (e) {
    const status = e.message.includes("quyền") ? 403 : 400;
    err(res, e.message, status);
  }
};

// DELETE /api/bac-si/:id  (chỉ admin)
export const xoa = async (req, res) => {
  try {
    const data = await bacSiService.xoa(req.params.id);
    ok(res, data);
  } catch (e) {
    err(res, e.message, 404);
  }
};

// PATCH /api/bac-si/:id/duyet  (chỉ admin)
export const duyetBacSi = async (req, res) => {
  try {
    console.log("PARAM ID:", req.params.id);
console.log("BODY:", req.body);
console.log("USER:", req.nguoiDung);
    const { daXacMinh } = req.body;
    const data = await bacSiService.duyetBacSi(req.params.id, daXacMinh);
    ok(res, data);
  } catch (e) {
    err(res, e.message, 400);
  }
};

// ── Lịch làm việc ─────────────────────────────────────────────────────────────

// POST /api/bac-si/:id/lich
// body: { lichTuan: [{ ngay: "2026-04-14", khungGios: ["08:00","09:30"] }] }
export const dangKyLich = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { lichTuan } = req.body;

    if (!Array.isArray(lichTuan) || lichTuan.length === 0) {
      return err(res, "lichTuan phải là mảng không rỗng", 400);
    }

    // Validate format ngày và giờ
    for (const item of lichTuan) {
      if (!item.ngay || !/^\d{4}-\d{2}-\d{2}$/.test(item.ngay)) {
        return err(
          res,
          `Ngày "${item.ngay}" không đúng định dạng YYYY-MM-DD`,
          400,
        );
      }
      if (!Array.isArray(item.khungGio) || item.khungGio.length === 0) {
        return err(res, `Ngày ${item.ngay} cần có ít nhất 1 khung giờ`, 400);
      }
      for (const gio of item.khungGio) {
        if (!/^\d{2}:\d{2}$/.test(gio)) {
          return err(res, `Giờ "${gio}" không đúng định dạng HH:MM`, 400);
        }
      }
    }

    const data = await bacSiService.dangKyLich(req.nguoiDung.id, lichTuan);
    ok(res, data);
  } catch (e) {
    console.error("LOI BACKEND:", err);
    err(res, e.message, 400);
  }
};

// DELETE /api/bac-si/:id/lich/:ngay/:slotId
export const xoaSlot = async (req, res) => {
  try {
    const data = await bacSiService.xoaSlot(
      req.nguoiDung.id,
      req.params.id,
      req.params.ngay,
      req.params.slotId,
    );
    ok(res, data);
  } catch (e) {
    const status = e.message.includes("đã có người đặt") ? 409 : 400;
    err(res, e.message, status);
  }
};

// DELETE /api/bac-si/:id/lich/:ngay
export const xoaNgay = async (req, res) => {
  try {
    const data = await bacSiService.xoaNgay(
      req.nguoiDung.id,
      req.params.id,
      req.params.ngay,
    );
    ok(res, data);
  } catch (e) {
    err(res, e.message, 400);
  }
};

// GET /api/bac-si/:id/lich-trong?tuNgay=2026-04-14&denNgay=2026-04-20
export const layLichTrong = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await bacSiService.layLichTrong(
      req.params.id,
      tuNgay,
      denNgay,
    );
    ok(res, data);
  } catch (e) {
    err(res, e.message, 404);
  }
};
