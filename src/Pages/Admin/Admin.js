import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Chip as Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Typography,
  Box,
  TextField,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import classNames from "classnames/bind";
import {
  ChevronDown,
  Users,
  UserCheck,
  Shield,
  EllipsisVertical,
  Ban,
  LockOpen,
} from "lucide-react";

import styles from "./admin.module.scss";
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  KeyboardArrowRight,
  RadioButtonChecked,
  Search,
} from "@mui/icons-material";
import axios from "axios";

const cx = classNames.bind(styles);

const API_BASE_URL = "http://localhost:5000"; // hoặc localhost:5000

const roleMap = {
  admin: { label: "Admin", icon: Shield, color: "error" },
  user: { label: "User", icon: UserCheck, color: "primary" },
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_accounts: 0,
    total_admin: 0,
    total_user: 0,
    total_banned: 0,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const wrapperRef = useRef();
  const headerRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [roleRequest, setRoleRequest] = useState(null);

  const rowsPerPage = 10;

  const fetchAdminData = async (page = 0, searchTerm = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/admin-info`, {
        params: { page, limit: rowsPerPage, search: searchTerm },
        withCredentials: true,
      });

      const data = response.data?.[0]?.result;
      if (data) {
        setUsers(data.accounts || []);
        setStats({
          total_accounts: data.total_accounts,
          total_admin: data.total_admin,
          total_user: data.total_user,
          total_banned: data.total_banned,
        });
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy admin info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // lần đầu mount
  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // khi đổi page
  useEffect(() => {
    fetchAdminData(page, searchTerm);
  }, [page, searchTerm]);

  useEffect(() => {
    if (pendingRole) {
      const updateRole = async () => {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/admin/set-role`, {
            id: pendingRole.userId,
            role: pendingRole.role,
          });
          setSnackbar({
            open: true,
            message: res.data.message,
            severity: "success",
          });
          fetchAdminData();
        } catch (err) {
          setSnackbar({
            open: true,
            message: "Lỗi khi cập nhật quyền!",
            severity: "error",
          });
        } finally {
          setPendingRole(null);
        }
      };
      updateRole();
    }
  }, [pendingRole]);

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

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const name = u.name_customer || ""; // API trả về name_customer
    const phone = u.phone || "";
    const roleInfo = roleMap[u.role] || {};
    const roleLabel = roleInfo.label ? roleInfo.label.toLowerCase() : "";

    return (
      name.toLowerCase().includes(term) ||
      phone.includes(term) ||
      roleLabel.includes(term)
    );
  });

  const paginatedUsers = users; // server đã trả đúng dữ liệu từng trang

  const totalPages = Math.ceil(stats.total_accounts / rowsPerPage);

  const handleMoreMenuOpen = (event, user) => {
    setMoreAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchorEl(null);
    // setSelectedUser(null);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchorEl(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/delete-account/${selectedUser.id}`
      );
      setSnackbar({
        open: true,
        message: "Đã xoá tài khoản",
        severity: "success",
      });
      setOpenDeleteDialog(false);
      fetchAdminData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi khi xoá tài khoản!",
        severity: "error",
      });
    }
  };

  const handleExtendExpire = async (label) => {
    if (!selectedUser) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/extend-expire`, {
        id: selectedUser.id,
        label,
      });

      // Hiển thị thông báo từ server
      setSnackbar({
        open: true,
        message: res.data.message || "Đã gia hạn",
        severity: res.data.success ? "success" : "info",
      });

      // Reload lại dữ liệu bảng
      fetchAdminData();
    } catch (err) {
      console.error("❌ Lỗi gia hạn:", err);
      setSnackbar({
        open: true,
        message: "Lỗi khi gia hạn tài khoản!",
        severity: "error",
      });
    } finally {
      // Đóng các menu phụ
      handleSubMenuClose();
      handleMoreMenuClose();
    }
  };

  const totalUsers = users.length;

  return (
    <div className={cx("wrapper")} ref={wrapperRef}>
      {/* Header responsive: title left, controls collapse into menu on mobile */}
      <Box
        className={cx("title_header")}
        ref={headerRef}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          px: 0,
        }}
      >
        {/* Title luôn hiện */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "20px",
            color: "white",
            ml: 2,
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>
      <div
        style={{ minHeight: "100vh", padding: "24px", marginTop: "50px" }}
        className={cx("container")}
      >
        <div style={{ width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div>
              <Typography variant="body2" color="white">
                Quản lý người dùng và phân quyền
              </Typography>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={18} color="white" />
              <Typography variant="body2" color="white">
                Tổng số tài khoản: {totalUsers}
              </Typography>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <Card>
              <CardHeader
                title="Tổng tài khoản"
                titleTypographyProps={{ fontSize: 22, fontWeight: "bold" }}
              />
              <CardContent>
                <Typography variant="h5">{stats.total_accounts}</Typography>
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ fontSize: 14 }}
                >
                  Tổng số tài khoản hệ thống
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Admin"
                titleTypographyProps={{ fontSize: 22, fontWeight: "bold" }}
              />
              <CardContent>
                <Typography variant="h5">{stats.total_admin}</Typography>
                <Typography variant="caption" sx={{ fontSize: 14 }}>
                  Quyền cao nhất
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="User"
                titleTypographyProps={{ fontSize: 22, fontWeight: "bold" }}
              />
              <CardContent>
                <Typography variant="h5">{stats.total_user}</Typography>
                <Typography variant="caption" sx={{ fontSize: 14 }}>
                  Tài khoản người dùng
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Account bị chặn"
                titleTypographyProps={{ fontSize: 22, fontWeight: "bold" }}
              />
              <CardContent>
                <Typography variant="h5">{stats.total_banned}</Typography>
                <Typography variant="caption" sx={{ fontSize: 14 }}>
                  Account Block
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Box
            sx={{ display: "flex", flexDirection: "column", height: " 100%" }}
          >
            <Card
              sx={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                height: "auto",
                marginBottom: "100px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexDirection: { xs: "column", sm: "row" }, // 👈 mobile xuống dòng
                  gap: { xs: 2, sm: 0 }, // thêm khoảng cách khi column
                }}
              >
                <CardHeader
                  title="Danh sách người dùng"
                  subheader="Quản lý thông tin và phân quyền cho từng tài khoản"
                  titleTypographyProps={{ fontSize: 20, fontWeight: "bold" }}
                  subheaderTypographyProps={{
                    fontSize: 16,
                    color: "text.secondary",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    mr: 2,
                  }}
                >
                  <TextField
                    className={cx("search_input")}
                    size="small"
                    variant="outlined"
                    placeholder="Tìm kiếm..."
                    value={searchInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchInput(val);
                      if (val === "") {
                        // ✅ Khi xoá hết input → reset & tải lại danh sách gốc
                        setSearchTerm("");
                        setPage(0);
                        fetchAdminData(0, "");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // ✅ Khi nhấn Enter để tìm
                        setSearchTerm(searchInput);
                        setPage(0);
                        fetchAdminData(0, searchInput);
                      }
                    }}
                    sx={{ width: 250, borderRadius: "10px" }}
                    InputProps={{
                      endAdornment: searchInput && (
                        <Button
                          onClick={() => {
                            // ✅ Khi bấm nút ❌ → clear & tải lại danh sách gốc
                            setSearchInput("");
                            setSearchTerm("");
                            setPage(0);
                            fetchAdminData(0, "");
                          }}
                          sx={{ minWidth: "30px" }}
                        >
                          <Close fontSize="10px" />
                        </Button>
                      ),
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={() => {
                      setPage(0);
                      fetchAdminData(0, searchInput);
                    }}
                    sx={{
                      minWidth: "40px",
                      borderRadius: "8px",
                      background: "var(--b_liner)",
                    }}
                  >
                    <Search fontSize="small" />
                  </Button>
                </Box>
              </Box>
              <CardContent sx={{ flex: 1, overflowY: "auto", padding: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{ background: "var(--c_header_table) !important" }}
                    >
                      <TableCell className={cx("title_table")}>
                        Trạng thái
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Tên người dùng
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Số điện thoại
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Thời gian tạo
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Thời gian hết hạn
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Vai trò
                      </TableCell>
                      <TableCell className={cx("title_table")}>
                        Thao tác
                      </TableCell>
                      <TableCell className={cx("title_table")}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      "& .MuiTableRow-root:hover": {
                        background: "#f9fafb",
                        cursor: "pointer",
                      },
                    }}
                  >
                    {paginatedUsers.map((user) => {
                      const roleInfo = roleMap[user.role] || roleMap["user"];

                      const IconComponent = roleInfo.icon;
                      return (
                        <TableRow key={user.id}>
                          <TableCell align="center">
                            {user.expire_at === "0" ? (
                              <RadioButtonChecked
                                sx={{ color: "green", fontSize: "20px" }}
                              />
                            ) : new Date(user.expire_at) > new Date() ? (
                              <RadioButtonChecked
                                sx={{ color: "green", fontSize: "20px" }}
                              />
                            ) : (
                              <RadioButtonChecked
                                sx={{ color: "red", fontSize: "20px" }}
                              />
                            )}
                          </TableCell>
                          <TableCell className={cx("item_table")}>
                            {user.name_customer}
                          </TableCell>
                          <TableCell className={cx("item_table")}>
                            {user.phone}
                          </TableCell>
                          <TableCell className={cx("item_table")}>
                            {new Date(user.created_at).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </TableCell>

                          <TableCell className={cx("item_table")}>
                            {user.expire_at === "0"
                              ? "Vô hạn"
                              : new Date(user.expire_at).toLocaleString(
                                  "vi-VN",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )}
                          </TableCell>

                          <TableCell className={cx("item_table")}>
                            <Badge
                              label={roleInfo.label}
                              color={roleInfo.color}
                              icon={<IconComponent size={14} />}
                              variant="outlined"
                              sx={{ fontSize: "17px" }}
                            />
                          </TableCell>
                          <TableCell className={cx("item_table")}>
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<ChevronDown size={16} />}
                              onClick={(e) => handleMenuOpen(e, user)}
                              sx={{
                                textTransform: "none",
                                outline: "none",
                                fontSize: "17px",
                              }}
                            >
                              Đổi vai trò
                            </Button>
                          </TableCell>
                          <TableCell className={cx("item_table")}>
                            <EllipsisVertical
                              size={16}
                              onClick={(e) => handleMoreMenuOpen(e, user)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  {/* More menu đặt ngoài map */}
                  <Menu
                    anchorEl={moreAnchorEl}
                    open={Boolean(moreAnchorEl)}
                    onClose={handleMoreMenuClose}
                  >
                    {/* Gia hạn có submenu */}
                    <MenuItem
                      onClick={(e) => setSubMenuAnchorEl(e.currentTarget)}
                    >
                      <LockOpen
                        style={{ marginRight: "8px", fontSize: "20px" }}
                      />
                      Gia hạn
                      <KeyboardArrowRight
                        fontSize="small"
                        style={{ marginLeft: "auto" }}
                      />
                    </MenuItem>

                    {/* Submenu */}
                    <Menu
                      anchorEl={subMenuAnchorEl}
                      open={Boolean(subMenuAnchorEl)}
                      onClose={handleSubMenuClose}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      MenuListProps={{
                        onMouseLeave: handleSubMenuClose,
                      }}
                    >
                      <MenuItem onClick={() => handleExtendExpire("2 tuần")}>
                        2 tuần
                      </MenuItem>
                      <MenuItem onClick={() => handleExtendExpire("3 tháng")}>
                        3 tháng
                      </MenuItem>
                      <MenuItem onClick={() => handleExtendExpire("6 tháng")}>
                        6 tháng
                      </MenuItem>
                      <MenuItem onClick={() => handleExtendExpire("9 tháng")}>
                        9 tháng
                      </MenuItem>
                      <MenuItem onClick={() => handleExtendExpire("1 năm")}>
                        1 năm
                      </MenuItem>
                    </Menu>

                    {/* Chặn tài khoản */}
                    <MenuItem>
                      <Ban style={{ marginRight: "8px", fontSize: "20px" }} />
                      Chặn tài khoản này
                      <Switch
                        checked={selectedUser?.is_ban === "true"}
                        onChange={async (e) => {
                          try {
                            const newStatus = e.target.checked;
                            await axios.post(
                              `${API_BASE_URL}/api/admin/set-ban`,
                              {
                                id: selectedUser.id,
                                is_ban: newStatus,
                              }
                            );
                            setSnackbar({
                              open: true,
                              message: newStatus
                                ? "Đã chặn tài khoản"
                                : "Đã bỏ chặn tài khoản",
                              severity: "info",
                            });
                            fetchAdminData();
                          } catch (err) {
                            setSnackbar({
                              open: true,
                              message: "Lỗi khi cập nhật trạng thái chặn!",
                              severity: "error",
                            });
                          }
                        }}
                        sx={{ ml: "auto" }}
                      />
                    </MenuItem>

                    <MenuItem
                      onClick={() => handleOpenDeleteDialog(selectedUser)}
                    >
                      <Delete
                        style={{ marginRight: "8px", fontSize: "20px" }}
                      />
                      Xóa tài khoản
                    </MenuItem>
                  </Menu>
                </Table>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <Typography fontSize={14} color="text.secondary">
                    Showing{" "}
                    {Math.min(
                      rowsPerPage,
                      filteredUsers.length - page * rowsPerPage
                    )}{" "}
                    of {filteredUsers.length}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      disabled={page === 0}
                      onClick={() => setPage((prev) => prev - 1)}
                      sx={{ minWidth: 32, p: "2px 8px", textTransform: "none" }}
                    >
                      <ChevronLeft sx={{ fontSize: 32 }} />
                    </Button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        size="small"
                        variant={i === page ? "contained" : "outlined"}
                        onClick={() => setPage(i)}
                        sx={{
                          minWidth: 32,
                          p: "2px 8px",
                          textTransform: "none",
                        }}
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      variant="contained"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((prev) => prev + 1)}
                      sx={{ minWidth: 32, p: "2px 8px", textTransform: "none" }}
                    >
                      <ChevronRight sx={{ fontSize: 32 }} />
                    </Button>
                  </Box>
                </Box>

                {/* Dropdown menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      setRoleRequest({
                        userId: selectedUser?.id,
                        role: "admin",
                      });
                      setOpenRoleDialog(true);
                    }}
                  >
                    <Shield size={16} style={{ marginRight: "8px" }} /> Admin
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setRoleRequest({
                        userId: selectedUser?.id,
                        role: "user",
                      });
                      setOpenRoleDialog(true);
                    }}
                  >
                    <UserCheck size={16} style={{ marginRight: "8px" }} /> User
                  </MenuItem>
                </Menu>
              </CardContent>
            </Card>
          </Box>
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
          >
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogContent>
              Bạn có chắc chắn muốn xoá tài khoản
              <strong> {selectedUser?.name_customer}</strong>(
              {selectedUser?.phone}) không?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleConfirmDelete}
              >
                Xoá
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openRoleDialog}
            onClose={() => setOpenRoleDialog(false)}
          >
            <DialogContent sx={{ fontSize: 25 }}>
              Bạn có chắc chắn muốn gán quyền
              <strong>
                {" "}
                {roleRequest?.role === "admin" ? "Admin" : "Quản lý"}{" "}
              </strong>
              cho tài khoản <strong>{selectedUser?.name_customer}</strong> (
              {selectedUser?.phone}) không?
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenRoleDialog(false)}
                sx={{ textTransform: "none" }}
              >
                Hủy
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  setPendingRole(roleRequest); // ✅ chỉ set khi confirm
                  setOpenRoleDialog(false);
                }}
                sx={{ textTransform: "none" }}
              >
                Xác nhận
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
