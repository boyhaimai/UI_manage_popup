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
  Pagination,
  Grid,
  Button,
  IconButton,
  InputAdornment,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useTokenExpiration } from "~/contexts/TokenExpirationContext/TokenExpirationContext";

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
  const [limit] = useState(1999);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const wrapperRef = useRef();
  const headerRef = useRef();
  const { triggerTokenExpiration } = useTokenExpiration();

  // Lấy idConfig và domain
  const fetchConfigAndDomain = async () => {
    try {
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
        return;
      }

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
      if (err.response?.status === 401) {
        triggerTokenExpiration();
      }
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
      console.log("API Response:", { fetchedMessages, total }); // Debug API response
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
          domain: msg.domain || domain,
        });
      });

      for (const sessionId in organizedMessages) {
        organizedMessages[sessionId].sort(
          (a, b) => new Date(a.inserted_at) - new Date(b.inserted_at)
        );
      }

      setMessagesBySession(organizedMessages);
      const actualConversationCount = Object.keys(organizedMessages).length;
      console.log("Actual Conversations:", actualConversationCount); // Debug số lượng hội thoại
      setTotalConversations(actualConversationCount); // Sử dụng số lượng thực tế
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử:", err);
      setError(err.response?.data?.message || "Lỗi server.");
      if (err.response?.status === 401) {
        triggerTokenExpiration();
      }
      setMessagesBySession({});
      setTotalConversations(0);
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

  // Xử lý bộ lọc ngày
  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const handleFilterDateChange = (event) => {
    const date = event.target.value;
    setFilterDate(date);
    if (date) {
      const [year, month, day] = date.split("-");
      setYear(year);
      setMonth(parseInt(month, 10));
      setDay(parseInt(day, 10));
    } else {
      setYear("");
      setMonth("");
      setDay("");
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    setFetching(true);
    handleCloseFilterDialog();
  };

  const handleResetFilter = () => {
    setYear("");
    setMonth("");
    setDay("");
    setFilterDate("");
    setPage(1);
    setSearch("");
    setSearchInput("");
    setFetching(true);
  };

  // Xử lý mở/đóng dialog lịch sử
  const handleOpenDialog = (sessionId) => {
    setSelectedSessionId(sessionId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSessionId("");
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
      <AppBar position="static" className={cx("title_header")} ref={headerRef}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/manage_page")}
          >
            <ArrowBackIcon sx={{ fontSize: 26 }} />
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
              sx={{
                mt: 1,
                fontSize: 14,
                "& .MuiOutlinedInput-root": {
                  color: "var(--layer_background)",
                  "& fieldset": {
                    borderColor: "var(--layer_background)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--layer_background)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--layer_background)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--layer_background)",
                  fontSize: 14,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--layer_background)",
                },
              }}
              InputProps={{
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon
                        sx={{
                          fontSize: "15px",
                          color: "var(--layer_background)",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { fontSize: 14 },
              }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                fontSize: 14,
                height: "100%",
                padding: "6px 16px",
                bgcolor: "var(--layer_background)",
                "&:hover": {
                  bgcolor: "var(--layer_background)", // hoặc darken bằng color lib nếu muốn
                  opacity: 0.9,
                },
                textTransform: "none",
                color: "var(--c_letter)",
              }}
              disabled={fetching || !searchInput.trim()}
            >
              Tìm kiếm
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              onClick={handleOpenFilterDialog}
              startIcon={<FilterAltIcon />}
              sx={{
                fontSize: 14,
                height: "100%",
                padding: "6px 16px",
                borderColor: "var(--layer_background)",
                color: "var(--layer_background)",
                textTransform: "none",
                "&:hover": {
                  borderColor: "var(--layer_background)",
                  backgroundColor: "rgba(0,0,0,0.04)", // hoặc rgba phù hợp
                },
              }}
            >
              Lọc
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              onClick={handleResetFilter}
              sx={{
                fontSize: 14,
                height: "100%",
                padding: "6px 16px",
                borderColor: "var(--layer_background)",
                color: "var(--layer_background)",
                textTransform: "none",
                "&:hover": {
                  borderColor: "var(--layer_background)",
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Dialog lọc ngày */}
        <Dialog
          open={openFilterDialog}
          onClose={handleCloseFilterDialog}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              p: 2,
              minWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
            Chọn ngày lọc
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Chọn ngày"
              type="date"
              value={filterDate}
              onChange={handleFilterDateChange}
              fullWidth
              InputLabelProps={{ shrink: true, sx: { fontSize: 14 } }}
              sx={{ mt: 2 }}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseFilterDialog}
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
              onClick={handleApplyFilter}
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
              Áp dụng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Số lượng hội thoại */}
        <Typography
          sx={{
            mb: 2,
            fontSize: 18,
            fontWeight: "bold",
            color: "var(--layer_background)",
          }}
        >
          Có {Object.keys(messagesBySession).length} hội thoại
        </Typography>

        {/* Danh sách hội thoại */}
        {Object.keys(messagesBySession).length === 0 ? (
          <Typography sx={{ fontSize: 14 }}>
            Không có hội thoại nào để hiển thị.
          </Typography>
        ) : (
          <Paper sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="conversation list table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", fontSize: 14, width: "30%" }}
                  >
                    ID Hội thoại
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", fontSize: 14, width: "30%" }}
                  >
                    Thời gian
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", fontSize: 14, width: "40%" }}
                  >
                    Website
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(messagesBySession).map((sessionId) => {
                  const latestMessage = messagesBySession[sessionId].reduce(
                    (latest, msg) =>
                      new Date(msg.inserted_at) > new Date(latest.inserted_at)
                        ? msg
                        : latest,
                    messagesBySession[sessionId][0]
                  );
                  return (
                    <TableRow
                      key={sessionId}
                      onClick={() => handleOpenDialog(sessionId)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <TableCell sx={{ fontSize: 14, width: "30%" }}>
                        {sessionId}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14, width: "30%" }}>
                        {latestMessage.inserted_at}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14, width: "40%" }}>
                        {latestMessage.domain}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Phân trang */}
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

        {/* Dialog hiển thị lịch sử tin nhắn */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "12px", p: 1 },
          }}
        >
          <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
            Lịch sử hội thoại - Chat Session ID: {selectedSessionId}
          </DialogTitle>
          <DialogContent>
            {selectedSessionId && messagesBySession[selectedSessionId] ? (
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
                  {messagesBySession[selectedSessionId].map((msg, index) => (
                    <TableRow key={`${msg.sessionId}-${index}`}>
                      <TableCell sx={{ fontSize: 14 }}>
                        {msg.sessionId}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>
                        {msg.inserted_at}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{msg.message}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>
                        {msg.sender === "bot" ? "Bot" : "User"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{msg.domain}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ fontSize: 14 }}>
                Không có tin nhắn để hiển thị.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                fontSize: 13,
                color: "#1e1e1e",
                textTransform: "none",
                "&:hover": { bgcolor: "#f0f2f5" },
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}

export default DetailConversation;
