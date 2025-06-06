import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "ai.bang.vawayai.com";

function AddWeb() {
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_BASE_URL}/get-admin-info`, {
          withCredentials: true,
        });
      } catch (err) {
        setError("Vui lòng đăng nhập để thêm website.");
        setTimeout(() => navigate("/login"), 2000);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleNext = async () => {
    setError("");
    setSuccess("");

    if (!website) {
      setError("Vui lòng nhập URL website.");
      return;
    }

    // Chuẩn hóa websiteUrl
    let formattedUrl = website;
    if (!/^https?:\/\//i.test(website)) {
      formattedUrl = `https://${website}`; // Thêm https:// nếu thiếu giao thức
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-website`,
        { websiteUrl: formattedUrl },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccess("Thêm website thành công! Đang chuyển hướng...");
        // Chuyển hướng tới CustomizeUI.js thay vì ManagePage.js
        setTimeout(() => navigate("/customize_ui"), 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể kết nối đến server. Vui lòng nhập URL đầy đủ (VD: http://localhost:8080/testLib.html)."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", display: "flex" }}>
      <Box
        sx={{
          width: { xs: 0, md: 340 },
          bgcolor: "white",
          p: 3,
          borderRight: "1px solid #e5e7eb",
          display: { xs: "none", md: "block" },
        }}
      >
        <Box textAlign="center" mb={4}>
          <img
            src="https://dashboard.tawk.to/images/onboarding/tawk-logo.svg"
            alt="Logo"
            style={{ height: 40 }}
          />
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: 20 }}
        >
          Trò chuyện trực tiếp
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 14, textAlign: "left" }}>
          Chúng tôi sẽ thiết lập những điều cơ bản để bạn có thể thấy ngay khách
          truy cập vào trang web của mình và cài đặt tiện ích. Đừng lo lắng, có
          nhiều tính năng nâng cao hơn (tất cả đều miễn phí) có thể tùy chỉnh
          trong khu vực quản trị sau khi thiết lập ban đầu. Nếu bạn gặp khó
          khăn, hãy bắt đầu trò chuyện bên dưới:
        </Typography>
        <Box mt={4}>
          <Button variant="outlined" fullWidth sx={{ fontSize: 14 }}>
            Trò chuyện với chúng tôi
          </Button>
        </Box>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: 24 }}
          >
            Địa chỉ trang web của bạn là gì?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "#6b7280" }}>
            Nhập URL đầy đủ, bao gồm giao thức và port nếu dùng localhost (VD: http://localhost:8080/testLib.html).
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

          <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2, mb: 4 }}>
            <TextField
              variant="outlined"
              placeholder="http://localhost:8080/testLib.html"
              fullWidth
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              InputProps={{
                sx: { fontSize: 14, height: 48 },
              }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
              sx={{ fontSize: 14 }}
            />
            <IconButton
              onClick={handleNext}
              sx={{
                bgcolor: "#22c55e",
                color: "white",
                width: 48,
                height: 48,
                borderRadius: "8px",
                "&:hover": { bgcolor: "#16a34a" },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Button
              variant="text"
              sx={{ fontSize: 14 }}
              onClick={() => navigate("/manage_page")} // Quay lại trang quản lý
            >
              Trở lại
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ fontSize: 14 }}
            >
              Kế tiếp
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AddWeb;