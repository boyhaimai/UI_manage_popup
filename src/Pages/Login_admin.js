import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function Login() {
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!/^\d{10,15}$/.test(form.phone)) {
      setError("Số điện thoại phải có 10-15 chữ số.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/login-admin`, form, {
        withCredentials: true,
      });

      if (response.data.success) {
        setWebsites(response.data.websites);
      } else {
        setError(response.data.message);
        setLoading(false);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến server.");
      }
      setLoading(false);
    }
  };

  const handleWebsiteSelect = () => {
    if (!selectedWebsite) {
      setError("Vui lòng chọn một website.");
      return;
    }
    const selected = websites.find((site) => site.domain === selectedWebsite);
    axios
      .post(
        `${API_BASE_URL}/select-website`,
        { config_id: selected.config_id },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.success) {
          navigate("/config_ui");
        } else {
          setError(response.data.message);
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Không thể kết nối đến server."
        );
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        padding: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "400px",
          width: "100%",
          bgcolor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ fontSize: "14px", fontWeight: "bold", mb: 3, color: "#0F172A" }}
        >
          Đăng nhập Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
            {error}
          </Alert>
        )}

        {!websites.length ? (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Số điện thoại"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
              InputProps={{ style: { fontSize: "14px" } }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ style: { fontSize: "14px" } }}
              InputProps={{ style: { fontSize: "14px" } }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                fontSize: "14px",
                bgcolor: "#0F172A",
                "&:hover": { bgcolor: "#1e293b" },
                py: 1.5,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/register_admin")}
              sx={{
                fontSize: "14px",
                color: "#0F172A",
                borderColor: "#0F172A",
                "&:hover": { borderColor: "#1e293b", bgcolor: "#f8fafc" },
                py: 1.5,
              }}
            >
              Chưa có tài khoản? Đăng ký
            </Button>
          </form>
        ) : (
          <Box>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: "14px", fontWeight: "bold", mb: 3 }}
            >
              Chọn website để cấu hình
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: "14px" }}>Website</InputLabel>
              <Select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                label="Website"
                sx={{ fontSize: "14px", "& .MuiSelect-select": { py: 1.5 } }}
              >
                {websites.map((site) => (
                  <MenuItem
                    key={site.domain}
                    value={site.domain}
                    sx={{ fontSize: "14px" }}
                  >
                    {site.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              onClick={handleWebsiteSelect}
              sx={{
                fontSize: "14px",
                bgcolor: "#0F172A",
                "&:hover": { bgcolor: "#1e293b" },
                py: 1.5,
              }}
            >
              Tiếp tục
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Login;
