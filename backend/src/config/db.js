import mongoose from "mongoose"

export const connecDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối database thành công");
        
    } catch (error) {
        console.log("Lỗi khi liên kết", error);
        process.exit(1);
    }
};