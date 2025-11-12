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
import { ChatContext } from "~/contexts/OpenPopupAdminContext/OpenPopupAdminContext";
import styles from "./header.module.scss";

const cx = classNames.bind(styles);

const Header = () => {
  const { isChatOpen, toggleChat } = useContext(ChatContext) || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef();

  useEffect(() => {
    console.log("Header: isChatOpen =", isChatOpen);
    if (!toggleChat) {
      console.error("ChatContext is not provided in Header. Ensure Header is wrapped in ChatProvider.");
    }
  }, [isChatOpen, toggleChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchMessages = async () => {
      const sessionId = getSessionId();
      const domain = window.location.hostname || "localhost";

      try {
        const res = await fetch(
          ` https://n8n.vazo.vn/api/get-history-admin-page?domain=${domain}&userId=${sessionId}`
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
    const botMessageId = generateMessageId();
    const domain = window.location.hostname || "localhost";
    const sessionId = getSessionId();

    addMessage(input, "admin", null, messageId);
    setInput("");

    try {
      showTypingIndicator();

      const webhookResponse = await fetch(
        "https://bang.daokhaccu.top/webhook/ai-assistant",
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
        removeTypingIndicator();
        addMessage(botReply, "bot", null, botMessageId);
      }, 1500);

      await fetch(" https://n8n.vazo.vn/api/save-history-admin", {
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

      await fetch(" https://n8n.vazo.vn/api/save-history-admin", {
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
          <IconButton
            onClick={() => {
              console.log("Close button clicked");
              toggleChat();
            }}
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

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