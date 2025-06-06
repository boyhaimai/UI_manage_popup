import * as request from "~/utils/request";

export const loginAdmin = async ({ phoneNumber, password }) => {
  try {
    const res = await request.post("/login-admin", {
      phoneNumber,
      password,
    });
    return res;
  } catch (err) {
    console.log("loginAdmin error:", err);
    throw err; // Để component gọi xử lý error cụ thể
  }
};