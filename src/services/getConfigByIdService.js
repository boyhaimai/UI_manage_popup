import * as request from "~/utils/request";

export const getConfigById = async (id_config) => {
  try {
    const res = await request.get("/get-config-by-id", {
      params: { id_config },
    });
    return res;
  } catch (err) {
    console.log("getConfigById error:", err);
  }
};
