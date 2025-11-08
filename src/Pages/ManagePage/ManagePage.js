import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Chat,
  Visibility,
  Person,
  ArrowDropUp,
  ArrowDropDown,
} from "@mui/icons-material";
import classNames from "classnames/bind";
import styles from "./ManagePage.module.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTokenExpiration } from "~/contexts/TokenExpirationContext/TokenExpirationContext";

const cx = classNames.bind(styles);
const API_BASE_URL = " http://localhost:5000";

function ManagePage() {
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
    conversationsLast7Days: 0,
    dailyVisitors: [],
    dailyPageViews: [],
    visitHistory: [], // Thêm trường visitHistory
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [currentDomain, setCurrentDomain] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [id_config, setIdConfig] = useState("");
  const navigate = useNavigate();
  const { triggerTokenExpiration } = useTokenExpiration();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const wrapperRef = useRef();
  const headerRef = useRef();

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const data =
    stats.dailyVisitors?.map((item) => {
      const date = new Date(item.date);
      const day = date.getDay();
      return {
        name: dayNames[day],
        value: item.count,
      };
    }) || [];

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

        const statsResponse = await axios.get(
          `${API_BASE_URL}/get-stats?config_id=${configResponse.data.config_id}`,
          { withCredentials: true }
        );

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        } else {
          setError("Không thể lấy thống kê cho config_id này.");
        }
      } else {
        setError("Không tìm thấy config_id. Vui lòng chọn website.");
        return;
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

  const statsDeltaValue = (title, isUp) => {
    if (title === "Khách Truy Cập") {
      const today = stats.visitorsToday;
      const last7 = stats.visitorsLast7Days;
      const delta = today - (last7 - today); // So sánh với 6 ngày trước
      return isUp
        ? delta > 0
          ? Math.round(delta)
          : 0
        : delta < 0
        ? Math.round(Math.abs(delta))
        : 0;
    }

    if (title === "Số Lần Xem Trang") {
      const today = stats.pageViewsToday;
      const last7 = stats.pageViewsLast7Days;
      const delta = today - last7; // So sánh trực tiếp với tổng 7 ngày
      return isUp
        ? delta > 0
          ? Math.round(delta)
          : 0
        : delta < 0
        ? Math.round(Math.abs(delta))
        : 0;
    }

    if (title === "Cuộc Trò Chuyện") {
      const today = stats.conversationsAnswered + stats.conversationsMissed;
      const last7 = stats.conversationsLast7Days || 0;
      const delta = today - last7;
      return isUp
        ? delta > 0
          ? Math.round(delta)
          : 0
        : delta < 0
        ? Math.round(Math.abs(delta))
        : 0;
    }

    return 0;
  };

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
            triggerTokenExpiration(); // Kích hoạt thông báo khi lỗi 401
          }
        });
    }
  };

  const handleCloseSnackbar = () => {
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

  const calculateDelta = (daily) => {
    if (!daily || daily.length < 2) return "+0.0%";
    const today = daily[daily.length - 1]?.count || 0;
    const yesterday = daily[daily.length - 2]?.count || 0;
    if (yesterday === 0) return "+0.0%";
    const percentage = ((today - yesterday) / yesterday) * 100;
    const isIncrease = percentage >= 0;
    return `${isIncrease ? "↑" : "↓"}${Math.abs(percentage).toFixed(1)}%`;
  };

  const getMinMaxInfo = (data) => {
    if (!data || data.length === 0) return "";

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const todayValue = data[data.length - 1]?.value;

    if (todayValue === max) return "📈 Cao nhất 7 ngày";
    if (todayValue === min) return "📉 Thấp nhất 7 ngày";
    return "";
  };

  const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const uniqueVisits = [];
  const seenSessionIds = new Set();

  (stats.visitHistory || []).forEach((visit) => {
    if (
      isToday(visit.timestamp) &&
      !seenSessionIds.has(visit.chat_session_id)
    ) {
      seenSessionIds.add(visit.chat_session_id);
      uniqueVisits.push(visit);
    }
  });

  const todayVisits = uniqueVisits.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const paginatedVisits = todayVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(todayVisits.length / itemsPerPage);

  return (
    <div className={cx("wrapper")} ref={wrapperRef}>
      <Box className={cx("title_header")} ref={headerRef}>
        <Box>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Tổng quan</div>
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
              borderColor: "var(--layer_background)",
              color: "var(--layer_background)",
              height: 40,
              px: 2,
              "&:hover": {
                borderColor: "var(--layer_background) !important",
                backgroundColor: "transparent",
              },
              "&.Mui-focused": {
                borderColor: "var(--layer_background)",
              },
              "&:focus": {
                borderColor: "var(--layer_background)",
              },
            }}
          >
            Thêm Website
          </Button>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel
              sx={{
                fontSize: "14px",
                color: "var(--layer_background) !important",
              }}
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
                  sx={{
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "#f1f1f1",
                    },
                  }}
                >
                  {w.domain}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Biểu đồ tăng trưởng truy cập */}
              <Grid
                item
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Paper sx={{ p: 2, borderRadius: 2, width: "49%" }}>
                  <Typography fontWeight="bold" fontSize={16} mb={2}>
                    Lượt truy cập trực tuyến
                  </Typography>
                  <ResponsiveContainer sx={{ width: "100%" }} height={300}>
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0abfbc"
                        strokeWidth={2}
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="name" style={{ fontSize: 14 }} />
                      <YAxis style={{ fontSize: 14 }} />
                      <Tooltip contentStyle={{ fontSize: 14 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>

                <Grid
                  container
                  spacing={2}
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    width: "48%",
                  }}
                >
                  {[
                    {
                      title: "Khách Truy Cập",
                      value: stats.visitorsToday,
                      delta: calculateDelta(
                        stats.visitorsToday,
                        stats.visitorsLast7Days
                      ),
                      minMaxLabel: `7 ngày qua ↑${stats.visitorsLast7Days}↓0`,
                      icon: (
                        <Person sx={{ color: "green", fontSize: 20, mr: 1 }} />
                      ),
                      color: "green",
                    },
                    {
                      title: "Cuộc Trò Chuyện",
                      value: (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <p style={{ fontSize: "12px", marginTop: "8px" }}>
                              Đã trả lời
                            </p>
                            <Typography fontSize={36} mr={2}>
                              {stats.conversationsAnswered}
                            </Typography>
                          </Box>
                          <Box>
                            <p style={{ fontSize: "12px", marginTop: "8px" }}>
                              Đã bỏ lỡ
                            </p>
                            <Typography fontSize={36}>
                              {stats.conversationsMissed}
                            </Typography>
                          </Box>
                        </Box>
                      ),
                      delta: calculateDelta(
                        stats.conversationsAnswered,
                        stats.conversationsAnswered + stats.conversationsMissed
                      ),
                      minMaxLabel: `7 ngày qua ↑${
                        stats.conversationsAnswered + stats.conversationsMissed
                      }↓0`,
                      icon: (
                        <Chat sx={{ color: "#D81B60", fontSize: 20, mr: 1 }} />
                      ),
                      color: "#D81B60",
                    },
                    {
                      title: "Số Lần Xem Trang",
                      value: stats.pageViewsToday,
                      delta: calculateDelta(
                        stats.pageViewsToday,
                        stats.pageViewsLast7Days
                      ),
                      minMaxLabel: `7 ngày qua ↑${stats.pageViewsLast7Days}↓0`,
                      icon: (
                        <Visibility
                          sx={{ color: "#F44336", fontSize: 20, mr: 1 }}
                        />
                      ),
                      color: "#F44336",
                    },
                  ].map((item, idx) => (
                    <Grid item key={idx} sx={{ width: "48%" }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box>
                            <Typography
                              fontWeight="bold"
                              fontSize={16}
                              sx={{
                                color: "var(--c_letter)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {item.icon} {item.title}
                            </Typography>
                            <Box
                              sx={{
                                fontSize: 36,
                                fontWeight: "bold",
                                marginLeft: "20px",
                              }}
                            >
                              {item.title !== "Cuộc Trò Chuyện" && (
                                <p
                                  style={{
                                    color: "var(--c_letter)",
                                    fontSize: 12,
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                  }}
                                >
                                  Hôm nay
                                </p>
                              )}
                              {item.value}
                            </Box>
                            {item.delta && (
                              <Box
                                mt={1}
                                fontSize={14}
                                display="flex"
                                alignItems="center"
                                gap={2} // giúp giãn cách 2 giá trị ↑ ↓
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  color="black"
                                >
                                  7 ngày qua
                                </Box>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  color="green"
                                >
                                  <ArrowDropUp fontSize="small" />
                                  {statsDeltaValue(item.title, true)}{" "}
                                  {/* Số tăng */}
                                </Box>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  color="red"
                                >
                                  <ArrowDropDown fontSize="small" />
                                  {statsDeltaValue(item.title, false)}{" "}
                                  {/* Số giảm */}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              width="100%"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                height: 500,
              }}
            >
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Typography fontWeight="bold" fontSize={18} mb={2}>
                    Lịch sử truy cập
                  </Typography>
                  <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: 13,
                              backgroundColor: "#f5f5f5",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            Chat Session ID
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: 13,
                              backgroundColor: "#f5f5f5",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            Số lần truy cập
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: 13,
                              backgroundColor: "#f5f5f5",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            Thời gian
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: 13,
                              backgroundColor: "#f5f5f5",
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                            }}
                          >
                            Website
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedVisits.map((visit, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: 12 }}>
                              {visit.chat_session_id}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {visit.visit_count}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {new Date(visit.timestamp).toLocaleString(
                                "vi-VN",
                                {
                                  timeZone: "Asia/Ho_Chi_Minh",
                                }
                              )}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {visit.domain || visit.website || "-"}
                            </TableCell>{" "}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={1}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        sx={{ mx: 1, fontSize: "12px" }}
                      >
                        Trang trước
                      </Button>
                      <Typography sx={{ fontSize: "14px", mt: 1.2 }}>
                        Trang {currentPage} / {totalPages}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        sx={{ mx: 1, fontSize: "12px" }}
                      >
                        Trang sau
                      </Button>
                    </Box>
                  )}

                  {(!stats.visitHistory || stats.visitHistory.length === 0) && (
                    <Typography
                      sx={{ textAlign: "center", color: "#aaa", mt: 2 }}
                    >
                      Không có dữ liệu lịch sử truy cập.
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Grid>
          </>
        )}
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%", fontSize: "12px" }}
        >
          Lưu cấu hình thành công!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManagePage;
