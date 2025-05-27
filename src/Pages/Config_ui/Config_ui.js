import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MessageIcon from "@mui/icons-material/Message";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";

import styles from "./config_ui.module.scss";
import DetailConversation from "~/Pages/DetailConversation";

const cx = classNames.bind(styles);

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function PageConfig() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    webhookUrl: "https://bang.daokhaccu.top/webhook/save_history",
    serverUrl: "https://ai.bang.vawayai.com:5000",
    historyEnabled: "true",
    themeColor: "#0abfbc",
    textColor: "#ffffff",
    title: "Trợ lý AI",
    avatar: "",
    welcomeMessage: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?",
    position: "bottom-right",
    linkContact: "",
  });
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, month: 0 });
  const [colorError, setColorError] = useState("");
  const [textColorError, setTextColorError] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [id_config, setIdConfig] = useState("");

  const navigate = useNavigate();

  const fetchConfigAndStats = async (newIdConfig) => {
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
        navigate("/select_website");
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
        return;
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
      console.error("Lỗi khi tải config hoặc thống kê:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối tới server.");
      }
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
            fetchConfigAndStats(selectedSite.config_id);
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
    if (name === "themeColorHex") {
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        setForm({ ...form, themeColor: value });
        setColorError("");
      } else {
        setColorError("Mã màu phải có định dạng #RRGGBB (ví dụ: #ffffff)");
      }
    } else if (name === "textColorHex") {
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        setForm({ ...form, textColor: value });
        setTextColorError("");
      } else {
        setTextColorError("Mã màu phải có định dạng #RRGGBB (ví dụ: #ffffff)");
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleColorPickerChange = (e) => {
    setForm({ ...form, themeColor: e.target.value });
    setColorError("");
  };

  const handleTextColorPickerChange = (e) => {
    setForm({ ...form, textColor: e.target.value });
    setTextColorError("");
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

  const handleCopyCode = () => {
    const code = `<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v3@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopySuccess(true);
      })
      .catch(() => {
        setError("Không thể sao chép mã.");
      });
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);
    setLoading(true);
    if (!id_config) {
      setError("Không tìm thấy config_id. Vui lòng chọn website.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/save-config`,
        {
          id_config,
          ...form,
          historyEnabled: form.historyEnabled === "true",
        },
        { withCredentials: true }
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
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Lỗi khi lưu cấu hình:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    axios
      .post(`${API_BASE_URL}/logout`, {}, { withCredentials: true })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Lỗi khi đăng xuất:", err);
        navigate("/");
      });
  };

  return (
    <Box sx={{ height: "100vh", overflowY: "auto" }}>
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          padding: { xs: 1, sm: 2 },
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: { xs: 2, sm: 3 },
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              mb: { xs: 2, sm: 4 },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: "bold",
                color: "#0F172A",
              }}
            >
              Chat Widget Admin
            </Typography>
            <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 200, position: "relative" }}
              >
                <InputLabel sx={{ fontSize: "14px" }}>Website</InputLabel>
                <Select
                  value={selectedWebsite}
                  onChange={handleWebsiteChange}
                  label="Website"
                  sx={{
                    fontSize: "14px",
                    "& .MuiSelect-select": { py: 1.5 },
                    opacity: loadingWebsite ? 0.5 : 1,
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
                {loadingWebsite && (
                  <CircularProgress
                    size={20}
                    sx={{
                      position: "absolute",
                      right: "30px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                )}
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#0F172A",
                  borderColor: "#0F172A",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    borderColor: "#1e293b",
                  },
                  padding: "4px 10px",
                }}
              >
                Đăng xuất
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            {fetchLoading && (
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

            {!fetchLoading && (
              <Box
                sx={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  p: { xs: 2, sm: 4 },
                  overflow: "hidden",
                  maxHeight: "auto",
                  height: "auto",
                }}
              >
                <Grid
                  container
                  spacing={2}
                  sx={{ justifyContent: "space-between", mb: { xs: 2, sm: 4 } }}
                >
                  {[
                    { label: "Tổng số tin nhắn", value: stats.total },
                    {
                      label: "Các tin nhắn trong hôm nay",
                      value: stats.today,
                    },
                    {
                      label: "Các tin nhắn trong tháng này",
                      value: stats.month,
                    },
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
                          "&:hover": {
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      >
                        <Typography
                          className={cx("total_conversation")}
                          sx={{ fontSize: "12px", fontWeight: "bold" }}
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

                <Box sx={{ mb: { xs: 2, sm: 4 } }}>
                  <Tabs
                    value={tab}
                    onChange={(e, newVal) => setTab(newVal)}
                    sx={{
                      mb: 3,
                      backgroundColor: "#fff",
                      borderRadius: "8px 8px 0 0",
                      "& .MuiTabs-flexContainer": {
                        justifyContent: "flex-start",
                      },
                      "& .MuiTab-root": {
                        fontSize: "12px",
                        fontWeight: "bold",
                        minWidth: "100px",
                        "&:hover": { backgroundColor: "#f0f2f5" },
                      },
                      "& .Mui-selected": { color: "#0F172A !important" },
                    }}
                  >
                    <Tab
                      icon={<SettingsIcon sx={{ fontSize: "20px" }} />}
                      label="Giao diện"
                      sx={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Tab
                      icon={<MessageIcon sx={{ fontSize: "20px" }} />}
                      label="Tin nhắn"
                      sx={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Tab
                      icon={<MessageIcon sx={{ fontSize: "20px" }} />}
                      label="Chi tiết các hội thoại"
                      sx={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                  </Tabs>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2, fontSize: "12px" }}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    {tab === 0 && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            mb: { xs: 2, sm: 3 },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: 18, sm: 20 },
                              fontWeight: "bold",
                              mb: 1,
                            }}
                            variant="h3"
                          >
                            Cài đặt giao diện
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748B",
                              mb: 1,
                            }}
                            variant="h4"
                          >
                            Tùy chỉnh giao diện của tiện ích trò chuyện của bạn
                          </Typography>
                        </Box>
                        <TextField
                          label="Tên AI"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="URL hình đại diện"
                          name="avatar"
                          value={form.avatar}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                        <Box mt={2}>
                          <Typography
                            sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}
                          >
                            Màu cơ bản:
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              component="input"
                              type="color"
                              name="themeColor"
                              value={form.themeColor}
                              onChange={handleColorPickerChange}
                              sx={{
                                width: 25,
                                height: 25,
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                            />
                            <TextField
                              name="themeColorHex"
                              value={form.themeColor}
                              onChange={handleChange}
                              fullWidth
                              inputProps={{
                                maxLength: 7,
                                style: {
                                  fontSize: "12px",
                                  padding: "8px 12px",
                                },
                              }}
                              sx={{
                                flex: 1,
                                "& input": { padding: "8px 12px" },
                              }}
                              error={!!colorError}
                              helperText={colorError}
                            />
                          </Box>
                        </Box>
                        <Box mt={2}>
                          <Typography
                            sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}
                          >
                            Màu chữ:
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              component="input"
                              type="color"
                              name="textColor"
                              value={form.textColor}
                              onChange={handleTextColorPickerChange}
                              sx={{
                                width: 25,
                                height: 25,
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                            />
                            <TextField
                              name="textColorHex"
                              value={form.textColor}
                              onChange={handleChange}
                              fullWidth
                              inputProps={{
                                maxLength: 7,
                                style: {
                                  fontSize: "12px",
                                  padding: "8px 12px",
                                },
                              }}
                              sx={{
                                flex: 1,
                                "& input": { padding: "8px 12px" },
                              }}
                              error={!!textColorError}
                              helperText={textColorError}
                            />
                          </Box>
                        </Box>
                        <Box mt={3}>
                          <Typography
                            sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}
                          >
                            Vị trí tiện ích:
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant={
                                  form.position === "bottom-right"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() =>
                                  handlePositionChange("bottom-right")
                                }
                                sx={{
                                  fontSize: "12px",
                                  backgroundColor:
                                    form.position === "bottom-right"
                                      ? "#0F172A"
                                      : "transparent",
                                  color:
                                    form.position === "bottom-right"
                                      ? "#fff"
                                      : "#0F172A",
                                  fontWeight: "bold",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    backgroundColor:
                                      form.position === "bottom-right"
                                        ? "#1e293b"
                                        : "#f0f2f5",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  },
                                  padding: "4px 10px",
                                }}
                              >
                                Phía dưới bên phải
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant={
                                  form.position === "bottom-left"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() =>
                                  handlePositionChange("bottom-left")
                                }
                                sx={{
                                  fontSize: "12px",
                                  backgroundColor:
                                    form.position === "bottom-left"
                                      ? "#0F172A"
                                      : "transparent",
                                  color:
                                    form.position === "bottom-left"
                                      ? "#fff"
                                      : "#0F172A",
                                  fontWeight: "bold",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    backgroundColor:
                                      form.position === "bottom-left"
                                        ? "#1e293b"
                                        : "#f0f2f5",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  },
                                  padding: "4px 10px",
                                }}
                              >
                                Dưới cùng bên trái
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant={
                                  form.position === "top-right"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() =>
                                  handlePositionChange("top-right")
                                }
                                sx={{
                                  fontSize: "12px",
                                  backgroundColor:
                                    form.position === "top-right"
                                      ? "#0F172A"
                                      : "transparent",
                                  color:
                                    form.position === "top-right"
                                      ? "#fff"
                                      : "#0F172A",
                                  fontWeight: "bold",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    backgroundColor:
                                      form.position === "top-right"
                                        ? "#1e293b"
                                        : "#f0f2f5",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  },
                                  padding: "4px 10px",
                                }}
                              >
                                Phía trên bên phải
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant={
                                  form.position === "top-left"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() => handlePositionChange("top-left")}
                                sx={{
                                  fontSize: "12px",
                                  backgroundColor:
                                    form.position === "top-left"
                                      ? "#0F172A"
                                      : "transparent",
                                  color:
                                    form.position === "top-left"
                                      ? "#fff"
                                      : "#0F172A",
                                  fontWeight: "bold",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    backgroundColor:
                                      form.position === "top-left"
                                        ? "#1e293b"
                                        : "#f0f2f5",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  },
                                  padding: "4px 10px",
                                }}
                              >
                                Phía trên bên trái
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </>
                    )}

                    {tab === 1 && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            mb: { xs: 2, sm: 3 },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: 18, sm: 20 },
                              fontWeight: "bold",
                              mb: 1,
                            }}
                            variant="h3"
                          >
                            Cài đặt tin nhắn
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#64748B",
                              mb: 1,
                            }}
                            variant="h4"
                          >
                            Tùy chỉnh văn bản hiển thị trong tiện ích trò chuyện
                            của bạn
                          </Typography>
                        </Box>
                        <Box mt={2} display="flex" alignItems="center" gap={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={form.historyEnabled === "true"}
                                onChange={handleHistoryToggle}
                                sx={{ color: "#0F172A" }}
                              />
                            }
                            labelPlacement="start"
                            label={
                              <Typography sx={{ fontSize: "12px" }}>
                                Lịch sử
                              </Typography>
                            }
                          />
                        </Box>
                        <TextField
                          label="Tin nhắn chào mừng"
                          name="welcomeMessage"
                          value={form.welcomeMessage}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Webhook URL"
                          name="webhookUrl"
                          value={form.webhookUrl}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Server URL"
                          name="serverUrl"
                          value={form.serverUrl}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Link liên hệ (nếu không có ai phản hồi)"
                          name="linkContact"
                          value={form.linkContact || ""}
                          onChange={handleChange}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ style: { fontSize: "12px" } }}
                          InputProps={{ style: { fontSize: "12px" } }}
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}

                    {tab === 2 && (
                      <DetailConversation
                        idConfig={id_config}
                        domain={currentDomain}
                      />
                    )}

                    <Box mt={3} display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading || fetchLoading}
                        sx={{
                          fontSize: "12px",
                          bgcolor: "#0F172A",
                          "&:hover": { bgcolor: "#1e293b" },
                          py: 1,
                          px: 2,
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={14} />
                        ) : (
                          "Lưu cấu hình"
                        )}
                      </Button>
                    </Box>
                  </form>
                </Box>
              </Box>
            )}

            {!fetchLoading && (
              <Box
                mt={5}
                sx={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  p: { xs: 2, sm: 4 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 2,
                  }}
                >
                  Mã cài đặt
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748B",
                    textAlign: "center",
                    mb: 3,
                  }}
                >
                  Sao chép và dán mã này vào trang web của bạn để cài đặt tiện
                  ích trò chuyện
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: "#f5f5f5",
                      p: 2,
                      fontSize: "12px",
                      borderRadius: "8px",
                      overflowX: "auto",
                      overflowY: "auto",
                      maxHeight: { xs: 150, sm: 200 },
                      whiteSpace: "pre-wrap",
                      "&:hover": { backgroundColor: "#e5e7eb" },
                    }}
                  >
                    {`<script src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v3@main/dist/model_admin_just_chat.js" data-server-url="${form.serverUrl}" data-id-config="${id_config}" defer></script>`}
                  </Box>
                  <Button
                    startIcon={
                      <ContentCopyIcon
                        sx={{
                          fontSize: "7px !important",
                          marginRight: "-1px !important",
                        }}
                      />
                    }
                    onClick={handleCopyCode}
                    sx={{
                      fontSize: "10px",
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      color: "#0F172A",
                      bgcolor: "#e5e7eb",
                      "&:hover": { bgcolor: "#d1d5db" },
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Sao chép
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Container>

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
            {copySuccess
              ? "Đã sao chép mã cài đặt!"
              : "Lưu cấu hình thành công!"}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default PageConfig;
