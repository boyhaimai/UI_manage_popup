import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

export default function CertificateWebsite() {
  const [configId, setConfigId] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Lấy config_id và URL website
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // Lấy config_id
        const response = await axios.get(`${API_BASE_URL}/get-selected-config`, {
          withCredentials: true,
        });
        if (response.data.success && response.data.config_id) {
          const id = response.data.config_id;
          setConfigId(id);

          // Lấy danh sách website của admin
          const websitesResponse = await axios.get(`${API_BASE_URL}/get-websites`, {
            withCredentials: true,
          });
          if (websitesResponse.data.success && websitesResponse.data.websites) {
            const website = websitesResponse.data.websites.find(
              (w) => w.config_id === id
            );
            if (website && website.domain) {
              // Đảm bảo domain có giao thức
              const formattedUrl = website.domain.startsWith("http")
                ? website.domain
                : `http://${website.domain}`;
              setWebsiteUrl(formattedUrl);
            } else {
              setError("Không tìm thấy URL website cho config_id này.");
            }
          } else {
            setError("Không thể lấy danh sách website. Vui lòng kiểm tra tài khoản.");
          }
        } else {
          setError("Không tìm thấy cấu hình. Vui lòng chọn website.");
          setTimeout(() => navigate("/select_website"), 2000);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể kết nối đến server."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [navigate]);

  // Xác minh website
  const handleVerify = async () => {
    if (!websiteUrl || !configId) {
      setError("URL website hoặc ID cấu hình không hợp lệ.");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      // Gửi GET request đến website
      const response = await axios.get(websiteUrl, {
        headers: { Accept: "text/html" },
      });
      const htmlContent = response.data;

      // Tạo mã nhúng cần tìm
      const scriptPattern = new RegExp(
        `<script\\s+src="https://cdn.jsdelivr.net/gh/boyhaimai/model_admin_just_chat_v3@main/dist/model_admin_just_chat.js"\\s+data-server-url="https://ai.bang.vawayai.com:5000"\\s+data-id-config="${configId}"\\s+defer></script>`
          .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
      );

      // Kiểm tra HTML có chứa script không
      if (scriptPattern.test(htmlContent)) {
        setSuccess("Xác minh thành công! Tiện ích trò chuyện đã được cài đặt.");
        // Lưu trạng thái xác minh vào server
        await axios.post(
          `${API_BASE_URL}/update-website-status`,
          { config_id: configId, verified: true },
          { withCredentials: true }
        );
      } else {
        setError(
          "Không tìm thấy mã nhúng trên website. Vui lòng kiểm tra lại."
        );
      }
    } catch (err) {
      setError(
        "Không thể truy cập website. Vui lòng kiểm tra URL hoặc kết nối."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    navigate("/manage_page"); // Chuyển hướng về trang quản lý
  };

  const handleNext = () => {
    if (!success) {
      setError("Vui lòng xác minh website trước khi tiếp tục.");
      return;
    }
    navigate("/manage_page"); // Chuyển hướng về trang quản lý
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 0, md: 340 },
          bgcolor: "white",
          p: 3,
          borderRight: "1px solid #e5e7eb",
          display: { xs: "none", md: "block" },
        }}
      >
        <Box textAlign="center" mb={4}>
          <img
            src="https://dashboard.tawk.to/images/onboarding/tawk-logo.svg"
            alt="Logo"
            style={{ height: 40 }}
          />
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: 20 }}
        >
          Trò chuyện trực tiếp
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 14, textAlign: "left" }}>
          Chúng tôi sẽ thiết lập những điều cơ bản để bạn có thể thấy ngay khách
          truy cập vào trang web của mình và cài đặt tiện ích. Đừng lo lắng, có
          nhiều tính năng nâng cao hơn (tất cả đều miễn phí) có thể tùy chỉnh
          trong khu vực quản trị sau khi thiết lập ban đầu. Nếu bạn gặp khó
          khăn, hãy bắt đầu trò chuyện bên dưới:
        </Typography>
        <Box mt={4}>
          <Button variant="outlined" fullWidth sx={{ fontSize: 14 }}>
            Trò chuyện với chúng tôi
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={4}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "550px",
            }}
          >
            <CircularProgress sx={{ color: "#0F172A" }} />
          </Box>
        ) : (
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
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ fontSize: 24 }}
                >
                  Xác minh kết nối tiện ích trò chuyện
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ fontSize: 16 }}
                >
                  Truy cập trang web của bạn ({websiteUrl || "chưa xác định"}) để kiểm tra xem tiện ích có hiện diện
                  hay không, sau đó nhấp vào xác minh.
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mt: 2, fontSize: "14px" }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mt: 2, fontSize: "14px" }}>
                    {success}
                  </Alert>
                )}
                <Box>
                  <Button
                    color="success"
                    variant="contained"
                    sx={{ mt: 2, fontSize: 14, textTransform: "inherit" }}
                    onClick={handleVerify}
                    disabled={verifying || !websiteUrl}
                  >
                    {verifying ? <CircularProgress size={14} /> : "Xác minh"}
                  </Button>
                </Box>
              </Box>
              <Box mt={7}>
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
        )}

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box
            sx={{
              marginTop: "-10px",
              marginLeft: "92px",
              display: "flex",
              gap: 2,
            }}
          >
            <Box>
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
                disabled={loading || verifying}
              >
                Bỏ qua
              </Button>
            </Box>
            <Box>
              <Button
                variant="contained"
                sx={{
                  fontSize: 14,
                  textTransform: "inherit",
                  float: "right",
                  background: "transparent",
                  color: "#000000",
                }}
                onClick={() => navigate("/copy_code")}
                disabled={loading || verifying}
              >
                Trở lại
              </Button>
            </Box>
          </Box>
          <Box sx={{ marginTop: "-10px", marginRight: "92px" }}>
            <Button
              variant="contained"
              color="success"
              sx={{ fontSize: 14, textTransform: "inherit", float: "right" }}
              onClick={handleNext}
              disabled={loading || verifying}
            >
              Kế tiếp
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}