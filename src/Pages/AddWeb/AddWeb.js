import React, { useState, useEffect, useContext } from "react";
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
import vazoImage from "~/Components/assets/image/vazo.png";
import styles from "./AddWeb.module.scss";
import classNames from "classnames/bind";
import config from "~/config";
import { ChatContext } from "~/contexts/OpenPopupAdminContext/OpenPopupAdminContext";
import Header from "~/layout/components/Header/Header";

const cx = classNames.bind(styles);

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function AddWeb() {
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { toggleChat, isChatOpen } = useContext(ChatContext) || {};

  useEffect(() => {
    console.log("AddWeb: isChatOpen =", isChatOpen, "toggleChat =", toggleChat);
    if (!toggleChat) {
      console.error("ChatContext is not provided. Ensure AddWeb is wrapped in ChatProvider.");
    }
  }, [isChatOpen, toggleChat]);

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

    let formattedUrl = website;
    if (!/^https?:\/\//i.test(website)) {
      formattedUrl = `https://${website}`;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-website`,
        { websiteUrl: formattedUrl },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccess("Thêm website thành công! Đang chuyển hướng...");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", display: "flex" }}>
      <Header />
      <Box
        sx={{
          width: "25%",
          bgcolor: "#f0f0f0",
          padding: "24px 50px",
          borderRight: "1px solid #e5e7eb",
          display: { xs: "none", md: "block" },
        }}
      >
        <Box textAlign="center" mb={4}>
          <img src={vazoImage} alt="Logo" style={{ height: 40 }} />
        </Box>
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            maxWidth: 340,
            padding: "20px 25px",
            marginBottom: "32px",
          }}
        >
          <Box>
            <button className={cx("chat-toggle-btn")} onClick={toggleChat}>
              <img
                className={cx("chat-toggle-image")}
                src="https://img.icons8.com/ios-filled/50/ffffff/speech-bubble.png"
                alt="Nút Chat"
              />
            </button>
          </Box>
          <Box className={cx("title_box")}>
            <span>Trò chuyện trực tuyến</span>
            <p>Thêm trò chuyện trực tiếp vào trang web của bạn</p>
          </Box>
        </Paper>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: 20, color: "#000000", margin: "10px 0" }}
        >
          Theo dõi và trò chuyện với khách truy cập trên trang web của bạn
        </Typography>
        <Box sx={{ marginTop: "32px", textAlign: "left" }}>
          <Typography
            variant="body2"
            sx={{ fontSize: 12, marginBottom: "32px" }}
          >
            Hãy để bạn thiết lập với những điều cơ bản, để bạn có thể ngay lập
            tức xem khách truy cập trên trang web của mình và cài đặt widget.
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: 12, marginBottom: "32px" }}
          >
            Đừng lo lắng, có nhiều tính năng nâng cao hơn (tất cả miễn phí) có
            thể được tùy chỉnh trong khu vực quản trị sau khi thiết lập ban đầu.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12 }}>
            Nếu bạn bị mắc kẹt, hãy bắt đầu một cuộc trò chuyện bên dưới:
          </Typography>
        </Box>
        <Box mt={2} sx={{ textAlign: "center", textTransform: "reverse" }}>
          <Button
            variant="contained"
            sx={{ fontSize: 14, color: "#000000", backgroundColor: "#ffffff" }}
            onClick={() => {
              console.log("Trò chuyện với chúng tôi clicked");
              toggleChat();
            }}
          >
            Trò chuyện với chúng tôi
          </Button>
        </Box>
      </Box>

      <Container
        maxWidth="75%"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: 24, margin: "32px" }}
          >
            Địa chỉ trang web của bạn là gì?
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
              placeholder="https://example.com"
              fullWidth
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={handleKeyDown}
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
                width: 40,
                height: 40,
                borderRadius: "8px",
                "&:hover": { bgcolor: "#16a34a" },
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: "25px !important" }} />
            </IconButton>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Button
              variant="text"
              sx={{ fontSize: 13, textTransform: "revert", color: "#000000" }}
              onClick={() => navigate(config.routes.managePage)}
            >
              Trở lại
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ fontSize: 13, textTransform: "revert" }}
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