import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  IconButton,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { Add, Save } from "@mui/icons-material";
import classNames from "classnames/bind";
import styles from "./ManagePage.module.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "~/Components/Avatar/Avatar";
import useDebounce from "~/hooks/useDebounce";

const cx = classNames.bind(styles);
const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

const inputStyle = {
  backgroundColor: "#f7f8fa",
  color: "#1e1e1e",
  fontSize: 13,
};

// Mảng cấu hình cho các vị trí của tiện ích
const positionOptions = [
  { name: "Trên cùng bên trái", value: "top-left", activeIndex: 0 },
  { name: "Trên cùng bên phải", value: "top-right", activeIndex: 2 },
  { name: "Dưới cùng bên trái", value: "bottom-left", activeIndex: 9 },
  { name: "Dưới cùng bên phải", value: "bottom-right", activeIndex: 11 },
];

function ManagePage() {
  const [form, setForm] = useState({
    webhookUrl: "",
    serverUrl: "",
    historyEnabled: "true",
    themeColor: "#0abfbc",
    textColor: "#ffffff",
    title: "",
    avatar: "",
    welcomeMessage: "",
    position: "bottom-right", // Giá trị mặc định
    linkContact: "",
  });
  const [stats, setStats] = useState({ total: 0, today: 0, month: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [colorError, setColorError] = useState("");
  const [textColorError, setTextColorError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [id_config, setIdConfig] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const navigate = useNavigate();
  const wrapperRef = useRef();
  const headerRef = useRef();
  const fileInputRef = useRef();

  const debouncedThemeColor = useDebounce({
    value: form.themeColor,
    delay: 500,
  });
  const debouncedTextColor = useDebounce({ value: form.textColor, delay: 500 });

  const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
    try {
      const cleanUrl = new URL(url).pathname; // chỉ lấy phần path, bỏ query
      return imageExtensions.test(cleanUrl);
    } catch {
      return false;
    }
  };

  const fetchConfigAndStats = async () => {
    try {
      setFetchLoading(true);
      const websiteResponse = await axios.get(`${API_BASE_URL}/get-websites`, {
        withCredentials: true,
      });
      if (websiteResponse.data.success && websiteResponse.data.websites) {
        setWebsites(websiteResponse.data.websites);
      } else {
        setError("Không tìm thấy danh sách website.");
        navigate("/");
        return;
      }

      const configResponse = await axios.get(
        `${API_BASE_URL}/get-selected-config`,
        {
          withCredentials: true,
        }
      );
      if (configResponse.data.success && configResponse.data.config_id) {
        setIdConfig(configResponse.data.config_id);
        const selectedSite = websiteResponse.data.websites.find(
          (w) => w.config_id === configResponse.data.config_id
        );
        if (selectedSite) {
          setSelectedWebsite(selectedSite.domain);
          setCurrentDomain(selectedSite.domain);
        }
      } else {
        setError("Không tìm thấy config_id. Vui lòng chọn website.");
        navigate("/");
        return;
      }

      const configDataResponse = await axios.get(
        `${API_BASE_URL}/get-config-by-id?id_config=${configResponse.data.config_id}`,
        { withCredentials: true }
      );
      if (configDataResponse.data) {
        const config = configDataResponse.data;
        setForm({
          ...form,
          ...config,
          historyEnabled: config.historyEnabled ? "true" : "false",
        });
      } else {
        setError("Không thể tải cấu hình từ server.");
      }

      const statsResponse = await axios.get(
        `${API_BASE_URL}/get-stats?domain=${encodeURIComponent(
          websiteResponse.data.websites.find(
            (w) => w.config_id === configResponse.data.config_id
          ).domain
        )}`,
        { withCredentials: true }
      );
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      } else {
        setError("Không thể lấy thống kê cho domain này.");
      }
    } catch (err) {
      console.error("Fetch config/stats error:", err);
      setError(err.response?.data?.message || "Không thể kết nối đến server.");
      navigate("/");
    } finally {
      setFetchLoading(false);
      setLoadingWebsite(false);
    }
  };

  useEffect(() => {
    fetchConfigAndStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(debouncedThemeColor)) {
      setForm((prev) => ({ ...prev, themeColor: debouncedThemeColor }));
      setColorError("");
    } else if (debouncedThemeColor) {
      setColorError("Mã màu phải có định dạng #RRGGBB (ví dụ: #ffffff)");
    }
  }, [debouncedThemeColor]);

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(debouncedTextColor)) {
      setForm((prev) => ({ ...prev, textColor: debouncedTextColor }));
      setTextColorError("");
    } else if (debouncedTextColor) {
      setTextColorError("Mã màu phải có định dạng #RRGGBB (ví dụ: #ffffff)");
    }
  }, [debouncedTextColor]);

  const handleWebsiteChange = (event) => {
    const newDomain = event.target.value;
    const selectedSite = websites.find((w) => w.domain === newDomain);
    if (selectedSite) {
      setLoadingWebsite(true);
      axios
        .post(
          `${API_BASE_URL}/select-website`,
          { config_id: selectedSite.config_id },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.success) {
            setSelectedWebsite(newDomain);
            setIdConfig(selectedSite.config_id);
            setCurrentDomain(newDomain);
            fetchConfigAndStats();
          } else {
            setError(response.data.message);
          }
        })
        .catch((err) => {
          setError(
            err.response?.data?.message || "Không thể kết nối đến server."
          );
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "avatar") {
      setAvatarFile(null); // Xóa file đã chọn nếu nhập URL
      setAvatarError("");
      if (value && !isValidImageUrl(value)) {
        setAvatarError(
          "URL không phải là link ảnh hợp lệ (jpg, png, gif, webp)."
        );
      }
    }
  };
  
  // Hàm xử lý khi thay đổi vị trí
  const handlePositionChange = (value) => {
    setForm({ ...form, position: value });
  };

  const handleHistoryToggle = () => {
    setForm({
      ...form,
      historyEnabled: form.historyEnabled === "true" ? "false" : "true",
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarError("");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload-avatar`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setForm({ ...form, avatar: response.data.url });
        setError("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi upload ảnh.");
    }
  };

  const handleCopy = () => {
    const code = `<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v3@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopySuccess(true);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        setError("Không thể sao chép mã.");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);

    if (colorError || textColorError) {
      setError("Vui lòng nhập mã màu hợp lệ trước khi lưu.");
      return;
    }

    if (avatarError) {
      setError("Vui lòng nhập URL ảnh hợp lệ hoặc chọn file ảnh.");
      return;
    }

    if (!id_config) {
      setError("Không tìm thấy config_id. Vui lòng chọn website.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id_config", id_config);
      formData.append("themeColor", form.themeColor);
      formData.append("textColor", form.textColor);
      formData.append("title", form.title);
      formData.append("welcomeMessage", form.welcomeMessage);
      formData.append("position", form.position);
      formData.append("historyEnabled", form.historyEnabled);
      formData.append("serverUrl", form.serverUrl);
      formData.append("webhookUrl", form.webhookUrl);
      formData.append("linkContact", form.linkContact);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else {
        formData.append("avatar", form.avatar);
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
        setSaveSuccess(true);
        setForm({
          ...form,
          ...response.data.config,
          historyEnabled: response.data.config?.historyEnabled
            ? "true"
            : "false",
        });
        setAvatarFile(null);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Save config error:", err);
      setError(err.response?.data?.message || "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
    setSaveSuccess(false);
  };

  useEffect(() => {
    const resizeHeader = () => {
      if (wrapperRef.current && headerRef.current) {
        const wrapper = wrapperRef.current;
        const header = headerRef.current;
        header.style.width = `${wrapper.offsetWidth}px`;
        header.style.left = `${wrapper.getBoundingClientRect().left}px`;
      }
    };
    resizeHeader();
    window.addEventListener("resize", resizeHeader);
    return () => window.removeEventListener("resize", resizeHeader);
  }, []);

  return (
    <div className={cx("wrapper")} ref={wrapperRef}>
      <Box className={cx("title_header")} ref={headerRef}>
        <Box>
          <div>Tổng quan</div>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => navigate("/add_website")} // Điều hướng tới trang thêm website
            sx={{
              fontSize: "14px",
              textTransform: "none",
              borderColor: "#0F172A",
              color: "#0F172A",
              height: 40,
              px: 2,
              "&:hover": {
                borderColor: "#1e293b",
                backgroundColor: "#f8f9fa",
              },
            }}
          >
            Thêm Website
          </Button>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ fontSize: "14px" }}>Website</InputLabel>
            <Select
              value={selectedWebsite}
              onChange={handleWebsiteChange}
              label="Website"
              sx={{
                fontSize: "14px",
                "& .MuiSelect-select": { py: 1.5 },
                whiteSpace: " nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
              disabled={loadingWebsite}
            >
              {websites.map((w) => (
                <MenuItem
                  key={w.domain}
                  value={w.domain}
                  sx={{ fontSize: "14px" }}
                >
                  {w.domain}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress
                size={25}
                sx={{ color: "var(--c_black)", mr: 3 }}
              />
            </Box>
          ) : (
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={
                fetchLoading ||
                !!colorError ||
                !!textColorError ||
                !!avatarError
              }
              onClick={handleSubmit}
              sx={{
                fontSize: "14px",
                bgcolor: "#0F172A",
                "&:hover": { bgcolor: "#1e293b" },
                py: 1,
                px: 2,
                height: 40,
                textTransform: "none",
              }}
            >
              Lưu cấu hình
            </Button>
          )}
        </Box>
      </Box>

      <Box p={4} mt={7}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
            {error}
          </Alert>
        )}
        {fetchLoading ? (
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
        ) : (
          <>
            <Grid
              container
              spacing={2}
              sx={{ justifyContent: "space-between", mb: { xs: 2, sm: 1 } }}
            >
              {[
                { label: "Tổng số hội thoại", value: stats.total },
                { label: "Hội thoại trong hôm nay", value: stats.today },
                { label: "Hội thoại trong tháng này", value: stats.month },
              ].map((item, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={4}
                  key={idx}
                  sx={{ mb: { xs: 2, sm: 0 }, width: "30%" }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: "8px",
                      width: "100%",
                      "&:hover": { boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)" },
                    }}
                  >
                    <Typography
                      className={cx("total_conversation")}
                      sx={{ fontSize: "16px", fontWeight: "bold" }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="p" className={cx("item_total")}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ width: "49%" }} spacing={2}>
                <Box>
                  <Typography fontSize={16} mb={1} fontWeight="bold" ml={2}>
                    Avatar
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box position="relative">
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: form.avatar ? "transparent" : "#00e0dc",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 30,
                          color: "white",
                          fontWeight: "bold",
                          overflow: "hidden",
                        }}
                      >
                        <Avatar
                          src={
                            form.avatar
                              ? form.avatar.startsWith("/uploads")
                                ? `${API_BASE_URL}${form.avatar}`
                                : form.avatar
                              : "https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png" // Default avatar
                          }
                          alt="Avatar"
                          className="avatar_preview"
                          onError={(e) =>
                            (e.target.src = "/fallback-avatar.jpg")
                          }
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography fontSize={13} color="text.secondary">
                        Chúng tôi đề xuất ảnh có kích thước tối thiểu 512 × 512
                        cho trang.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ lineHeight: 1.5, mb: 2 }}>
                    <Typography fontSize={16} mb={1} fontWeight="bold">
                      URL ảnh
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="avatar"
                      value={form.avatar}
                      onChange={handleChange}
                      error={!!avatarError}
                      helperText={avatarError}
                      sx={{ "& .MuiInputBase-input": inputStyle }}
                    />
                  </Box>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Tên trang
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />

                  <Typography fontSize={16} my={1} fontWeight="bold">
                    Tình trạng
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#F7F7F9",
                      borderRadius: "8px",
                      padding: "0 10px 0 15px",
                      mb: 1,
                      gap: 2,
                    }}
                  >
                    <Typography fontSize={13}>Hoạt động</Typography>
                    <Switch checked={true} />
                  </Box>

                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Lưu lịch sử
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#F7F7F9",
                      borderRadius: "8px",
                      padding: "0 10px 0 15px",
                      mb: 1,
                      gap: 2,
                    }}
                  >
                    <Typography fontSize={13}>Lịch sử</Typography>
                    <Switch
                      checked={form.historyEnabled === "true"}
                      onChange={handleHistoryToggle}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    URL trang
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={currentDomain}
                    disabled
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box mt={2}>
                  <Typography
                    sx={{ fontSize: "16px", fontWeight: "bold", mb: 1 }}
                  >
                    Màu cơ bản:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {["#0066FF", "#D42B00", "#7B5FFF", "#03A84E"].map(
                      (color) => (
                        <IconButton
                          key={color}
                          onClick={() =>
                            setForm({ ...form, themeColor: color })
                          }
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: color,
                            border:
                              form.themeColor === color
                                ? "2px solid #00897b"
                                : "1px solid transparent",
                            borderRadius: "6px",
                            "&:hover": { opacity: 0.9 },
                          }}
                        />
                      )
                    )}
                    <Box
                      component="input"
                      type="color"
                      value={form.themeColor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          themeColor: e.target.value,
                        })
                      }
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid #cccccc",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      name="themeColor"
                      value={form.themeColor}
                      onChange={(e) =>
                        setForm({ ...form, themeColor: e.target.value })
                      }
                      error={!!colorError}
                      helperText={colorError}
                      FormHelperTextProps={{
                        sx: {
                          color: "#D32F2F",
                          fontSize: "12px",
                          fontStyle: "italic",
                          width: "324px",
                          position: "absolute !important",
                          top: "30px",
                          right: "-42px",
                        },
                      }}
                      sx={{
                        width: 100,
                        "& input": { fontSize: 14, px: 1, py: 0.5 },
                      }}
                    />
                  </Box>
                </Box>
                <Box mt={3}>
                  <Typography
                    sx={{ fontSize: "16px", fontWeight: "bold", mb: 1 }}
                  >
                    Màu chữ:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {["#ffffff", "#1e1e1e", "#cccccc"].map((color) => (
                      <IconButton
                        key={color}
                        onClick={() => setForm({ ...form, textColor: color })}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: color,
                          border:
                            form.textColor === color
                              ? "2px solid #00897b"
                              : "1px solid transparent",
                          borderRadius: "6px",
                          "&:hover": { opacity: 0.9 },
                        }}
                      />
                    ))}
                    <Box
                      component="input"
                      type="color"
                      value={form.textColor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          textColor: e.target.value,
                        })
                      }
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid #cccccc",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      name="textColor"
                      value={form.textColor}
                      onChange={(e) =>
                        setForm({ ...form, textColor: e.target.value })
                      }
                      size="small"
                      FormHelperTextProps={{
                        sx: {
                          color: "#D32F2F",
                          fontSize: "12px",
                          fontStyle: "italic",
                          width: "324px",
                          position: "absolute !important",
                          top: "30px",
                          right: "-80px",
                        },
                      }}
                      sx={{
                        width: 100,
                        "& input": { fontSize: 14, px: 1, py: 0.5 },
                      }}
                      error={!!textColorError}
                      helperText={textColorError}
                      inputProps={{ maxLength: 7 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ width: "49%" }}>
                <Box
                  sx={{
                    position: "relative",
                    "&:hover": { "& .copy-text": { opacity: 1 } },
                  }}
                  onClick={handleCopy}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: 16 }}
                  >
                    Mã Nhúng
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={`<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v3@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`}
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
                      transition: "opacity 0.2s",
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
                      backgroundColor: "rgba(255, 255, 255)",
                      padding: "6px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {isCopied ? "Đã sao chép!" : "Sao chép vào khay nhớ tạm"}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Lời chào mừng
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="welcomeMessage"
                    value={form.welcomeMessage}
                    onChange={handleChange}
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Webhook URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="webhookUrl"
                    value={form.webhookUrl}
                    onChange={handleChange}
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Server URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="serverUrl"
                    value={form.serverUrl}
                    onChange={handleChange}
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Link liên hệ (Nếu không ai trả lời)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="linkContact"
                    value={form.linkContact}
                    onChange={handleChange}
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={16} mb={1} fontWeight="bold">
                    Vị trí tiện ích:
                  </Typography>
                  <Grid container spacing={1} sx={{ maxWidth: "100%", ml: 1 }}>
                    {positionOptions.map((option) => (
                      <Grid item xs={6} key={option.value}>
                       <Tooltip title={option.name} placement="top">
                        <Box
                          className={cx("position_wrapper", {
                            position_wrapper_active: form.position === option.value,
                          })}
                          onClick={() => handlePositionChange(option.value)}
                        >
                          {[...Array(12)].map((_, index) => (
                            <div
                              key={index}
                              className={cx("position", {
                                position_active: index === option.activeIndex,
                              })}
                            ></div>
                          ))}
                        </Box>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={copySuccess || saveSuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%", fontSize: "12px" }}
        >
          {copySuccess ? "Đã sao chép mã cài đặt!" : "Lưu cấu hình thành công!"}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManagePage;
