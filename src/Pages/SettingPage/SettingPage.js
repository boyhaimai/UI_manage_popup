import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import styles from "./SettingPage.module.scss";

const cx = classNames.bind(styles);

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

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

function SettingPage() {
  const wrapperRef = useRef();
  const headerRef = useRef(null);
  // fileInputRef and associated input type="file" are removed
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [previewAvatar, setPreviewAvatar] = useState(""); // Preview ảnh local
  const [errors, setErrors] = useState({});
  const [avatarError, setAvatarError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  // uploading state is removed as local file uploads are no longer supported
  const [imageLoaded, setImageLoaded] = useState(false);

  // Kiểm tra URL ảnh hợp lệ
  const isValidImageUrl = (url) => {
    if (!url) return true; // Allow empty URL
    const imageExtensions = /\.(jpeg|jpg|png|gif|webp)/i;
    try {
      new URL(url);
      return imageExtensions.test(url);
    } catch {
      return false;
    }
  };

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get-admin-info`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAdminInfo({
          name: response.data.admin.name,
          email: response.data.admin.email,
          avatar: response.data.admin.avatar || "",
        });
        setPreviewAvatar(response.data.admin.avatar || "");
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Không thể lấy thông tin admin.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Không thể kết nối đến server.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const handleOpenChangePassword = () => setOpenChangePassword(true);
  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }
    if (!form.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu mới.";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu mới không khớp.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: "success",
        });
        handleCloseChangePassword();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi server.",
        severity: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setAdminInfo({ ...adminInfo, name: value });
      setErrors({ ...errors, name: "" });
    } else if (name === "avatar") {
      setAdminInfo({ ...adminInfo, avatar: value });
      setPreviewAvatar(value); // Cập nhật preview
      setAvatarError("");
      if (value && !isValidImageUrl(value)) {
        setAvatarError(
          "URL không phải là link ảnh hợp lệ (jpg, png, gif, webp)."
        );
      }
    } else {
      setForm({ ...form, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSaveAdminInfo = async () => {
    const newErrors = {};
    if (!adminInfo.name || adminInfo.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự.";
    }
    if (adminInfo.avatar && !isValidImageUrl(adminInfo.avatar)) {
      newErrors.avatar = "URL ảnh không hợp lệ.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-admin-info`,
        { name: adminInfo.name, avatar: adminInfo.avatar },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Cập nhật thông tin thành công.",
          severity: "success",
        });
        await fetchAdminInfo(); // Đồng bộ sau khi lưu
      } else {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi server.",
        severity: "error",
      });
    }
  };

  // handleAvatarChange function is removed since local file uploads are no longer supported

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
      <Box
        className={cx("title_header")}
        ref={headerRef}
        sx={{
          bgcolor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Cài đặt</Typography>
        <Button
          variant="contained"
          onClick={handleSaveAdminInfo}
          sx={{
            bgcolor: "#0F172A",
            color: "#fff",
            fontSize: 13,
            textTransform: "none",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#1e293b" },
            borderRadius: "8px",
          }}
          disabled={!!avatarError} // Removed 'uploading' from disabled prop
        >
          Lưu
        </Button>
      </Box>

      <Box p={{ xs: 2, md: 4 }} mt={1}>
        <Typography sx={{ fontSize: 16, fontWeight: "bold", mb: 3 }}>
          Thông tin cơ bản
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Box position="relative" sx={{ mb: 1 }}>
                <Avatar
                  src={previewAvatar} // Now 'previewAvatar' will always be a URL
                  alt={adminInfo.name}
                  sx={{ width: 100, height: 100, mx: "auto", fontSize: 40 }}
                  imgProps={{
                    onLoad: () => setImageLoaded(true),
                    onError: () => setImageLoaded(false),
                  }}
                >
                  {/* fallback chữ cái chỉ hiển thị nếu không có ảnh hoặc load lỗi */}
                  {(!previewAvatar || !imageLoaded)
                    ? adminInfo.name?.charAt(0)?.toUpperCase()
                    : null}
                </Avatar>

                {/* The IconButton and input type="file" are removed */}
              </Box>
              <Typography fontSize={13} color="text.secondary" mb={1}>
                Đề xuất ảnh kích thước tối thiểu 512 × 512.
              </Typography>
              <Typography fontSize={16} fontWeight="bold" mb={1}>
                URL ảnh
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="avatar"
                value={adminInfo.avatar}
                onChange={handleInputChange}
                error={!!avatarError}
                helperText={avatarError}
                sx={{ ...inputStyle, maxWidth: 300, mx: "auto" }}
                // removed 'disabled={uploading}'
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên"
                  required
                  name="name"
                  value={adminInfo.name}
                  onChange={handleInputChange}
                  sx={{ ...inputStyle }}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  required
                  value={adminInfo.email}
                  InputProps={{ readOnly: true }}
                  sx={{ ...inputStyle }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "#e0e0e0" }} />

        <Typography sx={{ fontSize: 16, fontWeight: "bold", mb: 3 }}>
          Bảo mật
        </Typography>
        <Box mb={3}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
            Mật khẩu
          </Typography>
          <Button
            variant="text"
            onClick={handleOpenChangePassword}
            sx={{
              color: "#0F172A",
              fontSize: 13,
              textTransform: "none",
              p: 0,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Đổi mật khẩu
          </Button>
        </Box>

        <Dialog
          open={openChangePassword}
          onClose={handleCloseChangePassword}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              p: 1,
              minWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
            Đổi mật khẩu
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography sx={{ fontSize: 13, mb: 1 }}>
              Mật khẩu hiện tại
            </Typography>
            <TextField
              fullWidth
              type="password"
              required
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu hiện tại"
              sx={{ ...inputStyle, mb: 2 }}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
            />
            <Typography sx={{ fontSize: 13, mb: 1 }}>Mật khẩu mới</Typography>
            <TextField
              fullWidth
              type="password"
              required
              name="newPassword"
              value={form.newPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu mới"
              sx={{ ...inputStyle, mb: 2 }}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
            <Typography sx={{ fontSize: 13, mb: 1 }}>
              Nhập lại mật khẩu mới
            </Typography>
            <TextField
              fullWidth
              type="password"
              required
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu mới"
              sx={{ ...inputStyle, mb: 2 }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseChangePassword}
              sx={{
                fontSize: 13,
                color: "#1e1e1e",
                textTransform: "none",
                "&:hover": { bgcolor: "#f0f2f5" },
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              sx={{
                bgcolor: "#0F172A",
                color: "#fff",
                fontSize: 13,
                textTransform: "none",
                px: 3,
                "&:hover": { bgcolor: "#1e293b" },
                borderRadius: "8px",
              }}
            >
              Đổi mật khẩu
            </Button>
          </DialogActions>
        </Dialog>

        <Typography sx={{ fontSize: 16, fontWeight: "bold", mb: 2 }}>
          Giao diện
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontSize: 13 }}>Chủ đề</InputLabel>
          <Select
            defaultValue="default"
            size="small"
            label="Chủ đề"
            sx={{
              ...inputStyle,
              "& .MuiSelect-select": { fontSize: 13, py: 1 },
              borderRadius: "8px",
            }}
          >
            <MenuItem sx={{ fontSize: 13 }} value="default">
              Mặc định hệ thống
            </MenuItem>
            <MenuItem sx={{ fontSize: 13 }} value="light">
              Sáng
            </MenuItem>
            <MenuItem sx={{ fontSize: 13 }} value="dark">
              Tối
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", fontSize: 13 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default SettingPage;