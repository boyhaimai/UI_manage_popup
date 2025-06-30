import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Chip,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Send, UploadFile } from "@mui/icons-material";
import classNames from "classnames/bind";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import CropAvatarModal from "~/Components/CropAvatarModal";
import vazoImage from "~/Components/assets/image/vazo.png";
import styles from "./CustomizeUI.module.scss";

const cx = classNames.bind(styles);
const API_BASE_URL = "n8n.vazo.vn";

const presetColors = ["#1976d2", "#d32f2f", "#7b1fa2", "#03A84E"];
const defaultConfig = {
  themeColor: "#0abfbc",
  textColor: "#ffffff",
  title: "Trợ lý AI",
  welcomeMessage: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?",
  position: "bottom-right",
  historyEnabled: "true",
  serverUrl: "n8n.vazo.vn",
  webhookUrl: "https://bang.daokhaccu.top/webhook/save_history",
  avatar: "",
};

export default function ChatWidgetSetupUI() {
  const [color, setColor] = useState(defaultConfig.themeColor);
  const [name, setName] = useState(defaultConfig.title);
  const [greeting, setGreeting] = useState(defaultConfig.welcomeMessage);
  const [logo, setLogo] = useState(defaultConfig.avatar);
  const [logoFile, setLogoFile] = useState(null);
  const [logoType, setLogoType] = useState(null);
  const [textColor, setTextColor] = useState(defaultConfig.textColor);
  const [configId, setConfigId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  const navigate = useNavigate();

  // Lấy config_id và cấu hình chi tiết
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // Lấy config_id
        const configResponse = await axios.get(
          `${API_BASE_URL}/get-selected-config`,
          { withCredentials: true }
        );
        let id = configResponse.data.config_id;
        if (!configResponse.data.success || !id) {
          setError("Không tìm thấy cấu hình. Vui lòng chọn website.");
          setTimeout(() => navigate("/select_website"), 2000);
          return;
        }
        setConfigId(id);

        // Lấy cấu hình chi tiết
        const configDetailResponse = await axios.get(
          `${API_BASE_URL}/get-config-by-id?id_config=${id}`,
          { withCredentials: true }
        );
        if (configDetailResponse.data) {
          const config = configDetailResponse.data;
          setColor(config.themeColor || defaultConfig.themeColor);
          setTextColor(config.textColor || defaultConfig.textColor);
          setName(config.title || defaultConfig.title);
          setGreeting(config.welcomeMessage || defaultConfig.welcomeMessage);
          if (config.avatar) {
            const avatarUrl = config.avatar.startsWith("http")
              ? config.avatar
              : `${API_BASE_URL}${config.avatar}`;
            setLogo(avatarUrl);
            setLogoType(config.avatar ? "url" : null);
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể kết nối đến server."
        );
        setTimeout(() => navigate("/select_website"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [navigate]);

  const handleLogoUrlChange = (e) => {
    setLogo(e.target.value);
    setLogoFile(null);
    setLogoType("url");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageForCrop(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedAvatar = (croppedFile) => {
    setLogoFile(croppedFile);
    setLogo(URL.createObjectURL(croppedFile));
    setLogoType("upload");
    setCropModalOpen(false);
  };

  const saveConfig = async (useDefault = false) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id_config", configId || "");
      formData.append(
        "themeColor",
        useDefault ? defaultConfig.themeColor : color
      );
      formData.append(
        "textColor",
        useDefault ? defaultConfig.textColor : textColor
      );
      formData.append("title", useDefault ? defaultConfig.title : name);
      formData.append(
        "welcomeMessage",
        useDefault ? defaultConfig.welcomeMessage : greeting
      );
      formData.append("position", defaultConfig.position);
      formData.append("historyEnabled", defaultConfig.historyEnabled);
      formData.append("serverUrl", defaultConfig.serverUrl);
      formData.append("webhookUrl", defaultConfig.webhookUrl);

      if (!useDefault) {
        if (logoType === "upload" && logoFile) {
          formData.append("avatar", logoFile);
        } else if (logoType === "url" && logo) {
          formData.append("avatar", logo);
        } else {
          formData.append("avatar", defaultConfig.avatar);
        }
      } else {
        formData.append("avatar", defaultConfig.avatar);
      }

      const response = await axios.post(
        `${API_BASE_URL}/save-config`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setSuccess("Lưu cấu hình thành công!");
        return true;
      } else {
        setError(response.data.message);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến server.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    const useDefault =
      !configId ||
      (!logo &&
        !logoFile &&
        name === defaultConfig.title &&
        greeting === defaultConfig.welcomeMessage &&
        color === defaultConfig.themeColor &&
        textColor === defaultConfig.textColor);
    const success = await saveConfig(useDefault);
    if (success) {
      setTimeout(() => navigate("/copy_code"), 1000);
    }
  };

  const handleSkip = async () => {
    const success = await saveConfig(true);
    if (success) {
      navigate("/copy_code");
    }
  };

  return (
    <Box display="flex" minHeight="100vh">
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
      <Box flex={1} p={4}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <CircularProgress sx={{ color: "#0F172A" }} />
          </Box>
        )}
        {!loading && (
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
              <Typography variant="h5" fontSize={24} fontWeight="bold">
                Tùy chỉnh tiện ích cho phù hợp với thương hiệu của bạn:
              </Typography>
              <Typography
                variant="p"
                gutterBottom
                fontSize={15}
                sx={{ color: "#333333" }}
              >
                (bạn có thể thay đổi điều này sau)
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

              <Box display="flex" gap={4}>
                <Box flex={1}>
                  <Box my={2}>
                    <Typography fontWeight="bold" fontSize={16} mb={1}>
                      Ảnh widget
                    </Typography>
                    <Box
                      width={64}
                      height={64}
                      border="1px dashed gray"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius={1}
                      position="relative"
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        document.getElementById("logo-upload").click()
                      }
                    >
                      {logo ? (
                        <Avatar src={logo} sx={{ width: 64, height: 64 }} />
                      ) : (
                        <UploadFile />
                      )}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Box>

                    <TextField
                      label="Dán liên kết ảnh"
                      variant="standard"
                      fullWidth
                      value={logoType === "url" ? logo : ""}
                      onChange={handleLogoUrlChange}
                      sx={{
                        mt: 1,
                        "& .MuiInputBase-input": { fontSize: 14 },
                        "& .MuiInputLabel-root": { fontSize: 14 },
                      }}
                    />
                  </Box>

                  <Box my={2}>
                    <Typography fontWeight="bold" fontSize={16}>
                      Màu sắc cơ bản
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                      my={1}
                    >
                      {presetColors.map((c) => (
                        <Chip
                          key={c}
                          sx={{
                            bgcolor: c,
                            width: 32,
                            height: 32,
                            border: color === c ? "2px solid black" : "none",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: c, // giữ nguyên màu khi hover
                              boxShadow: "none", // loại bỏ shadow nếu có
                              border: color === c ? "2px solid black" : "none", // giữ viền nếu đang chọn
                            },
                          }}
                          onClick={() => setColor(c)}
                        />
                      ))}
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: color,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            document.getElementById("color-picker").click()
                          }
                        />
                        <input
                          id="color-picker"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          style={{
                            position: "absolute",
                            opacity: 0,
                            width: "50px",
                            height: "32px",
                            cursor: "pointer",
                          }}
                        />
                        <TextField
                          variant="standard"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          inputProps={{ style: { fontSize: 14 } }}
                          sx={{ width: 80 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Box my={2}>
                    <Typography fontWeight="bold" fontSize={16}>
                      Màu chữ
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      {["#ffffff", "#000000"].map((preset) => (
                        <Box
                          key={preset}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: preset,
                            border:
                              textColor === preset
                                ? "2px solid black"
                                : "1px solid #ccc",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                          onClick={() => setTextColor(preset)}
                        />
                      ))}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: textColor,
                          border: "1px solid #ccc",
                          cursor: "pointer",
                          position: "relative",
                        }}
                        onClick={() =>
                          document.getElementById("text-color-picker").click()
                        }
                      >
                        <input
                          id="text-color-picker"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            opacity: 0,
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                          }}
                        />
                      </Box>
                      <TextField
                        variant="standard"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        inputProps={{ style: { fontSize: 14 } }}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  </Box>

                  <Box my={2}>
                    <Typography fontWeight="bold" fontSize={16} mb={1}>
                      Tên AI
                    </Typography>
                    <TextField
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={{
                        "& .MuiInputBase-input": { fontSize: 14 },
                      }}
                    />
                  </Box>
                  <Box my={2}>
                    <Typography fontWeight="bold" fontSize={16} mb={1}>
                      Lời chào đầu
                    </Typography>
                    <TextField
                      fullWidth
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      sx={{
                        "& .MuiInputBase-input": { fontSize: 14 },
                      }}
                    />
                  </Box>
                </Box>

                <Box
                  flex={1}
                  sx={{
                    width: "346px",
                    marginTop: "-15px",
                    position: "relative",
                  }}
                >
                  <Paper
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      mx: "auto",
                      border: `1px solid #ccc`,
                      position: "relative",
                      width: "346px",
                      height: "485px",
                    }}
                  >
                    <Box
                      bgcolor={color}
                      color={textColor}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      px={2}
                      py={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={
                            logo ||
                            "https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png"
                          }
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography fontWeight="bold" fontSize={16}>
                          {name}
                        </Typography>
                      </Box>
                      <Typography fontWeight="bold" fontSize={20}>
                        ×
                      </Typography>
                    </Box>

                    <Box px={2} py={1}>
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <Avatar
                          src={
                            logo ||
                            "https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png"
                          }
                          sx={{
                            width: 24,
                            height: 24,
                            border: `1px solid ${color}`,
                            background: `${color}`,
                          }}
                        />
                        <Box
                          bgcolor={color}
                          color={textColor}
                          px={2}
                          py={1}
                          borderRadius={2}
                        >
                          <Typography fontSize={14}>
                            CHÀO! Tôi là một trợ lý AI. Làm thế nào tôi có thể
                            hỗ trợ bạn?
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box position={"absolute"} bottom={0} width="100%">
                      <Box
                        borderTop="1px solid #ddd"
                        px={2}
                        py={1}
                        textAlign="center"
                      >
                        <Typography
                          variant="caption"
                          fontSize={12}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src="https://vaway.vn/uploads/logo-vaway.svg"
                            alt="logo"
                            style={{ height: 12, verticalAlign: "middle" }}
                          />{" "}
                          Tạo bởi{" "}
                          <a
                            href="https://vaway.vn"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#e91e63" }}
                          >
                            vaway.vn
                          </a>
                        </Typography>
                      </Box>

                      <Box
                        px={2}
                        py={1}
                        display="flex"
                        alignItems="center"
                        borderTop="1px solid #ddd"
                        sx={{ width: "100%" }}
                      >
                        <TextField
                          fullWidth
                          placeholder="Nhập tin nhắn..."
                          size="small"
                          disabled
                          InputProps={{
                            sx: {
                              borderRadius: 4,
                              fontSize: 14,
                              border: `1px solid ${color}`,
                            },
                          }}
                        />
                        <IconButton disabled>
                          <Send sx={{ fontSize: 25, color: color, ml: 1 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                  <button
                    className={cx("chat-toggle-btn")}
                    style={{ backgroundColor: color }}
                  >
                    <img
                      src="https://img.icons8.com/ios-filled/50/ffffff/speech-bubble.png"
                      alt="Nút Chat"
                    />
                  </button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box sx={{ marginTop: "-10px", marginRight: "92px" }}>
            <Button
              variant="contained"
              sx={{
                fontSize: 14,
                textTransform: "inherit",
                float: "right",
                background: "transparent",
                color: "#000000",
              }}
              onClick={handleSkip}
              disabled={loading}
            >
              Bỏ qua
            </Button>
          </Box>
          <Box sx={{ marginTop: "-10px", marginRight: "92px" }}>
            <Button
              variant="contained"
              color="success"
              sx={{ fontSize: 14, textTransform: "inherit", float: "right" }}
              onClick={handleSaveConfig}
              disabled={loading}
            >
              {loading ? <CircularProgress size={14} /> : "Kế tiếp"}
            </Button>
          </Box>
        </Box>

        <CropAvatarModal
          open={cropModalOpen}
          image={selectedImageForCrop}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCroppedAvatar}
        />
      </Box>
    </Box>
  );
}
