import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import classNames from "classnames/bind";

import styles from "./header.module.scss";

const cx = classNames.bind(styles);

const Header = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    verifyToken(); // Không cần truyền token nữa
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch("https://ai.bang.vawayai.com:5000/get-admin-info", {
        credentials: "include", // ✅ gửi cookie authToken
      });
      if (response.ok) {
        setIsAdmin(true);
        fetchAdminMessageHistory();
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Lỗi xác minh token:", error);
      setIsAdmin(false);
    }
  };

  const fetchAdminMessageHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "https://ai.bang.vawayai.com:5000/get-admin-message-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages.length > 0) {
          setMessages([
            { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
            ...data.messages.map((msg) => ({
              text: msg.message,
              sender: "admin",
              timestamp: msg.timestamp,
              id: msg.chatId || generateMessageId(),
            })),
          ]);
        }
      } else {
        console.error("Lỗi lấy lịch sử admin:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi lấy lịch sử admin:", error);
    }
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem("chat_session_id");
    if (!sessionId || typeof sessionId !== "string" || sessionId.length < 5) {
      sessionId = Math.random().toString(36).substring(2);
      localStorage.setItem("chat_session_id", sessionId);
    }
    return sessionId;
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
  };

  const removeTypingIndicator = () => {
    setIsTyping(false);
  };

  const addMessage = (text, sender, timestamp = null, messageId) => {
    const messageContainer = {
      text,
      sender,
      timestamp: timestamp || new Date().toISOString(),
      id: messageId,
    };
    setMessages((prev) => [...prev, messageContainer]);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const messageId = generateMessageId();
    addMessage(input, isAdmin ? "admin" : "user", null, messageId);
    setInput("");

    try {
      showTypingIndicator();

      // Gọi webhook để lấy phản hồi bot
      const webhookResponse = await fetch(
        "https://bang.daokhaccu.top/webhook/save_history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAdmin && {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }),
          },
          body: JSON.stringify({
            message: input,
            timestamp: Date.now(),
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            sessionId: getSessionId(),
            domain: window.location.hostname,
            sender: isAdmin ? "admin" : "user",
          }),
        }
      );

      // Gọi API lưu lịch sử trên server local
      const saveHistoryResponse = await fetch(
        "https://ai.bang.vawayai.com:5000/save-history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ để browser tự gửi cookie authToken
          body: JSON.stringify({
            userId: getSessionId(),
            sender: isAdmin ? "admin" : "user",
            message: input,
            timestamp: Date.now(),
            id: messageId,
            domain: window.location.hostname,
          }),
        }
      );

      // Xử lý phản hồi webhook
      if (webhookResponse.ok) {
        let data;
        try {
          data = await webhookResponse.json();
          if (data && data.response) {
            const botMessageId = generateMessageId();
            setTimeout(() => {
              removeTypingIndicator();
              addMessage(data.response, "bot", null, botMessageId);
            }, 2000);
          } else {
            setTimeout(() => {
              removeTypingIndicator();
              addMessage(
                "Xin lỗi, tôi chưa nhận được phản hồi.",
                "bot",
                null,
                generateMessageId()
              );
            }, 2000);
          }
        } catch (jsonError) {
          console.error("Lỗi parse JSON:", jsonError);
          setTimeout(() => {
            removeTypingIndicator();
            addMessage(
              "Xin lỗi, phản hồi không hợp lệ từ server.",
              "bot",
              null,
              generateMessageId()
            );
          }, 2000);
        }
      } else {
        console.error("Lỗi từ webhook:", webhookResponse.statusText);
        setTimeout(() => {
          removeTypingIndicator();
          addMessage(
            `Lỗi: ${webhookResponse.status} - ${webhookResponse.statusText}`,
            "bot",
            null,
            generateMessageId()
          );
        }, 2000);
      }

      // Kiểm tra phản hồi lưu lịch sử
      if (!saveHistoryResponse.ok) {
        console.error("Lỗi lưu lịch sử:", saveHistoryResponse.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setTimeout(() => {
        removeTypingIndicator();
        addMessage(
          "Lỗi gửi tin nhắn. Vui lòng thử lại.",
          "bot",
          null,
          generateMessageId()
        );
      }, 2000);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <Paper
        elevation={6}
        sx={{
          width: 350,
          height: "100vh",
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            bgcolor: "#0abfbc",
            color: "#fff",
          }}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              src="https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png"
              alt="avatar"
              sx={{ width: 36, height: 36, mr: 1 }}
            />
            <Typography fontWeight="bold" sx={{ fontSize: 18 }}>
              Trợ lý AI
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            bgcolor: "#f9f9f9",
          }}
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 1,
                display: "flex",
                justifyContent:
                  msg.sender === "bot" ? "flex-start" : "flex-end",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                  bgcolor:
                    msg.sender === "bot"
                      ? "var(--theme-color, #0abfbc)"
                      : "#e0e0e0", // Admin và user cùng màu #e0e0e0
                  color: msg.sender === "bot" ? "#fff" : "#000",
                  fontSize: 14,
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}
          {isTyping && (
            <Box
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Box className={cx("wrapper_typing")}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#fff",
                    borderRadius: "50%",
                    animation: "typing 1s infinite ease-in-out",
                  }}
                ></span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#fff",
                    borderRadius: "50%",
                    animation: "typing 1s infinite 0.2s ease-in-out",
                  }}
                ></span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#fff",
                    borderRadius: "50%",
                    animation: "typing 1s infinite 0.4s ease-in-out",
                  }}
                ></span>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Chat Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #ddd",
            display: "flex",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            InputProps={{
              sx: { fontSize: 14 },
            }}
          />
          <Button onClick={handleSend} sx={{ minWidth: 40, p: 1 }}>
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Header;
