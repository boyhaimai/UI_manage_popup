import * as request from "~/utils/request";

export const selectWebsite = async (config_id) => {
  try {
    const res = await request.post("/select-website", { config_id });
    return res;
  } catch (err) {
    console.log("selectWebsite error:", err);
  }
};
