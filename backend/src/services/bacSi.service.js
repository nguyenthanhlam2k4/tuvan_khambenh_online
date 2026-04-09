import BacSi from "../models/bacSi.model.js"

//Thêm 
export const taoBacSi = async(data) => {
    const bacSi = await BacSi.create(data);
    return bacSi;
}   