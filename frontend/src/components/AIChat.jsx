import React, { useState, useEffect, useRef } from 'react';

const AIChat = ({ metrics, bottlenecks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Productivity Intelligence Engine. Ask me anything about these metrics or how to optimize your team's workflow." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: { metrics, bottlenecks }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the intelligence core. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      {/* Chat Toggle Button (The Orb) */}
      <div className={`chat-toggle-wrapper ${isOpen ? 'active' : ''}`}>
        <button className="chat-toggle-orb" onClick={() => setIsOpen(!isOpen)}>
          <div className="orb-scanner"></div>
          <div className="robot-container">
            <div className="robot-guy">
              <div className="robot-head">
                <div className="robot-eyes">
                  <span></span><span></span>
                </div>
              </div>
              <div className="robot-body"></div>
              <div className="robot-arm left"></div>
              <div className="robot-arm right"></div>
            </div>
          </div>
          <div className="orb-label">{isOpen ? 'COLLAPSE' : 'ASK AI'}</div>
        </button>
        {!isOpen && (
            <div className="orb-ping">
                <span className="ping-text">Intelligence Active</span>
            </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              Intelligence Core Active
            </div>
            <h4>AI Productivity Assistant</h4>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-bubble loading">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about your lead time, quality, or bottlenecks..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
