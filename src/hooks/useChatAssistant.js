import { useEffect, useRef, useState } from "react";
import { matchChatbotFaq } from "../chatbotFaq";

export default function useChatAssistant(catalog) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm PinkBakes Assistant — your free Help Desk. Ask about ordering, delivery, cancel/refund, eggless & custom cakes, coupons, or payments. Tap a quick question below anytime.",
    },
  ]);

  function getChatbotReply(inputText) {
    const names = (catalog || []).map(item => item.name).filter(Boolean);
    return matchChatbotFaq(inputText, names).answer;
  }

  function scrollChatToBottom() {
    const element = chatMessagesRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }

  useEffect(() => {
    if (!chatOpen) return;
    const id = requestAnimationFrame(() => {
      scrollChatToBottom();
      requestAnimationFrame(scrollChatToBottom);
    });
    return () => cancelAnimationFrame(id);
  }, [chatOpen, chatMessages]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = event => {
      if (event.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  function sendChatMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setChatMessages(previous => [...previous, { sender: "user", text: trimmed }]);
    setChatInput("");
    const response = getChatbotReply(trimmed);
    setTimeout(() => {
      setChatMessages(previous => [...previous, { sender: "bot", text: response }]);
      requestAnimationFrame(() => {
        scrollChatToBottom();
        requestAnimationFrame(scrollChatToBottom);
      });
    }, 220);
  }

  function openHelpDesk() {
    setChatOpen(true);
    requestAnimationFrame(() => {
      scrollChatToBottom();
      requestAnimationFrame(scrollChatToBottom);
    });
  }

  function openHelpDeskTopic(prompt) {
    setChatOpen(true);
    const trimmed = (prompt || "").trim();
    if (trimmed) {
      setTimeout(() => sendChatMessage(trimmed), 0);
    } else {
      requestAnimationFrame(() => {
        scrollChatToBottom();
        requestAnimationFrame(scrollChatToBottom);
      });
    }
  }

  function handleChatSubmit(event) {
    event.preventDefault();
    sendChatMessage(chatInput);
  }

  return {
    chatOpen,
    setChatOpen,
    chatInput,
    setChatInput,
    chatMessagesRef,
    chatMessages,
    sendChatMessage,
    handleChatSubmit,
    openHelpDesk,
    openHelpDeskTopic,
  };
}
