import React, { useState, useEffect, useRef, useContext } from 'react';
import Header from './components/Header';
import MessageCard from './components/MessageCard';
import ChatInterface, { type ChatInterfaceHandle } from './components/ChatInterface';
import AuthModal from './components/AuthModal';
import useLocalStorage from './hooks/useLocalStorage';
import { getScripturalAnswer } from './services/geminiService';
import type { Message, FontSize } from './types';
import { Theme, Language } from './types';
import { AuthContext } from './contexts/AuthContext';

function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', Theme.Light);
  const [language, setLanguage] = useLocalStorage<Language>('language', Language.English);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('fontSize', 'md');
  const [highContrast, setHighContrast] = useLocalStorage<boolean>('highContrast', false);

  const { user } = useContext(AuthContext);
  
  // Use standard useState for messages to avoid violating Rules of Hooks
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

  // Effect to LOAD messages from localStorage when user changes
  useEffect(() => {
    const key = user ? `messages_${user.username}` : 'guest_messages';
    const storedMessages = window.localStorage.getItem(key);
    setMessages(storedMessages ? JSON.parse(storedMessages) : []);
  }, [user]);

  // Effect to SAVE messages to localStorage when messages or user change
  useEffect(() => {
    const key = user ? `messages_${user.username}` : 'guest_messages';
    window.localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user]);


  useEffect(() => {
    const root = window.document.documentElement;
    // Theme
    root.classList.remove(Theme.Light, Theme.Dark, 'traditional');
    if (theme === Theme.Dark) {
      root.classList.add('dark');
    } else if (theme === Theme.Traditional) {
      root.classList.add('traditional');
    }
    // Accessibility
    root.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    root.classList.add(`font-size-${fontSize}`);
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [theme, fontSize, highContrast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleSaveMessage = (id: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, isSaved: !msg.isSaved } : msg
    );
    setMessages(updatedMessages);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }
  
  const clearHistory = () => {
    setMessages([]);
  }

  const handleAskFollowUp = () => {
    chatInterfaceRef.current?.focus();
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const answer = await getScripturalAnswer(newMessages, language);
      if (answer) {
        const modelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: '',
          answer,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        throw new Error("Failed to get a valid answer from the API.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error while seeking wisdom. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const themeClasses = {
    [Theme.Light]: 'bg-gray-50 text-gray-900',
    [Theme.Dark]: 'bg-gray-900 text-gray-100',
    [Theme.Traditional]: 'bg-traditional-bg bg-traditional-pattern text-traditional-text',
  };

  return (
    <div className={`flex flex-col h-screen font-sans transition-colors duration-300 ${themeClasses[theme]}`}>
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        openAuthModal={() => setAuthModalOpen(true)}
        clearHistory={clearHistory}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.map(msg => (
            <MessageCard 
              key={msg.id} 
              message={msg} 
              toggleSaveMessage={toggleSaveMessage} 
              deleteMessage={deleteMessage}
              onAskFollowUp={handleAskFollowUp}
              language={language}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 traditional:bg-traditional-card rounded-lg p-4 max-w-2xl w-full">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="sticky bottom-0 bg-transparent">
        <div className="container mx-auto max-w-4xl">
          <ChatInterface 
            ref={chatInterfaceRef} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            isGuest={!user}
            messageCount={messages.filter(m => m.role === 'user').length}
            openAuthModal={() => setAuthModalOpen(true)}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default App;