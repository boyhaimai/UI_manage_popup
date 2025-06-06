import * as request from "~/utils/request";

export const getSelectedConfig = async () => {
  try {
    const res = await request.get("/get-selected-config");
    return res;
  } catch (err) {
    console.log("getSelectedConfig error:", err);
  }
};
