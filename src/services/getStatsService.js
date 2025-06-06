import * as request from "~/utils/request";

export const getStats = async (domain) => {
  try {
    const res = await request.get("/get-stats", {
      params: { domain },
    });
    return res;
  } catch (err) {
    console.log("getStats error:", err);
  }
};
