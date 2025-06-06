import * as request from "~/utils/request";

export const registerAdmin = async ({ name, phoneNumber, password }) => {
  try {
    const res = await request.post(
      "/register-admin",
      {
        name,
        phoneNumber,
        password,
      }
    );
    return res;
  } catch (err) {
    console.log("registerAdmin error:", err);
    throw err; // để phía gọi xử lý error cụ thể
  }
};
