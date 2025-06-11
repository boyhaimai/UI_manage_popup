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
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [isAdminChatting, setIsAdminChatting] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Hàm cuộn đến tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Theo dõi vị trí cuộn để hiển thị nút cuộn xuống
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current && messagesEndRef.current) {
        const container = chatContainerRef.current;
        const messagesEnd = messagesEndRef.current;
        const containerRect = container.getBoundingClientRect();
        const messagesEndRect = messagesEnd.getBoundingClientRect();
        const distance = messagesEndRect.top - containerRect.bottom;
        console.log("Scroll distance:", distance); // Debug khoảng cách
        setShowScrollButton(distance < -20);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Gọi lần đầu để kiểm tra trạng thái ban đầu
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [selectedChat]);

  // Lấy danh sách active chats
  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        const response = await fetch(
          "https://ai.bang.vawayai.com:5000/get-active-chats",
          {
            credentials: "include",
          }
        );
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

  // Lấy lịch sử chat khi chọn một cuộc trò chuyện
  useEffect(() => {
    if (!selectedChat) return;

    const fetchChatHistory = async () => {
      try {
        const [chatId, domain] = selectedChat.chatId.split("@");
        const response = await fetch(
          `https://ai.bang.vawayai.com:5000/get-history?userId=${chatId}&domain=${encodeURIComponent(
            domain
          )}`,
          { credentials: "include" }
        );

        const data = await response.json();
        if (data.success) {
          setChatMessages(data.messages);
        }
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử chat:", err);
      }
    };

    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Cuộn đến tin nhắn mới nhất khi chatMessages thay đổi và admin đang tham gia chat
  useEffect(() => {
    if (isAdminChatting) {
      scrollToBottom();
    }
  }, [chatMessages, isAdminChatting]);

  // Xử lý Join chat
  const handleJoinChat = async () => {
    try {
      const [chatId] = selectedChat.chatId.split("@");
      const response = await fetch(
        "https://ai.bang.vawayai.com:5000/toggle-bot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, enableBot: false }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setIsAdminChatting(true);
      }
    } catch (err) {
      console.error("Lỗi khi join chat:", err);
    }
  };

  // Xử lý Close chat
  const handleCloseChat = async () => {
    try {
      const [chatId] = selectedChat.chatId.split("@");
      const response = await fetch(
        "https://ai.bang.vawayai.com:5000/toggle-bot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, enableBot: true }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setIsAdminChatting(false);
        setSelectedChat(null);
      }
    } catch (err) {
      console.error("Lỗi khi close chat:", err);
    }
  };

  // Gửi tin nhắn từ admin
  const handleSendMessage = async () => {
    if (!adminMessage.trim()) return;

    try {
      const [chatId] = selectedChat.chatId.split("@");
      const response = await fetch(
        "https://ai.bang.vawayai.com:5000/send-message-to-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            message: adminMessage,
          }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setAdminMessage("");
      }
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
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
              <Box
                className={cx("title_active")}
                width={50}
                sx={{ marginLeft: 2 }}
              >
                <Box
                  width={10}
                  height={10}
                  borderRadius="50%"
                  bgcolor="error"
                />
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
                    "&:hover": {
                      backgroundColor: "aqua",
                    },
                  }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Box width={50}>
                    <img
                      src={chat.avatar}
                      alt="Avatar"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                      }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography className={cx("item_active")}>
                      {chat.name}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography
                      className={cx("item_active")}
                      color="textSecondary"
                    >
                      {chat.chat_session_id}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography
                      className={cx("item_active")}
                      color="textSecondary"
                    >
                      {chat.domain}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography
                      className={cx("item_active")}
                      color="textSecondary"
                    >
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

      {/* Dialog chat */}
      <Dialog
        open={!!selectedChat}
        onClose={() => setSelectedChat(null)}
        maxWidth="md"
        fullWidth
        className={cx("chat_dialog")}
      >
        <DialogTitle sx={{ fontSize: "18px" }}>
          {selectedChat
            ? `${selectedChat.domain} - ${selectedChat.chat_session_id}`
            : ""}
          <IconButton
            onClick={handleCloseChat}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "500px",
            position: "relative",
          }}
          ref={chatContainerRef}
        >
          <Box flex={1} overflow="auto" p={2}>
            {chatMessages.map((msg) => (
              <Box
                key={msg.id}
                display="flex"
                justifyContent={
                  msg.sender === "user" ? "flex-end" : "flex-start"
                }
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
                  <Typography sx={{ fontSize: "14px" }}>
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "10px" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          {showScrollButton && (
            <IconButton
              onClick={scrollToBottom}
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
          {!isAdminChatting ? (
            <Box display="flex" justifyContent="center" p={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<GroupAddIcon />}
                onClick={handleJoinChat}
                sx={{ fontSize: "14px" }}
              >
                Join Chat
              </Button>
            </Box>
          ) : (
            <Box display="flex" p={2} borderTop="1px solid #e0e0e0">
              <TextField
                fullWidth
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                sx={{
                  "& .MuiInputBase-root": { borderRadius: "16px" },
                  "& .MuiInputBase-input": { fontSize: "14px" },
                }}
              />
              <IconButton onClick={handleSendMessage} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
