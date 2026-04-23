import React, { useState, useRef, useEffect } from 'react';

const ManagerAIChat = ({ teamData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello Manager. I have analyzed your fleet's metrics. Ask me about team health, resource allocation, or cross-team bottlenecks." }
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
      const response = await fetch('http://localhost:5001/api/manager/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          teamData: teamData
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Fleet intelligence core is offline. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manager-ai-chat-wrapper">
      <button 
        className={`manager-ai-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="ai-icon">✦</span>
        <span>{isOpen ? 'Close Assistant' : 'Ask Fleet AI'}</span>
      </button>

      {isOpen && (
        <div className="manager-chat-panel">
          <div className="manager-chat-header">
            <div className="status">
              <span className="dot pulse"></span>
              Leadership Core Online
            </div>
            <h4>Fleet Intelligence Assistant</h4>
          </div>

          <div className="manager-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`m-message ${msg.role}`}>
                <div className="m-bubble">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="m-message assistant">
                <div className="m-bubble loading">Analyzing fleet data...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="manager-chat-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about team health, blockers, or performance..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>→</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagerAIChat;
