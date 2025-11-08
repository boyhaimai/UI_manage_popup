import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "~/config";
import routes from "~/config/routes";

const API_BASE_URL = "http://localhost:5000"; // Thay đổi theo URL backend của bạn

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

function ForgetPass() {
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    turnstileToken: "", // Thêm trường để lưu token Turnstile
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
    const phoneRegex = /^0\d{9}$/;
    if (!form.phoneNumber || !phoneRegex.test(form.phoneNumber)) {
      newErrors.phoneNumber =
        "Số điện thoại phải có đúng 10 số và bắt đầu bằng 0.";
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {};
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
        <Box sx={{ textAlign: "center", mb: 3 }}></Box>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: "bold",
            mb: 3,
            color: "#0F172A",
            textAlign: "center",
          }}
        >
          Quên mật khẩu?
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            mt: -2,
            mb: 3,
            color: "#0F172A",
            textAlign: "center",
          }}
        >
          Vui lòng nhập thông tin để đặt lại mật khẩu của bạn.
        </Typography>
        <form>
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            // disabled={!form.turnstileToken}
            sx={{
              fontSize: 13,
              bgcolor: "#0F172A",
              "&:hover": { bgcolor: "#1e293b" },
              py: 1.5,
              mb: 2,
            }}
          >
            Quên mật khẩu
          </Button>
          <Box
            sx={{
              textAlign: "center",
              fontSize: 16,
              color: "#6b7280",
              mt: 3,
                justifyContent: "center",
            }}
          >
            <Link to={routes.login_admin}>
              <Typography
                sx={{
                  textDecoration: "underline",
                  color: "blue",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",

                }}
              >
                Quay lại trang đăng nhập
              </Typography>
            </Link>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

export default ForgetPass;
