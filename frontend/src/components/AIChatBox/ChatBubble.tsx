import React, { useState, useRef, useEffect } from 'react';
import { apiNoAuth } from '../../configs/api';
import './ChatBubble.css';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    avgLogprobs: number;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: Array<{
      modality: string;
      tokenCount: number;
    }>;
    candidatesTokensDetails: Array<{
      modality: string;
      tokenCount: number;
    }>;
  };
  modelVersion: string;
}

const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isOpen) {
      setIsDragging(true);
      const rect = dragRef.current?.getBoundingClientRect();
      if (rect) {
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const handleDrag = (e: MouseEvent) => {
          if (isDragging) {
            const bubble = dragRef.current;
            if (bubble) {
              const newX = e.clientX - offsetX;
              const newY = e.clientY - offsetY;
              bubble.style.right = `${window.innerWidth - newX - bubble.offsetWidth}px`;
              bubble.style.bottom = `${window.innerHeight - newY - bubble.offsetHeight}px`;
            }
          }
        };
        const handleDragEnd = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleDrag);
          document.removeEventListener('mouseup', handleDragEnd);
        };
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { 
      text: inputMessage, 
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiNoAuth.post<GeminiResponse>(
        'gemini/generate',
        inputMessage,
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      const formattedResponse = aiResponse
        .trim()
        .replace(/\*/g, '\n')
        .replace(/\n+/g, '\n')
        .trim();

      const aiMessage: Message = {
        text: formattedResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'An error occurred while processing your request.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorResponse: Message = {
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div
        ref={dragRef}
        className={`chat-bubble ${isOpen ? 'open' : ''}`}
        onMouseDown={handleDragStart}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
      >
        AI
      </div>
      {isOpen && (
        <div className="chat-dialog">
          <div className="chat-header">
            <span className="chat-header-title">Gemini AI chatbox</span>
            <button className="chat-close-button" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isUser ? 'user' : 'ai'}`}>
                {message.text}
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble; 