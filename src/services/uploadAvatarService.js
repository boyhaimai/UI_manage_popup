import * as request from "~/utils/request";

export const uploadAvatar = async (formData) => {
  try {
    const res = await request.post("/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  } catch (err) {
    console.log("uploadAvatar error:", err);
  }
};
