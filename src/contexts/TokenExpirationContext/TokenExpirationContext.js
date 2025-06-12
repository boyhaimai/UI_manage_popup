import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar, Button } from "@mui/material";
import axios from "axios";

const TokenExpirationContext = createContext();

export const TokenExpirationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const navigate = useNavigate();

  // Hàm kích hoạt thông báo khi token hết hạn
  const triggerTokenExpiration = (url = "/") => {
    setRedirectUrl(url);
    setOpen(true);
    console.log("Trigger token expiration with URL:", url); // Debug
  };

  // Xử lý khi nhấn OK
  const handleConfirmLogout = () => {
    setOpen(false);
    navigate(redirectUrl);
    console.log("Redirecting to:", redirectUrl); // Debug
  };

  // Đóng thông báo mà không đăng xuất
  const handleClose = () => {
    setOpen(false);
  };

  // Interceptor cho axios
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          triggerTokenExpiration();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <TokenExpirationContext.Provider value={{ triggerTokenExpiration }}>
      {children}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
      >
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleConfirmLogout}>
              OK
            </Button>
          }
          sx={{ width: "100%", fontSize: "14px" }}
        >
          Phiên đăng nhập đã hết hạn! Vui lòng nhấn OK để đăng xuất.
        </Alert>
      </Snackbar>
    </TokenExpirationContext.Provider>
  );
};

export const useTokenExpiration = () => useContext(TokenExpirationContext);