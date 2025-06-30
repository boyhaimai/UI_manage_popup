import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, Alert, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CustomizeUI/CustomizeUI.module.scss";
import vazoImage from "~/Components/assets/image/vazo.png";
import config from "~/config";

const cx = classNames.bind(styles);

const API_BASE_URL = "http://localhost:5000";

export default function CopyCode() {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [scriptCode, setScriptCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lấy config_id và tạo mã nhúng khi component mount
  useEffect(() => {
    const fetchConfigId = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-selected-config`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success && response.data.config_id) {
          const configId = response.data.config_id;
          const script = `<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v15@main/dist/model_admin_just_chat.js" data-server-url="http://localhost:5000" data-id-config="${configId}" defer></script>`;
          setScriptCode(script);
        } else {
          setError("Không tìm thấy cấu hình. Vui lòng chọn website.");
          setTimeout(() => navigate("/select_website"), 2000);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể kết nối đến server."
        );
      }
    };
    fetchConfigId();
  }, [navigate]);

  const handleCopy = () => {
    if (scriptCode) {
      navigator.clipboard.writeText(scriptCode).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
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
            <button className={cx("chat-toggle")}>
              <img
                className={cx("chat-toggle")}
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
          >
            Trò chuyện với chúng tôi
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={4}>
        <Box
          sx={{
            height: "550px",
            overflowY: "scroll",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
          <Box sx={{ width: "800px", height: "650px", overflow: "hidden" }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: 24 }}
            >
              Tiện ích của bạn đã sẵn sàng!
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: 16 }}
            >
              Sao chép mã này và đặt trước thẻ &lt;/body&gt; trên mọi trang của
              trang web của bạn. Sau khi thêm mã, nhấn "Kế tiếp" để tiếp tục.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                position: "relative",
                "&:hover": {
                  "& .copy-text": {
                    opacity: 1,
                  },
                },
              }}
              onClick={handleCopy}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <TextField
                fullWidth
                multiline
                rows={8}
                value={scriptCode}
                InputProps={{
                  style: { fontFamily: "monospace", fontSize: 14 },
                  readOnly: true,
                }}
                sx={{
                  mb: 3,
                  background: isCopied
                    ? "aqua"
                    : isHovered
                    ? "aqua"
                    : "transparent",
                  transition: "background 0.2s",
                  pointerEvents: "none",
                }}
              />
              <Typography
                className="copy-text"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 14,
                  fontWeight: "bold",
                  opacity: isCopied ? 1 : isHovered ? 1 : 0,
                  transition: "opacity 0.2s",
                  pointerEvents: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "6px 8px",
                  borderRadius: "4px",
                }}
              >
                {isCopied ? "Đã sao chép!" : "Sao chép vào khay nhớ tạm"}
              </Typography>
            </Box>

            <Box mt={4}>
              <Typography variant="h6" sx={{ fontSize: 20 }}>
                Cần hỗ trợ?
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item>
                  <Button
                    variant="outlined"
                    sx={{
                      fontSize: 14,
                      color: "#000000",
                      border: "1px solid #d9dbe4",
                    }}
                  >
                    Gửi hướng dẫn
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    sx={{
                      fontSize: 14,
                      color: "#000000",
                      border: "1px solid #d9dbe4",
                    }}
                  >
                    Đọc hướng dẫn
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    sx={{
                      fontSize: 14,
                      color: "#000000",
                      border: "1px solid #d9dbe4",
                    }}
                  >
                    Đặt cuộc gọi
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box
            sx={{
              marginTop: "-10px",
              marginLeft: "92px",
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              sx={{
                fontSize: 14,
                textTransform: "inherit",
                background: "transparent",
                color: "#000000",
              }}
              onClick={() => navigate("/customize_ui")}
            >
              Trở lại
            </Button>
          </Box>
          <Box sx={{ marginTop: "-10px", marginRight: "92px" }}>
            <Button
              variant="contained"
              color="success"
              sx={{ fontSize: 14, textTransform: "inherit" }}
              onClick={() => navigate(config.routes.managePage)} // Đã thay đổi từ /certificate_website sang /manage_page
            >
              Kế tiếp
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
