import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Block } from "@mui/icons-material";
import classNames from "classnames/bind";
import styles from "./ManageMessage.module.scss";

const cx = classNames.bind(styles);

export default function ChatUIClone() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]); // Thay selectedChat bằng selectedChats
  const [chatMessages, setChatMessages] = useState({}); // Lưu tin nhắn theo chatId
  const [adminMessages, setAdminMessages] = useState({}); // Lưu tin nhắn admin đang nhập cho từng chat
  const [isAdminChatting, setIsAdminChatting] = useState({}); // Trạng thái admin tham gia chat
  const [showScrollButtons, setShowScrollButtons] = useState({}); // Trạng thái nút cuộn
  const messagesEndRefs = useRef({}); // Ref cho từng chat
  const chatContainerRefs = useRef({});

  // Hàm cuộn đến tin nhắn mới nhất
  const scrollToBottom = (chatId) => {
    messagesEndRefs.current[chatId]?.scrollIntoView({ behavior: "smooth" });
  };

  // Theo dõi vị trí cuộn để hiển thị nút cuộn xuống
  useEffect(() => {
    const handleScroll = (chatId) => {
      const container = chatContainerRefs.current[chatId];
      const messagesEnd = messagesEndRefs.current[chatId];
      if (container && messagesEnd) {
        const containerRect = container.getBoundingClientRect();
        const messagesEndRect = messagesEnd.getBoundingClientRect();
        const distance = messagesEndRect.top - containerRect.bottom;
        setShowScrollButtons((prev) => ({
          ...prev,
          [chatId]: distance < -20,
        }));
      }
    };

    Object.keys(chatContainerRefs.current).forEach((chatId) => {
      const container = chatContainerRefs.current[chatId];
      if (container) {
        container.addEventListener("scroll", () => handleScroll(chatId));
        handleScroll(chatId); // Gọi lần đầu
      }
    });

    return () => {
      Object.keys(chatContainerRefs.current).forEach((chatId) => {
        const container = chatContainerRefs.current[chatId];
        if (container) {
          container.removeEventListener("scroll", () => handleScroll(chatId));
        }
      });
    };
  }, [selectedChats]);

  // Lấy danh sách active chats
  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        const response = await fetch("https://ai.bang.vawayai.com:5000/get-active-chats", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setActiveChats(data.activeChats);
        }
      } catch (err) {
        console.error("Lỗi khi lấy active chats:", err);
      }
    };

    fetchActiveChats();
    const interval = setInterval(fetchActiveChats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Lấy lịch sử chat cho từng cuộc trò chuyện được chọn
  useEffect(() => {
    selectedChats.forEach((chat) => {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(
            `https://ai.bang.vawayai.com:5000/get-history?userId=${
              chat.chatId
            }&domain=${encodeURIComponent(chat.domain)}`,
            { credentials: "include" }
          );
          const data = await response.json();
          if (data.success) {
            setChatMessages((prev) => ({
              ...prev,
              [chat.chatId]: data.messages,
            }));
          }
        } catch (err) {
          console.error(`Lỗi khi lấy lịch sử chat ${chat.chatId}:`, err);
        }
      };

      fetchChatHistory();
      const interval = setInterval(fetchChatHistory, 5000);
      return () => clearInterval(interval);
    });
  }, [selectedChats]);

  // Cuộn đến tin nhắn mới nhất khi tin nhắn thay đổi
  useEffect(() => {
    selectedChats.forEach((chat) => {
      if (isAdminChatting[chat.chatId]) {
        scrollToBottom(chat.chatId);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages, isAdminChatting]);

  // Xử lý chọn chat
  const handleSelectChat = (chat) => {
    if (!selectedChats.find((c) => c.chatId === chat.chatId)) {
      setSelectedChats([...selectedChats, chat]);
      messagesEndRefs.current[chat.chatId] = React.createRef();
      chatContainerRefs.current[chat.chatId] = React.createRef();
    }
  };

  // Xử lý Join chat
  const handleJoinChat = async (chatId) => {
    try {
      const response = await fetch("https://ai.bang.vawayai.com:5000/toggle-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, enableBot: false }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setIsAdminChatting((prev) => ({ ...prev, [chatId]: true }));
      }
    } catch (err) {
      console.error(`Lỗi khi join chat ${chatId}:`, err);
    }
  };

  // Xử lý Close chat
  const handleCloseChat = async (chatId) => {
    try {
      const response = await fetch("https://ai.bang.vawayai.com:5000/toggle-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, enableBot: true }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setIsAdminChatting((prev) => ({ ...prev, [chatId]: false }));
        setSelectedChats(selectedChats.filter((c) => c.chatId !== chatId));
      }
    } catch (err) {
      console.error(`Lỗi khi close chat ${chatId}:`, err);
    }
  };

  // Gửi tin nhắn từ admin
  const handleSendMessage = async (chatId) => {
    const message = adminMessages[chatId]?.trim();
    if (!message) return;

    try {
      const response = await fetch(
        "https://ai.bang.vawayai.com:5000/send-message-to-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setAdminMessages((prev) => ({ ...prev, [chatId]: "" }));
      }
    } catch (err) {
      console.error(`Lỗi khi gửi tin nhắn ${chatId}:`, err);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("title")}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={10} height={10} borderRadius="50%" bgcolor="green" />
            <Typography fontWeight="bold" variant="body2">
              Active ({activeChats.length})
            </Typography>
          </Box>
        </Box>
      </div>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        fontFamily="Roboto, sans-serif"
      >
        <Box display="flex" flex={1} minHeight={0} mt={6}>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            p={2}
            minHeight={0}
          >
            <Box
              display="flex"
              alignItems="center"
              px={1}
              py={1}
              bgcolor="#f5f5f5"
              fontWeight="bold"
              borderBottom="1px solid #ccc"
            >
              <Box className={cx("title_active")} width={50} sx={{ marginLeft: 2 }}>
                <Box width={10} height={10} borderRadius="50%" bgcolor="error" />
              </Box>
              <Box className={cx("title_active")} flex={1}>
                Tên
              </Box>
              <Box className={cx("title_active")} flex={1}>
                Session ID
              </Box>
              <Box className={cx("title_active")} flex={1}>
                Trang web
              </Box>
              <Box className={cx("title_active")} flex={1}>
                Thời gian
              </Box>
              <Box className={cx("title_active")} width={100}>
                Hành động
              </Box>
            </Box>

            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <Box
                  key={chat.chatId}
                  display="flex"
                  alignItems="center"
                  px={1}
                  py={1}
                  borderBottom="1px solid #e0e0e0"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "aqua" },
                  }}
                  onClick={() => handleSelectChat(chat)}
                >
                  <Box width={50}>
                    <img
                      src={chat.avatar}
                      alt="Avatar"
                      style={{ width: 40, height: 40, borderRadius: "50%" }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography className={cx("item_active")}>
                      {chat.name}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography className={cx("item_active")} color="textSecondary">
                      {chat.chat_session_id}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography className={cx("item_active")} color="textSecondary">
                      {chat.domain}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography className={cx("item_active")} color="textSecondary">
                      {new Date(chat.lastActivity).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Box
                    width={80}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    className={cx("item_active")}
                  >
                    <IconButton variant="contained" color="primary">
                      <Block sx={{ fontSize: 23 }} color="error" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography align="center" color="textSecondary">
                Không có cuộc trò chuyện nào đang hoạt động.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Hiển thị nhiều dialog cho từng chat */}
      {selectedChats.map((chat) => (
        <Dialog
          key={chat.chatId}
          open={true}
          onClose={() => handleCloseChat(chat.chatId)}
          maxWidth="md"
          fullWidth
          className={cx("chat_dialog")}
        >
          <DialogTitle sx={{ fontSize: "18px" }}>
            {`${chat.domain} - ${chat.chat_session_id}`}
            <IconButton
              onClick={() => handleCloseChat(chat.chatId)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", height: "500px", position: "relative" }}
            ref={(el) => (chatContainerRefs.current[chat.chatId] = el)}
          >
            <Box flex={1} overflow="auto" p={2}>
              {(chatMessages[chat.chatId] || []).map((msg) => (
                <Box
                  key={msg.id}
                  display="flex"
                  justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
                  mb={1}
                >
                  <Box
                    bgcolor={msg.sender === "user" ? "#F1F0F0" : "#0abfbc"}
                    color={msg.sender === "user" ? "black" : "white"}
                    p={2}
                    borderRadius={4}
                    maxWidth="60%"
                    sx={{ fontSize: "14px" }}
                  >
                    <Typography sx={{ fontSize: "14px" }}>{msg.message}</Typography>
                    <Typography variant="caption" sx={{ fontSize: "10px" }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={(el) => (messagesEndRefs.current[chat.chatId] = el)} />
            </Box>
            {showScrollButtons[chat.chatId] && (
              <IconButton
                onClick={() => scrollToBottom(chat.chatId)}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "white",
                  border: "2px solid #0abfbc",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  zIndex: 1000,
                  "&:hover": { bgcolor: "#e0f7f6" },
                }}
              >
                <KeyboardArrowDownIcon sx={{ color: "#0abfbc", fontSize: 24 }} />
              </IconButton>
            )}
            {!isAdminChatting[chat.chatId] ? (
              <Box display="flex" justifyContent="center" p={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<GroupAddIcon />}
                  onClick={() => handleJoinChat(chat.chatId)}
                  sx={{ fontSize: "14px" }}
                >
                  Join Chat
                </Button>
              </Box>
            ) : (
              <Box display="flex" p={2} borderTop="1px solid #e0e0e0">
                <TextField
                  fullWidth
                  value={adminMessages[chat.chatId] || ""}
                  onChange={(e) =>
                    setAdminMessages((prev) => ({
                      ...prev,
                      [chat.chatId]: e.target.value,
                    }))
                  }
                  placeholder="Nhập tin nhắn..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(chat.chatId);
                  }}
                  sx={{
                    "& .MuiInputBase-root": { borderRadius: "16px" },
                    "& .MuiInputBase-input": { fontSize: "14px" },
                  }}
                />
                <IconButton
                  onClick={() => handleSendMessage(chat.chatId)}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}