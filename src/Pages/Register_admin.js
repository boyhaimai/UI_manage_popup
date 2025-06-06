import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Avatar,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "ai.bang.vawayai.com";

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
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!form.phoneNumber || !phoneRegex.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp.";
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
          sx={{ fontSize: 16, fontWeight: "bold", mb: 3, color: "#0F172A", textAlign: "center" }}
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
            placeholder="Nhập số điện thoại (VD: +84123456789)"
            sx={{ ...inputStyle, mb: 2 }}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />
          <Typography sx={{ fontSize: 13, mb: 0.5, color: "#0F172A" }}>
            Mật khẩu
          </Typography>
          <TextField
            name="password"
            type="password"
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
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Nhập lại mật khẩu"
            sx={{ ...inputStyle, mb: 2 }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
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
            onClick={() => navigate("/")}
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