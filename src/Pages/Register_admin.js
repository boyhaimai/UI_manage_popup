import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import config from "~/config";

const API_BASE_URL = "https://n8n.vazo.vn/api";
const TURNSTILE_SITE_KEY = "0x4AAAAAABi6UVPGEa0fBRYB"; // Thay bằng Site Key của bạn

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

function Register() {
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    turnstileToken: "", // Thêm trường để lưu token Turnstile
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reShowPassword, setReShowPassword] = useState(false);
  const navigate = useNavigate();

  // Hàm xử lý callback từ Turnstile
  const handleTurnstileSuccess = (token) => {
    setForm({ ...form, turnstileToken: token });
    const _SECURITY_TOKEN = token; // Lưu token vào biến toàn cục
    setErrors({ ...errors, turnstileToken: "" });
  };
  useEffect(() => {
    const container = document.getElementById("turnstile-register");
    if (window.turnstile && container && container.children.length === 0) {
      window.turnstile.render("#turnstile-register", {
        sitekey: TURNSTILE_SITE_KEY,
        callback: handleTurnstileSuccess,
      });
    }

    return () => {
      if (container) container.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự.";
    }
    const phoneRegex = /^0\d{9}$/;
    if (!form.phoneNumber || !phoneRegex.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có đúng 10 số và bắt đầu bằng 0.";
    }
    const strongRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (!strongRegex.test(form.password)) {
      newErrors.password =
        "Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp.";
    }
    if (!form.turnstileToken) {
      newErrors.turnstileToken = "Vui lòng xác minh bạn không phải là bot.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/register-admin`,
        {
          name: form.name,
          phoneNumber: form.phoneNumber,
          password: form.password,
          turnstileToken: form.turnstileToken, // Gửi token Turnstile
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccess("Đăng ký thành công!");
        setTimeout(() => navigate("/add_website"), 1000);
      } else {
        setErrors({ server: response.data.message });
      }
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Không thể kết nối đến server.",
      });
    }
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
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              bgcolor: "#808080",
              fontSize: 40,
            }}
          >
            {form.name?.charAt(0)?.toUpperCase() || "A"}
          </Avatar>
        </Box>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: "bold",
            mb: 3,
            color: "#0F172A",
            textAlign: "center",
          }}
        >
          Đăng ký Admin
        </Typography>

        {errors.server && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {errors.server}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: 13 }}>
            {success}
          </Alert>
        )}
        {errors.turnstileToken && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {errors.turnstileToken}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography sx={{ fontSize: 13, mb: 0.5, color: "#0F172A" }}>
            Tên
          </Typography>
          <TextField
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Nhập tên"
            sx={{ ...inputStyle, mb: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />
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
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Nhập mật khẩu"
            sx={{ ...inputStyle, mb: 2 }}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Typography sx={{ fontSize: 13, mb: 0.5, color: "#0F172A" }}>
            Nhập lại mật khẩu
          </Typography>
          <TextField
            name="confirmPassword"
            type={reShowPassword ? "text" : "password"}
            InputProps={{
              endAdornment:
                form.confirmPassword.length > 0 ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setReShowPassword(!reShowPassword)}
                      edge="end"
                    >
                      {reShowPassword ? (
                        <VisibilityOff sx={{ fontSize: 20 }} />
                      ) : (
                        <Visibility sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                    </InputAdornment>
                ) : null,
            }}
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Nhập lại mật khẩu"
            sx={{ ...inputStyle, mb: 2 }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <div id="turnstile-register" style={{ marginBottom: "16px" }}></div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!form.turnstileToken}
            sx={{
              fontSize: 13,
              bgcolor: "#0F172A",
              "&:hover": { bgcolor: "#1e293b" },
              py: 1.5,
              mb: 2,
            }}
          >
            Đăng ký
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(config.routes.login_admin)}
            sx={{
              fontSize: 13,
              color: "#0F172A",
              borderColor: "#0F172A",
              "&:hover": { borderColor: "#1e293b", bgcolor: "#f8fafc" },
              py: 1.5,
            }}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </form>
        </Box>
    </Box>
  );
}

export default Register;