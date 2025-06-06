import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MenuCustom from "./Menu";
import MenuItemCustom from "./Menu/MenuItem";
import config from "~/config";
import {
  Dashboard,
  ErrorRounded,
  Forum,
  HelpRounded,
  SettingsRounded,
  Telegram,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import styles from "./Sidebar.module.scss";
import Avatar from "~/Components/Avatar/Avatar";

const cx = classNames.bind(styles);
const API_BASE_URL = "https://ai.bang.vawayai.com";

function Sidebar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setError("");
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        navigate(config.routes.login_admin);
      } else {
        setError(response.data.message || "Đăng xuất thất bại.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.response?.data?.message || "Không thể kết nối đến server.");
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-admin-info`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setAdminInfo(res.data.admin);
        } else {
          setError(res.data.message || "Không lấy được thông tin.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin admin:", err);
        setError("Lỗi server hoặc chưa đăng nhập.");
      }
    };

    fetchAdminInfo();
  }, []);

  return (
    <aside className={cx("wrapper")}>
      <h4 className={cx("title")}>Administration</h4>
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
          {error}
        </Alert>
      )}
      <MenuCustom>
        <MenuItemCustom
          title="Tổng quan"
          to={config.routes.managePage}
          icon={<Dashboard className={cx("icon_menu")} />}
        />
        <MenuItemCustom
          title="Quản lý trò chuyện"
          to={config.routes.DetailConversation}
          icon={<Forum className={cx("icon_menu")} />}
        />       
        {/* <MenuItemCustom
          title="Tham gia trò chuyện"
          to={config.routes.message}
          icon={<Telegram className={cx("icon_menu")} />}
        />        */}
        <Box className={cx("support")}>
          <MenuItemCustom
            title="Settings"
            to="/settings"
            icon={<SettingsRounded className={cx("icon_menu")} />}
          />
          <MenuItemCustom
            title="About us"
            to="https://vaway.vn/"
            icon={<ErrorRounded className={cx("icon_menu")} />}
          />
          <MenuItemCustom
            title="Support"
            to="/feedback"
            icon={<HelpRounded className={cx("icon_menu")} />}
          />
        </Box>
      </MenuCustom>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#f9fafb",
          maxWidth: 300,
          boxShadow: 1,
          p: 2,
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Avatar
            src={adminInfo?.avatar || ""}
            alt={adminInfo?.name || ""}
            className={cx("avatar")}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={600}
              fontSize={14}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "calc(150px - 10px)",
              }}
            >
              {adminInfo?.name || "Loading..."}
            </Typography>
            <Typography
              fontSize={12}
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
              }}
            >
              {adminInfo?.phoneNumber || ""} {/* Sửa từ email thành phoneNumber */}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClick} sx={{ flexShrink: 0 }}>
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: 90, horizontal: 20 }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 150,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              "& .MuiMenuItem-root": {
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.2s ease",
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "#f0f0f0",
              },
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <i className="fas fa-user" style={{ fontSize: 14 }}></i>
            Xem hồ sơ
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" style={{ fontSize: 14 }}></i>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Box>
    </aside>
  );
}

export default Sidebar;