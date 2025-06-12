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
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
    addMessage(input, "user", null, messageId);
    setInput("");

    try {
      showTypingIndicator();
      const response = await fetch("https://bang.daokhaccu.top/webhook/save_history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          timestamp: Date.now(),
          origin: window.location.origin,
          userAgent: navigator.userAgent,
          sessionId: getSessionId(),
          domain: window.location.hostname,
        }),
      });

      console.log("Webhook response status:", response.status);

      if (response.ok) {
        let data;
        try {
          data = await response.json(); // Parse JSON trực tiếp
          if (data && data.response) { // Sử dụng 'response' thay vì 'reply'
            const botMessageId = generateMessageId();
            setTimeout(() => {
              removeTypingIndicator();
              addMessage(data.response, "bot", null, botMessageId);
            }, 2000);
          } else {
            setTimeout(() => {
              removeTypingIndicator();
              addMessage("Xin lỗi, tôi chưa nhận được phản hồi.", "bot", null, generateMessageId());
            }, 2000);
          }
        } catch (jsonError) {
          console.error("Lỗi parse JSON:", jsonError);
          setTimeout(() => {
            removeTypingIndicator();
            addMessage("Xin lỗi, phản hồi không hợp lệ từ server.", "bot", null, generateMessageId());
          }, 2000);
        }
      } else {
        console.error("Lỗi từ server:", response.statusText);
        setTimeout(() => {
          removeTypingIndicator();
          addMessage(`Lỗi: ${response.status} - ${response.statusText}`, "bot", null, generateMessageId());
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi kết nối webhook:", error);
      setTimeout(() => {
        removeTypingIndicator();
        addMessage("Lỗi gửi tin nhắn. Vui lòng thử lại.", "bot", null, generateMessageId());
      }, 2000);
    }
  };

  console.log("Header đang hiển thị:", open);

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
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                  bgcolor:
                    msg.sender === "user"
                      ? "#e0e0e0"
                      : "var(--theme-color, #0abfbc)",
                  color: msg.sender === "user" ? "#000" : "#fff",
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
              <Box
               className={cx('wrapper_typing')}                
              >
                <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", animation: "typing 1s infinite ease-in-out" }}></span>
                <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", animation: "typing 1s infinite 0.2s ease-in-out" }}></span>
                <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", animation: "typing 1s infinite 0.4s ease-in-out" }}></span>
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
