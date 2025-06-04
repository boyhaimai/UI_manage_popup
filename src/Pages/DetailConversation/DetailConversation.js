import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Grid,
  Divider,
  Button,
  IconButton,
  InputAdornment,
  AppBar,
  Toolbar,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

import classNames from "classnames/bind";
import styles from "./DetailConversation.module.scss";
const cx = classNames.bind(styles);

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function DetailConversation() {
  const navigate = useNavigate();
  const [idConfig, setIdConfig] = useState("");
  const [domain, setDomain] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const [totalConversations, setTotalConversations] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef();
  const headerRef = useRef();

  // Tạo danh sách năm, tháng, ngày
  const currentDate = new Date();
  const years = [
    "",
    ...Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i),
  ];
  const getMaxDays = (y, m) => {
    return new Date(
      y || currentDate.getFullYear(),
      m || currentDate.getMonth() + 1,
      0
    ).getDate();
  };
  const months = ["", ...Array.from({ length: 12 }, (_, i) => i + 1)];
  const days =
    year && month
      ? Array.from({ length: getMaxDays(year, month) }, (_, i) => i + 1)
      : [""];

  // Lấy idConfig và domain
  const fetchConfigAndDomain = async () => {
    try {
      // Lấy idConfig từ /get-selected-config
      const configResponse = await axios.get(
        `${API_BASE_URL}/get-selected-config`,
        {
          withCredentials: true,
        }
      );
      if (configResponse.data.success && configResponse.data.config_id) {
        setIdConfig(configResponse.data.config_id);
      } else {
        setError("Không tìm thấy config_id. Vui lòng chọn website.");
        navigate("/");
        return;
      }

      // Lấy domain từ /get-websites
      const websiteResponse = await axios.get(`${API_BASE_URL}/get-websites`, {
        withCredentials: true,
      });
      if (websiteResponse.data.success && websiteResponse.data.websites) {
        const website = websiteResponse.data.websites.find(
          (w) => w.config_id === configResponse.data.config_id
        );
        if (website) {
          setDomain(website.domain);
        } else {
          setError("Không tìm thấy website cho config_id này.");
        }
      } else {
        setError("Không thể lấy danh sách website.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lấy thông tin.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch sử hội thoại
  const fetchHistory = async () => {
    if (!idConfig || !domain) return;
    try {
      setFetching(true);
      const historyResponse = await axios.get(
        `${API_BASE_URL}/get-history-admin`,
        {
          params: {
            id_config: idConfig,
            page,
            limit,
            search: search || undefined,
            year: year || undefined,
            month: month || undefined,
            day: day || undefined,
          },
          withCredentials: true,
        }
      );

      if (!historyResponse.data.success) {
        throw new Error(historyResponse.data.message || "Lỗi khi lấy lịch sử.");
      }

      const { messages: fetchedMessages, total } = historyResponse.data;
      const organizedMessages = {};
      fetchedMessages.forEach((msg) => {
        const sessionId = msg.sessionId;
        if (!organizedMessages[sessionId]) {
          organizedMessages[sessionId] = [];
        }
        organizedMessages[sessionId].push({
          sessionId: sessionId,
          inserted_at: new Date(msg.timestamp).toLocaleString(),
          message: msg.message,
          sender: msg.sender,
          domain: domain,
        });
      });

      for (const sessionId in organizedMessages) {
        organizedMessages[sessionId].sort(
          (a, b) => new Date(a.inserted_at) - new Date(b.inserted_at)
        );
      }

      setMessagesBySession(organizedMessages);
      setTotalConversations(total);
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử:", err);
      setError(err.response?.data?.message || "Lỗi server.");
    } finally {
      setFetching(false);
    }
  };

  // Gọi API khi tải trang
  useEffect(() => {
    fetchConfigAndDomain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gọi lịch sử khi có idConfig và domain
  useEffect(() => {
    if (idConfig && domain) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idConfig, domain, page, search, year, month, day]);

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

  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
    setFetching(true);
  };

  // Xử lý tìm kiếm
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
    setFetching(true);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    setFetching(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Xử lý bộ lọc thời gian
  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setYear(newYear);
    setMonth("");
    setDay("");
    setPage(1);
    setFetching(true);
  };

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setMonth(newMonth);
    setDay("");
    setPage(1);
    setFetching(true);
  };

  const handleDayChange = (event) => {
    setDay(event.target.value);
    setPage(1);
    setFetching(true);
  };

  const handleResetFilter = () => {
    setYear("");
    setMonth("");
    setDay("");
    setPage(1);
    setFetching(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" sx={{ fontSize: 14 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <div className={cx("wrapper")} ref={wrapperRef}>
      {/* Header */}
      <AppBar
        position="static"       
        className={cx("title_header")}
        ref={headerRef}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/manage_page")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: 16 }}
            className={cx("title")}
          >
            Chi tiết hội thoại - {domain}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, mt: 8 }}>
        {/* Thanh tìm kiếm và bộ lọc */}
        <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Tìm theo domain hoặc ID hội thoại"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ fontSize: 14 }}
              InputProps={{
                sx: { fontSize: 14 },
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon sx={{ fontSize: "15px" }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ fontSize: 14, height: "100%", padding: "6px 16px" }}
              disabled={fetching}
            >
              Tìm kiếm
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={1}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: "8px",
                backgroundColor: "#f5f5f5",
                "&:hover": { backgroundColor: "#ececec" },
              }}
            >
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel sx={{ fontSize: 14 }}>Năm</InputLabel>
                <Select
                  value={year}
                  onChange={handleYearChange}
                  label="Năm"
                  sx={{
                    fontSize: 14,
                    "& .MuiSelect-select": { py: 1 },
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 14 }}>
                    Tất cả
                  </MenuItem>
                  {years.map((y) => (
                    <MenuItem key={y} value={y} sx={{ fontSize: 14 }}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 80 }} disabled={!year}>
                <InputLabel sx={{ fontSize: 14 }}>Tháng</InputLabel>
                <Select
                  value={month}
                  onChange={handleMonthChange}
                  label="Tháng"
                  sx={{
                    fontSize: 14,
                    "& .MuiSelect-select": { py: 1 },
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 14 }}>
                    Tất cả
                  </MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontSize: 14 }}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 80 }} disabled={!month}>
                <InputLabel sx={{ fontSize: 14 }}>Ngày</InputLabel>
                <Select
                  value={day}
                  onChange={handleDayChange}
                  label="Ngày"
                  sx={{
                    fontSize: 14,
                    "& .MuiSelect-select": { py: 1 },
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 14 }}>
                    Tất cả
                  </MenuItem>
                  {days.map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: 14 }}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              onClick={handleResetFilter}
              sx={{ fontSize: 14, height: "100%", padding: "6px 16px" }}
              disabled={fetching}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Số lượng tin nhắn */}
        <Typography sx={{ mb: 2, fontSize: 18, fontWeight: "bold" }}>
         Có {Object.keys(messagesBySession).length} hội thoại
        </Typography>

        {/* Hiển thị tin nhắn */}
        {Object.keys(messagesBySession).length === 0 ? (
          <Typography sx={{ fontSize: 14 }}>
            Không có tin nhắn nào để hiển thị.
          </Typography>
        ) : (
          Object.keys(messagesBySession).map((sessionId) => (
            <Box key={sessionId} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontSize: 14 }}>
                Chat Session ID: {sessionId}
              </Typography>
              <Paper sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 650 }} aria-label="chat history table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        ID Hội thoại
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Thời gian
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Tin nhắn
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Người gửi
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Website
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messagesBySession[sessionId].map((msg, index) => (
                      <TableRow key={`${msg.sessionId}-${index}`}>
                        <TableCell sx={{ fontSize: 14 }}>
                          {msg.sessionId}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>
                          {msg.inserted_at}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>
                          {msg.message}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>
                          {msg.sender === "bot" ? "Bot" : "User"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>
                          {msg.domain}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
              <Divider sx={{ my: 2 }} />
            </Box>
          ))
        )}

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={Math.ceil(totalConversations / limit)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{ "& .MuiPaginationItem-root": { fontSize: 14 } }}
            disabled={fetching}
          />
        </Box>
      </Box>
    </div>
  );
}

export default DetailConversation;
