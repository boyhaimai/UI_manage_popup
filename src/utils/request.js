// requests.js
import axios from "axios";

const urlOriginal = `http://localhost:5000`;

const request = axios.create({
  baseURL: urlOriginal,
  withCredentials: true, // nếu bạn cần cookie như trong ManagePage
});

// Hàm get chung
export const get = async (path, option) => {
  const response = await request.get(path, option);
  return response.data;
};

// Hàm post chung
export const post = async (path, data, option) => {
  const response = await request.post(path, data, option);
  return response.data;
};

export default request;
