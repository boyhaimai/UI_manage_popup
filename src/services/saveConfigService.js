import * as request from "~/utils/request";

export const saveConfig = async (formData) => {
  try {
    const res = await request.post("/save-config", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  } catch (err) {
    console.log("saveConfig error:", err);
  }
};
