import PhongChat from "../models/phongChat.model.js";
import TinNhan   from "../models/tinNhan.model.js";
import BenhNhan  from "../models/benhNhan.model.js";
import BacSi     from "../models/bacSi.model.js";

const populatePhong = (q) =>
    q.populate({ path: "benhNhanId", populate: { path: "nguoiDungId", select: "ten email" } })
     .populate({ path: "bacSiId",    populate: { path: "nguoiDungId", select: "ten email" },
                 select: "nguoiDungId chuyenKhoa" });

// ── Tạo hoặc lấy phòng chat ─────────────────────────────────────────────────
export const layHoacTaoPhong = async (benhNhanNguoiDungId, bacSiNguoiDungId, lichKhamId) => {
    const [benhNhan, bacSi] = await Promise.all([
        BenhNhan.findOne({ nguoiDungId: benhNhanNguoiDungId }),
        BacSi.findOne({ nguoiDungId: bacSiNguoiDungId }),
    ]);
    if (!benhNhan) throw new Error("Không tìm thấy hồ sơ bệnh nhân");
    if (!bacSi)    throw new Error("Không tìm thấy hồ sơ bác sĩ");

    // Tìm phòng đã có
    let phong = await populatePhong(
        PhongChat.findOne({ benhNhanId: benhNhan._id, bacSiId: bacSi._id })
    );

    // Chưa có → tạo mới
    if (!phong) {
        const tao = await PhongChat.create({
            benhNhanId: benhNhan._id,
            bacSiId:    bacSi._id,
            lichKhamId: lichKhamId || null,
        });
        phong = await populatePhong(PhongChat.findById(tao._id));
    }

    return phong;
};

// ── Danh sách phòng chat của người dùng ─────────────────────────────────────
export const layDanhSachPhong = async (nguoiDungId, vaiTro) => {
    let filter = {};

    if (vaiTro === "benhnhan") {
        const benhNhan = await BenhNhan.findOne({ nguoiDungId });
        if (!benhNhan) return [];
        filter.benhNhanId = benhNhan._id;
    } else if (vaiTro === "bacsi") {
        const bacSi = await BacSi.findOne({ nguoiDungId });
        if (!bacSi) return [];
        filter.bacSiId = bacSi._id;
    }
    // admin thấy tất cả

    return populatePhong(
        PhongChat.find(filter).sort({ thoiGianCuoi: -1, createdAt: -1 })
    );
};

// ── Lấy lịch sử tin nhắn ────────────────────────────────────────────────────
export const layTinNhan = async (phongId, { trang = 1, gioiHan = 30 } = {}) => {
    const skip = (Number(trang) - 1) * Number(gioiHan);
    const [danhSach, tongSo] = await Promise.all([
        TinNhan.find({ phongChatId: phongId })
            .populate("nguoiGuiId", "ten vaiTro")
            .sort({ ngayGui: -1 }) // mới nhất trước
            .skip(skip)
            .limit(Number(gioiHan)),
        TinNhan.countDocuments({ phongChatId: phongId }),
    ]);
    return {
        danhSach: danhSach.reverse(), // đảo lại để UI render từ cũ → mới
        tongSo,
        tongTrang: Math.ceil(tongSo / Number(gioiHan)),
        trangHienTai: Number(trang),
    };
};

// ── Gửi tin nhắn (dùng nội bộ bởi Socket handler) ───────────────────────────
export const luuTinNhan = async (phongId, nguoiGuiId, noiDung) => {
    const [tin, phong] = await Promise.all([
        TinNhan.create({ phongChatId: phongId, nguoiGuiId, noiDung }),
        PhongChat.findById(phongId).populate([
            { path: "benhNhanId", populate: { path: "nguoiDungId", select: "_id" } },
            { path: "bacSiId",    populate: { path: "nguoiDungId", select: "_id" } },
        ]),
    ]);

    if (!phong) throw new Error("Không tìm thấy phòng chat");

    // Cập nhật preview + tăng badge chưa đọc cho bên nhận
    const laBenhNhan = phong.benhNhanId?.nguoiDungId?._id?.toString() === nguoiGuiId.toString();
    const update = {
        tinNhanCuoi:  noiDung,
        thoiGianCuoi: new Date(),
    };
    if (laBenhNhan) update.$inc = { chuaDocBacSi: 1 };
    else            update.$inc = { chuaDocBenhNhan: 1 };

    await PhongChat.findByIdAndUpdate(phongId, update);

    // Populate người gửi để trả về client
    return TinNhan.findById(tin._id).populate("nguoiGuiId", "ten vaiTro");
};

// ── Đánh dấu đã đọc ─────────────────────────────────────────────────────────
export const danhDauDaDoc = async (phongId, nguoiDungId, vaiTro) => {
    // Đánh dấu tất cả tin nhắn chưa đọc trong phòng (từ đối phương gửi)
    await TinNhan.updateMany(
        { phongChatId: phongId, nguoiGuiId: { $ne: nguoiDungId }, daDoc: false },
        { daDoc: true }
    );

    // Reset counter badge
    const resetField = vaiTro === "benhnhan" ? { chuaDocBenhNhan: 0 } : { chuaDocBacSi: 0 };
    await PhongChat.findByIdAndUpdate(phongId, resetField);

    return { ok: true };
};

// ── Chi tiết phòng chat ──────────────────────────────────────────────────────
export const layChiTietPhong = async (phongId) => {
    const phong = await populatePhong(PhongChat.findById(phongId));
    if (!phong) throw new Error("Không tìm thấy phòng chat");
    return phong;
};