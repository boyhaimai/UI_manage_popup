import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function Register() {
  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    websiteUrl: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
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
    setSuccess("");
    setScriptCode("");
    setCopySuccess(false);
    if (!/^\d{10,15}$/.test(form.phone)) {
      setError("Số điện thoại phải có 10-15 chữ số.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/register-admin`, form);
      if (response.data.success) {
        setSuccess("Đăng ký thành công!");
        setScriptCode(response.data.scriptCode);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến server.");
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(scriptCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        setError("Không thể sao chép mã. Vui lòng thử lại.");
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
          Đăng ký Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: "14px" }}>
            {success}
          </Alert>
        )}

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
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nhập lại mật khẩu"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ style: { fontSize: "14px" } }}
            InputProps={{ style: { fontSize: "14px" } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="URL Website (e.g., http://example.com)"
            name="websiteUrl"
            value={form.websiteUrl}
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
            sx={{
              fontSize: "14px",
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
            onClick={() => navigate("/login_admin")}
            sx={{
              fontSize: "14px",
              color: "#0F172A",
              borderColor: "#0F172A",
              "&:hover": { borderColor: "#1e293b", bgcolor: "#f8fafc" },
              py: 1.5,
            }}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </form>

        {scriptCode && (
          <Box mt={3}>
            <Typography
              variant="h6"
              sx={{ fontSize: "14px", fontWeight: "bold", mb: 1 }}
            >
              Mã nhúng:
            </Typography>
            <Box sx={{ position: "relative" }}>
              <Box
                component="pre"
                sx={{
                  fontSize: "14px",
                  bgcolor: "#f5f5f5",
                  p: 2,
                  borderRadius: "8px",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {scriptCode}
              </Box>
              <Button
                startIcon={<ContentCopyIcon sx={{ fontSize: "12px !important" }} />}
                onClick={handleCopyCode}
                sx={{
                  fontSize: "14px",
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  color: "#0F172A",
                  bgcolor: "#e5e7eb",
                  "&:hover": { bgcolor: "#d1d5db" },
                  padding: "4px 8px",
                }}
              >
                {copySuccess ? "Đã sao chép!" : "Sao chép"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Register;