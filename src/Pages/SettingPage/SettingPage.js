import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  IconButton,
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
import {
  Add,
  Save,
  History,
  Link,
  Palette,
  FormatColorText,
  Code,
  Chat,
  Webhook,
  Cloud,
  ContactMail,
  Place,
  Image,
  Edit,
} from "@mui/icons-material";
import classNames from "classnames/bind";
import styles from "../ManagePage/ManagePage.module.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "~/Components/Avatar/Avatar";
import useDebounce from "~/hooks/useDebounce";
import { useTokenExpiration } from "~/contexts/TokenExpirationContext/TokenExpirationContext";

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

function SettingPage() {
  const [form, setForm] = useState({
    webhookUrl: "",
    serverUrl: "",
    historyEnabled: "true",
    themeColor: "#0abfbc",
    textColor: "#ffffff",
    title: "",
    avatar: "",
    welcomeMessage: "",
    position: "bottom-right",
    linkContact: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    month: 0,
    visitorsToday: 0,
    visitorsLast7Days: 0,
    pageViewsToday: 0,
    pageViewsLast7Days: 0,
    conversationsAnswered: 0,
    conversationsMissed: 0,
  });
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
  const { triggerTokenExpiration } = useTokenExpiration();
  const wrapperRef = useRef();
  const headerRef = useRef();

  const debouncedThemeColor = useDebounce({
    value: form.themeColor,
    delay: 500,
  });
  const debouncedTextColor = useDebounce({ value: form.textColor, delay: 500 });

  const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
    try {
      const cleanUrl = new URL(url).pathname;
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
        return;
      }

      const configResponse = await axios.get(
        `${API_BASE_URL}/get-selected-config`,
        { withCredentials: true }
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
      if (err.response?.status === 401) {
        triggerTokenExpiration();
      }
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
          if (err.response?.status === 401) {
            triggerTokenExpiration();
          }
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "avatar") {
      setAvatarFile(null);
      setAvatarError("");
      if (value && !isValidImageUrl(value)) {
        setAvatarError(
          "URL không phải là link ảnh hợp lệ (jpg, png, gif, webp)."
        );
      }
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("type", "popup");
    formData.append("id_config", form.id_config); // cần để server biết ảnh cũ

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success && response.data.path) {
        setForm((prev) => ({ ...prev, avatar: response.data.path }));
      }
    } catch (err) {
      console.error("Lỗi khi upload ảnh:", err);
    }
  };

  const handlePositionChange = (value) => {
    setForm({ ...form, position: value });
  };

  const handleHistoryToggle = () => {
    setForm({
      ...form,
      historyEnabled: form.historyEnabled === "true" ? "false" : "true",
    });
  };

  const handleCopy = () => {
    const code = `<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v8@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`;
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
      if (err.response?.status === 401) {
        triggerTokenExpiration();
      }
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
          <div style={{ fontSize: "16px" }}>Cài đặt</div>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => navigate("/add_website")}
            sx={{
              fontSize: "14px",
              textTransform: "none",
              borderColor: "var(--c_white)",
              height: 40,
              px: 2,
              color: "var(--c_white) !important",
              "&:hover": {
                borderColor: "#1e293b",
                backgroundColor: "#f8f9fa",
                color: "var(--c_letter) !important",
              },
            }}
          >
            Thêm Website
          </Button>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel
              sx={{ fontSize: "14px", color: "var(--layer_background)" }}
            >
              Website
            </InputLabel>
            <Select
              value={selectedWebsite}
              onChange={handleWebsiteChange}
              label="Website"
              sx={{
                fontSize: "14px",
                color: "var(--layer_background)",
                "& .MuiSelect-select": { py: 1.5 },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--layer_background) !important",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--layer_background)",
                  color: "var(--layer_background) !important",
                },
                "& .MuiSelect-icon": {
                  color: "var(--layer_background)",
                  right: "-2px",
                },
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
                color: "var(--c_letter)",
                bgcolor: "var(--layer_background)",
                "&:hover": { bgcolor: "var(--layer_background)" },
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

      <Box
        p={4}
        mt={7}
        sx={{
          backgroundColor: "var(--c_white)",
          marginLeft: "2px",
          marginRight: "2px",
          height: "100%",
        }}
      >
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
            <CircularProgress sx={{}} />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ width: "49%" }} spacing={2}>
                <Box>
                  <Box position="relative">
                    <label htmlFor="upload-avatar">
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
                          cursor: "pointer", // 👈 để hiện tay chuột
                          mb: 1
                        }}
                      >
                        <Avatar
                          src={
                            form.avatar
                              ? form.avatar.startsWith("/uploads")
                                ? `${API_BASE_URL}${form.avatar}`
                                : form.avatar
                              : "https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png"
                          }
                          alt="Avatar"
                          className="avatar_preview"
                          sx={{ width: "100%", height: "100%" }}
                          onError={(e) =>
                            (e.target.src = "/fallback-avatar.jpg")
                          }
                        />
                      </Box>
                    </label>

                    <input
                      id="upload-avatar"
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleUploadImage}
                    />
                  </Box>

                  <Box sx={{ lineHeight: 1.5, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Image sx={{ mr: 1 }} />
                      <Typography fontSize={13} fontWeight="bold">
                        URL ảnh hoặc tải lên
                      </Typography>
                    </Box>
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

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Edit sx={{ mr: 1, fontSize: 16 }} />
                      <Typography fontSize={13} fontWeight="bold">
                        Tên trang
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      sx={{ "& .MuiInputBase-input": inputStyle }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <History sx={{ mr: 1, fontSize: 16 }} />
                      <Typography fontSize={13} fontWeight="bold">
                        Lưu lịch sử
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#F7F7F9",
                        borderRadius: "8px",
                        padding: "0 10px 0 15px",
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
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Link sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      URL trang
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={currentDomain}
                    disabled
                    sx={{ "& .MuiInputBase-input": inputStyle }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Palette sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Màu cơ bản
                    </Typography>
                  </Box>
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
                                ? "3px solid var(--c_letter)"
                                : "1px solid transparent",
                            borderRadius: "6px",
                            "&:hover": {
                              bgcolor: color, // giữ nguyên màu
                              border:
                                form.themeColor === color
                                  ? "3px solid var(--c_letter)"
                                  : "1px solid tr ansparent", // giữ viền
                            },
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
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <FormatColorText sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Màu chữ
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    {["#ffffff", "#1e1e1e", "#cccccc"].map((color) => (
                      <IconButton
                        key={color}
                        disableRipple
                        onClick={() => setForm({ ...form, textColor: color })}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: color,
                          border:
                            form.textColor === color
                              ? "2px solid #00897b"
                              : "1px solid var(--c_letter)", // 👈 Border đen mặc định
                          borderRadius: "6px",
                          "&:hover": {
                            bgcolor: color, // 👈 Không đổi màu
                            border:
                              form.textColor === color
                                ? "2px solid #00897b"
                                : "1px solid var(--c_letter)", // 👈 Giữ border
                          },
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Code sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Mã Nhúng
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={`<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v8@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`}
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Chat sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Lời chào mừng
                    </Typography>
                  </Box>
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Webhook sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Webhook URL
                    </Typography>
                  </Box>
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Cloud sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Server URL
                    </Typography>
                  </Box>
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ContactMail sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Link liên hệ
                    </Typography>
                  </Box>
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Place sx={{ mr: 1, fontSize: 16 }} />
                    <Typography fontSize={13} fontWeight="bold">
                      Vị trí tiện ích
                    </Typography>
                  </Box>
                  <Grid container spacing={1} sx={{ maxWidth: "100%", ml: 1 }}>
                    {positionOptions.map((option) => (
                      <Grid item xs={6} key={option.value}>
                        <Tooltip title={option.name} placement="top">
                          <Box
                            className={cx("position_wrapper", {
                              position_wrapper_active:
                                form.position === option.value,
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

export default SettingPage;
