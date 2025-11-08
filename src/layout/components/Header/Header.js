import React, { useState, useRef, useEffect, useContext } from "react";
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
import { ChatContext } from "~/contexts/OpenPopupAdminContext/OpenPopupAdminContext";

const cx = classNames.bind(styles);

const Header = ({ open, onClose }) => {
  const context = useContext(ChatContext);

  // Chỉ sử dụng context nếu đang ở AddWeb (không truyền props)
  const isUsingContext =
    context &&
    context.isChatOpen !== undefined &&
    context.toggleChat !== undefined &&
    open === undefined &&
    onClose === undefined;

  const isChatOpen = isUsingContext ? context.isChatOpen : open;
  const handleClose = isUsingContext ? context.toggleChat : onClose;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      const sessionId = getSessionId();
      const domain = window.location.hostname || "localhost";

      try {
        const res = await fetch(
          ` http://localhost:5000/get-history-admin-page?domain=${domain}&userId=${sessionId}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          const restoredMessages = data.messages.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.message,
            timestamp: msg.timestamp,
          }));
          setMessages([
            { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
            ...restoredMessages,
          ]);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getSessionId = () => {
    let sessionId = localStorage.getItem("chat_session_id");
    if (!sessionId || typeof sessionId !== "string" || sessionId.length < 5) {
      sessionId = Math.random().toString(36).substring(2);
      localStorage.setItem("chat_session_id", sessionId);
    }
    return sessionId;
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  };

  const addMessage = (text, sender, timestamp = null, messageId) => {
    setMessages((prev) => [
      ...prev,
      {
        text,
        sender,
        timestamp: timestamp || new Date().toISOString(),
        id: messageId,
      },
    ]);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const sessionId = getSessionId();
    const domain = window.location.hostname || "localhost";
    const messageId = generateMessageId();
    const botMessageId = generateMessageId();

    addMessage(input, "admin", null, messageId);
    setInput("");
    setIsTyping(true);

    try {
      const webhookResponse = await fetch(
        "https://bang.daokhaccu.top/webhook/save_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            timestamp: Date.now(),
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            sessionId,
            domain,
            phoneNumber: "admin",
          }),
        }
      );

      let botReply = "Xin lỗi, tôi chưa nhận được phản hồi.";
      if (webhookResponse.ok) {
        try {
          const data = await webhookResponse.json();
          if (data?.response) {
            botReply = data.response;
          }
        } catch {
          botReply = "Xin lỗi, phản hồi không hợp lệ từ server.";
        }
      }

      setTimeout(() => {
        setIsTyping(false);
        addMessage(botReply, "bot", null, botMessageId);
      }, 1500);

      await fetch(" http://localhost:5000/save-history-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionId,
          sender: "admin",
          message: input,
          timestamp: Date.now(),
          id: messageId,
          domain,
        }),
      });

      await fetch(" http://localhost:5000/save-history-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionId,
          sender: "bot",
          message: botReply,
          timestamp: Date.now(),
          id: botMessageId,
          domain,
        }),
      });
    } catch (err) {
      console.error("Lỗi khi gửi hoặc lưu:", err);
      setTimeout(() => {
        setIsTyping(false);
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
          transform: isChatOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
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
          <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#f9f9f9" }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                mb: 1,
                display: "flex",
                justifyContent:
                  msg.sender === "admin" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                  bgcolor:
                    msg.sender === "admin"
                      ? "#e0e0e0"
                      : "var(--theme-color, #0abfbc)",
                  color: msg.sender === "admin" ? "#000" : "#fff",
                  fontSize: 14,
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}

          {isTyping && (
            <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-start" }}>
              <Box className={cx("wrapper_typing")}>
                <span style={dotStyle(0)}></span>
                <span style={dotStyle(0.2)}></span>
                <span style={dotStyle(0.4)}></span>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

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

// typing dot styles
const dotStyle = (delay) => ({
  width: 6,
  height: 6,
  background: "#fff",
  borderRadius: "50%",
  animation: `typing 1s infinite ${delay}s ease-in-out`,
});

export default Header;
