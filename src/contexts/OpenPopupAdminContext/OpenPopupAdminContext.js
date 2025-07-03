import React, { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};