"use client";
// context/MessageContext.tsx
import React, { createContext, useState } from "react";
import { Message } from "@prisma/client";

// Define types for context value

// export const backendUrl = "http://localhost:5000";
export const backendUrl =
  "https://realitme-app-backend-production.up.railway.app";
// export const frontEndUrl = "http://localhost:3000";
export const frontEndUrl = "https://chat-frontend-beige.vercel.app";
export type MessageContextType = {
  lastMessage: Message | undefined;
  setLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>;
};

// Create context with initial values
export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

// Provider component
export const MessageContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<Message | undefined>();

  return (
    <MessageContext.Provider value={{ lastMessage, setLastMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
