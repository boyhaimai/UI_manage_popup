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
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

function DetailConversation({ idConfig, domain }) {
  const [messagesBySession, setMessagesBySession] = useState({});
  const [totalConversations, setTotalConversations] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // Số hội thoại mỗi trang
  const [search, setSearch] = useState(""); // Giá trị tìm kiếm thực sự để gửi request
  const [searchInput, setSearchInput] = useState(""); // Giá trị tạm thời của ô nhập liệu
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false); // Thêm trạng thái để theo dõi tải dữ liệu khi tìm kiếm hoặc phân trang
  const [error, setError] = useState("");

  // Tạo danh sách năm, tháng, ngày hợp lệ
  const currentDate = new Date();
  const years = ["", ...Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i)];
  const getMaxDays = (y, m) => {
    return new Date(y || currentDate.getFullYear(), m || currentDate.getMonth() + 1, 0).getDate();
  };
  const months = ["", ...Array.from({ length: 12 }, (_, i) => i + 1)];
  const days = year && month ? Array.from({ length: getMaxDays(year, month) }, (_, i) => i + 1) : [""];

  // Hàm lấy lịch sử hội thoại
  const fetchHistory = async () => {
    try {
      setFetching(true);
      console.log("Fetching history with idConfig:", idConfig, "search:", search);
      const historyResponse = await axios.get(
        `https://ai.bang.vawayai.com:5000/get-history-admin`,
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
      console.log("Fetched messages:", fetchedMessages);

      // Tổ chức dữ liệu theo chat_session_id
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

      // Sắp xếp tin nhắn trong mỗi session theo thời gian
      for (const sessionId in organizedMessages) {
        organizedMessages[sessionId].sort(
          (a, b) => new Date(a.inserted_at) - new Date(b.inserted_at)
        );
      }

      setMessagesBySession(organizedMessages);
      setTotalConversations(Object.keys(organizedMessages).length);
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử:", err);
      setError(err.message || "Lỗi server.");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  // Gọi API khi thay đổi page, search, hoặc bộ lọc
  useEffect(() => {
    fetchHistory();
  }, [idConfig, page, search, year, month, day]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
    setFetching(true); // Bắt đầu tải khi chuyển trang
  };

  // Xử lý nhập liệu vào ô tìm kiếm
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value); // Chỉ cập nhật giá trị tạm thời
  };

  // Xử lý khi nhấn nút tìm kiếm hoặc Enter
  const handleSearch = () => {
    setSearch(searchInput.trim()); // Loại bỏ khoảng trắng thừa và cập nhật giá trị tìm kiếm
    setPage(1); // Reset về trang 1
    setFetching(true); // Bắt đầu tải khi tìm kiếm
  };

  // Xử lý khi nhấn nút Clear
  const handleClearSearch = () => {
    setSearchInput(""); // Xóa ô nhập liệu
    setSearch(""); // Đặt lại giá trị tìm kiếm để hiển thị tất cả tin nhắn
    setPage(1); // Reset về trang 1
    setFetching(true); // Bắt đầu tải khi xóa tìm kiếm
  };

  // Xử lý khi nhấn Enter
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
    setFetching(true); // Bắt đầu tải khi thay đổi năm
  };

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setMonth(newMonth);
    setDay("");
    setPage(1);
    setFetching(true); // Bắt đầu tải khi thay đổi tháng
  };

  const handleDayChange = (event) => {
    setDay(event.target.value);
    setPage(1);
    setFetching(true); // Bắt đầu tải khi thay đổi ngày
  };

  // Reset bộ lọc
  const handleResetFilter = () => {
    setYear("");
    setMonth("");
    setDay("");
    setPage(1);
    setFetching(true); // Bắt đầu tải khi reset bộ lọc
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
        <Typography color="error" sx={{ fontSize: 14 }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
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
                  <IconButton onClick={handleClearSearch} edge="end" size="small">
                    <ClearIcon sx={{ fontSize: "15px" }} />
                  </IconButton>
                </InputAdornment>
              ) : fetching ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
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
            sx={{ fontSize: 14, height: "100%", padding: "6px 16px", position: "relative" }}
          >
            {fetching ? <CircularProgress size={14} sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} /> : "Tìm kiếm"}
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
                endAdornment={fetching ? <CircularProgress size={20} sx={{ marginRight: 1 }} /> : null}
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
                endAdornment={fetching ? <CircularProgress size={20} sx={{ marginRight: 1 }} /> : null}
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
                endAdornment={fetching ? <CircularProgress size={20} sx={{ marginRight: 1 }} /> : null}
              >
                <MenuItem value="" sx={{ fontSize: 14}}>
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
            sx={{ fontSize: 14, height: "100%", padding: "6px 16px", position: "relative" }}
          >
            {fetching ? <CircularProgress size={14} sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} /> : "Reset"}
          </Button>
        </Grid>
      </Grid>

      {/* Số lượng hội thoại */}
      <Typography sx={{ mb: 2, fontSize: 14 }}>
        Tìm thấy {totalConversations} hội thoại
      </Typography>

      {/* Hiển thị tin nhắn theo chat_session_id */}
      {Object.keys(messagesBySession).length === 0 ? (
        <Typography sx={{ fontSize: 14 }}>Không có hội thoại nào để hiển thị.</Typography>
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
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>ID Hội thoại</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Tin nhắn</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                      Người gửi
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Website</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messagesBySession[sessionId].map((row, index) => (
                    <TableRow key={`${row.sessionId}-${index}`}>
                      <TableCell sx={{ fontSize: 14 }}>{row.sessionId}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{row.inserted_at}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{row.message}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>
                        {row.sender === "bot" ? "Bot" : "User"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{row.domain}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Divider sx={{ my: 2 }} />
          </Box>
        ))
      )}

      {/* Phân trang */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, position: "relative" }}>
        {fetching && <CircularProgress size={24} sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />}
        <Pagination
          count={Math.ceil(totalConversations / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{ "& .MuiPaginationItem-root": { fontSize: 14 }, opacity: fetching ? 0.5 : 1 }}
        />
      </Box>
    </Box>
  );
}

export default DetailConversation;