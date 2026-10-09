import { CakeSlice, MessageCircle, Send, X } from "lucide-react";
import { CHATBOT_QUICK_PROMPTS } from "../chatbotFaq";

function ChatbotDock({
  chatOpen,
  setChatOpen,
  chatMessagesRef,
  chatMessages,
  sendChatMessage,
  handleChatSubmit,
  chatInput,
  setChatInput,
}) {
  return (
    <div className={`chatbot-dock${chatOpen ? " is-open" : ""}`}>
      {chatOpen && (
        <div className="chatbot-panel" role="dialog" aria-modal="true" aria-label="PinkBakes Help Desk">
          <div className="chatbot-header">
            <div className="chatbot-header-brand">
              <span className="chatbot-avatar" aria-hidden="true"><CakeSlice size={18}/></span>
              <div>
                <span className="chatbot-eyebrow">HELP DESK</span>
                <strong>PinkBakes Assistant</strong>
                <small className="chatbot-online">Online - FAQ answers instantly</small>
              </div>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setChatOpen(false)} aria-label="Close chatbot">
              <X size={16} />
            </button>
          </div>

          <div className="chatbot-messages" ref={chatMessagesRef}>
            {chatMessages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={`chatbot-message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="chatbot-quick" aria-label="Quick questions">
            {CHATBOT_QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" className="chatbot-chip" onClick={() => sendChatMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleChatSubmit}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about orders, delivery, refunds..."
              aria-label="Type a message to the chatbot"
            />
            <button type="submit" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`chatbot-launch${chatOpen ? " is-open" : ""}`}
        onClick={() => setChatOpen((open) => !open)}
        aria-label={chatOpen ? "Close bakery chatbot" : "Open PinkBakes Assistant"}
        aria-expanded={chatOpen}
      >
        {chatOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!chatOpen && <span>Help</span>}
      </button>
    </div>
  );
}

export default ChatbotDock;
