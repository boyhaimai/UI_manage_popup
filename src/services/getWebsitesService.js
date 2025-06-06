import * as request from "~/utils/request";

export const getWebsites = async () => {
  try {
    const res = await request.get("/get-websites");
    return res;
  } catch (err) {
    console.log("getWebsites error:", err);
  }
};
