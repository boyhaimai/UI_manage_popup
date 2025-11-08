import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Add, Visibility, VisibilityOff } from "@mui/icons-material";
import config from "~/config";
import routes from "~/config/routes";

const API_BASE_URL = " http://localhost:5000";

const inputStyle = {
  "& .MuiInputBase-root": {
    backgroundColor: "#f7f8fa",
    fontSize: 13,
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    color: "#1e1e1e",
  },
  "& .MuiInputLabel-root": {
    fontSize: 13,
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#0F172A" },
    "&.Mui-focused fieldset": { borderColor: "#0F172A" },
  },
  "& .MuiFormHelperText-root": {
    fontSize: 12,
    marginTop: "4px",
    backgroundColor: "transparent",
  },
};

function Login() {
  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-admin-info`, {
          withCredentials: true, // Gửi cookie token
        });
        if (res.data.success && res.data.admin) {
          // ✅ Có session hợp lệ → đi thẳng vào dashboard
          localStorage.setItem("userRole", res.data.admin.role);
          navigate(config.routes.managePage);
        }
      } catch (err) {
        console.log(
          "⛔ Chưa đăng nhập hoặc cookie hết hạn:",
          err.response?.status
        );
        // Không làm gì → user ở lại trang login
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!form.phoneNumber || !phoneRegex.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
    }
    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login-admin`,
        { phoneNumber: form.phoneNumber, password: form.password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setWebsites(response.data.websites);
        localStorage.setItem("userRole", response.data.role); // 👉 lưu role

        if (response.data.websites.length === 0) {
          navigate("/add-web");
        }
      } else {
        setErrors({ server: response.data.message });
        setLoading(false);
      }
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Không thể kết nối đến server.",
      });
      setLoading(false);
    }
  };

  const handleWebsiteSelect = () => {
    if (!selectedWebsite) {
      setErrors({ server: "Vui lòng chọn một website." });
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
          navigate(config.routes.managePage);
        } else {
          setErrors({ server: response.data.message });
        }
      })
      .catch((err) => {
        console.error("Select website error:", err);
        setErrors({
          server:
            err.response?.data?.message || "Không thể kết nối đến server.",
        });
      });
  };

  const handleAddNewWebsite = () => {
    navigate("/add_website");
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
          sx={{
            fontSize: 16,
            fontWeight: "bold",
            mb: 3,
            color: "#0F172A",
            textAlign: "center",
          }}
        >
          Đăng nhập Admin
        </Typography>

        {errors.server && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {errors.server}
          </Alert>
        )}

        {!websites.length ? (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Typography sx={{ fontSize: 13, mb: 0.5, color: "#0F172A" }}>
              Số điện thoại
            </Typography>
            <TextField
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Nhập số điện thoại"
              sx={{ ...inputStyle, mb: 2 }}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
            />
            <Typography sx={{ fontSize: 13, mb: 0.5, color: "#0F172A" }}>
              Mật khẩu
            </Typography>
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment:
                  form.password.length > 0 ? (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 20 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ) : null,
              }}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Nhập mật khẩu"
              sx={{ ...inputStyle, mb: 3 }}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                fontSize: 13,
                bgcolor: "#0F172A",
                "&:hover": { bgcolor: "#1e293b" },
                py: 1.5,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
            </Button>
            <Box
              sx={{
                textAlign: "center",
                color: "#6b7280",
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "15px" }}>Ghi nhớ tôi</Typography>
              <Typography
                sx={{
                  fontSize: "15px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "blue",
                  fontWeight: "bold",
                }}
                onClick={() => navigate("/forget_password")}
              >
                Quên mật khẩu?
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                fontSize: 16,
                color: "#6b7280",
                mt: 3,
                display: "flex",
              }}
            >
              Bạn không có tài khoản?{" "}
              <Link to={routes.register_admin}>
                <Typography
                  sx={{
                    textDecoration: "underline",
                    color: "blue",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Tạo tài khoản miễn phí
                </Typography>
              </Link>
            </Box>
          </form>
        ) : (
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: "bold",
                mb: 3,
                textAlign: "center",
              }}
            >
              Chọn website để quản lý
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontSize: 13 }}>Website</InputLabel>
              <Select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                label="Website"
                sx={{
                  ...inputStyle,
                  "& .MuiSelect-select": { fontSize: 13, py: 1.5 },
                }}
              >
                {websites.map((site) => (
                  <MenuItem
                    key={site.domain}
                    value={site.domain}
                    sx={{ fontSize: 13 }}
                  >
                    {site.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                onClick={handleAddNewWebsite}
                sx={{
                  fontSize: 13,
                  color: "#0F172A",
                  borderColor: "#0F172A",
                  "&:hover": { bgcolor: "#1e293b", color: "#fff" },
                  py: 1.5,
                  width: "55%",
                  textTransform: "none",
                }}
                startIcon={<Add />}
              >
                Thêm website mới
              </Button>
              <Button
                variant="contained"
                onClick={handleWebsiteSelect}
                sx={{
                  fontSize: 13,
                  bgcolor: "#0F172A",
                  "&:hover": { bgcolor: "#1e293b" },
                  py: 1.5,
                  width: "30%",
                  textTransform: "none",
                }}
              >
                Tiếp tục
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Login;
