import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Divider,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import styles from "./Profile.module.scss";

import CropAvatarModal from "~/Components/CropAvatarModal";

const cx = classNames.bind(styles);

const API_BASE_URL = "http://localhost:5000";

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

function Profile() {
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
    phoneNumber: "", // Thêm phoneNumber
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
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // uploading state is removed as local file uploads are no longer supported
  // eslint-disable-next-line no-unused-vars
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isAvatarUpdated, setIsAvatarUpdated] = useState(false);

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
          phoneNumber: response.data.admin.phoneNumber, // Thêm phoneNumber
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

  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageForCrop(reader.result); // dạng base64
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedAvatar = async (croppedFile) => {
    const formData = new FormData();
    formData.append("avatar", croppedFile);
    formData.append("type", "admin");
    formData.append("phoneNumber", adminInfo.phoneNumber);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload-image-admin`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success && response.data.path) {
        const avatarPath = response.data.path;
        setAdminInfo((prev) => ({ ...prev, avatar: avatarPath }));
        setPreviewAvatar(avatarPath);
        setIsAvatarUpdated(true);
        window.dispatchEvent(new Event("adminInfoUpdated")); // Thông báo cập nhật
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Lỗi khi upload ảnh.",
        severity: "error",
      });
    }
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
    if (
      adminInfo.avatar &&
      !adminInfo.avatar.startsWith("/uploads_admins") &&
      !isValidImageUrl(adminInfo.avatar)
    ) {
      newErrors.avatar = "URL ảnh không hợp lệ.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        name: adminInfo.name,
        phoneNumber: adminInfo.phoneNumber,
        avatar: adminInfo.avatar, // Luôn gửi avatar
      };

      const response = await axios.post(
        `${API_BASE_URL}/update-admin-info`,
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: "success",
        });
        await fetchAdminInfo();
        setIsAvatarUpdated(false);
        window.dispatchEvent(new Event("adminInfoUpdated")); // Thông báo cập nhật
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
            bgcolor: "var(--c_white)",
            color: "var(--c_letter)",
            fontSize: 13,
            textTransform: "none",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#1e293b" },
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          disabled={!!avatarError}
        >
          Lưu
        </Button>
      </Box>

      <Box
        p={{ xs: 2, md: 4 }}
        mt={1}
        sx={{
          bgcolor: "#fff",
          height: "calc(100vh - 3px)",
          marginLeft: "3px",
          marginRight: "3px",
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: "bold", mb: 3 }}>
          Thông tin cơ bản
        </Typography>
        <Grid container>
          <Grid item xs={12} width={"100%"}>
            <Box
              sx={{
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
                mb: 3,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "end",
                }}
              >
                <Box
                  sx={{
                    fontSize: 14,
                    color: "#909298",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  {adminInfo.name}
                </Box>
                <label htmlFor="upload-avatar">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: 40,
                      cursor: "pointer",
                      bgcolor: "#e0e0e0", // hoặc "transparent"
                    }}
                  >
                    {previewAvatar && (
                      <img
                        src={
                          previewAvatar.startsWith("http")
                            ? previewAvatar
                            : `${API_BASE_URL}${previewAvatar}`
                        }
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                          setImageLoaded(false);
                        }}
                      />
                    )}
                  </Avatar>
                </label>

                <input
                  id="upload-avatar"
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleUploadAvatar}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  width: "100%",
                  mt: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ width: "48%" }}>
                  <Typography fontSize={16} fontWeight="bold" mb={1}>
                    Tên
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    value={adminInfo.name}
                    onChange={handleInputChange}
                    sx={{ ...inputStyle }}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Box>

                <Box sx={{ width: "48%" }}>
                  <Typography fontSize={16} fontWeight="bold" mb={1}>
                    Số điện thoại
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    disabled
                    value={adminInfo.phoneNumber}
                    InputProps={{ readOnly: true }}
                    sx={{ ...inputStyle }}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1, width: "48%" }}>
                <Typography fontSize={16} fontWeight="bold" mb={1}>
                  URL ảnh
                </Typography>
                <TextField
                  fullWidth
                  name="avatar"
                  value={adminInfo.avatar}
                  onChange={handleInputChange}
                  error={!!avatarError}
                  helperText={avatarError}
                  sx={{ ...inputStyle }}
                />
              </Box>
            </Box>
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
              color: "var(--c_red_light)",
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

        {/* <Typography sx={{ fontSize: 16, fontWeight: "bold", mb: 2 }}>
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
        </FormControl> */}
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

      <CropAvatarModal
        open={cropModalOpen}
        image={selectedImageForCrop}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCroppedAvatar}
      />
    </div>
  );
}

export default Profile;
