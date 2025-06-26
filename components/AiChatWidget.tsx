
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface AiChatWidgetProps {
  onQuery: (query: string) => Promise<string>;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ onQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{
            id: 'initial-ai-greeting',
            sender: 'ai',
            text: "Hello! I'm your SolvoIQ assistant. How can I help you with your clients, tasks, or knowledge base today?",
            timestamp: new Date().toISOString()
        }]);
    }
  }, [isOpen, messages.length]);


  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponseText = await onQuery(userMessage);
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      const errorAiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: "Sorry, I encountered an issue. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorAiMessage]);
      console.error("AI Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary-dark text-white rounded-full p-3.5 shadow-xl fixed bottom-6 left-6 z-50 transition-transform hover:scale-105"
        aria-label="Open AI Chat"
        title="AI Assistant"
      >
        <Bot size={26} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-[360px] h-[520px] bg-sidebar-bg shadow-modal rounded-xl flex flex-col border border-border-color z-50 animate-modalShow">
      <header className="bg-input-bg p-4 flex justify-between items-center rounded-t-xl border-b border-border-color">
        <h3 className="text-md font-semibold text-dark-text flex items-center">
            <Bot size={20} className="mr-2 text-primary"/> AI Assistant
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-medium-text hover:text-primary p-1 rounded-full" aria-label="Close Chat">
          <X size={20} />
        </button>
      </header>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        aria-live="polite" // Added for screen reader announcements
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-2.5 rounded-lg text-sm shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-input-bg text-dark-text border border-border-color rounded-bl-none'
            }`}>
              {msg.sender === 'ai' && msg.text.startsWith("Sorry, I encountered an issue") && (
                <span className="text-danger">{msg.text}</span>
              )}
              {!(msg.sender === 'ai' && msg.text.startsWith("Sorry, I encountered an issue")) && (
                msg.text.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))
              )}
               <div className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-blue-200' : 'text-light-text'} text-right`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-[80%] p-3 rounded-lg text-sm shadow-sm bg-input-bg text-dark-text border border-border-color rounded-bl-none">
                    <LoadingSpinner size="sm" />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-border-color bg-input-bg rounded-b-xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Ask about clients, tasks..."
            className="flex-1 p-2 border border-border-color rounded-lg text-sm bg-sidebar-bg text-dark-text placeholder-placeholder-color focus:ring-1 focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
            aria-label="Send Message"
           >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};