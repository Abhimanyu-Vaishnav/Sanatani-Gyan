import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { SendIcon, MicIcon } from './icons';
import { Language } from '../types';

interface ChatInterfaceProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isGuest: boolean;
  messageCount: number;
  openAuthModal: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onInputChange?: () => void;
}

export interface ChatInterfaceHandle {
  focus: () => void;
}

const GUEST_MESSAGE_LIMIT = 10;

const quickTopics = [
  'Dharma', 'Karma', 'Relationships', 'Grief', 
  'Finance', 'Decision-making', 'Parenting', 'Work'
];

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(({ onSendMessage, isLoading, isGuest, messageCount, openAuthModal, language, setLanguage, onInputChange }, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGuestLimitReached = isGuest && messageCount >= GUEST_MESSAGE_LIMIT;

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  useEffect(() => {
    if (!recognition) return;

    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [language]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading && !isGuestLimitReached) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleTopicClick = (topic: string) => {
    if (isGuestLimitReached) return;
    const prompt = `What guidance can scripture offer me about ${topic.toLowerCase()}?`;
    onSendMessage(prompt);
  };
  
  const handleMicClick = () => {
    if (!recognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    if (isGuestLimitReached) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };
  
  const langDisplayMap: Record<Language, string> = {
    [Language.English]: 'En',
    [Language.Hinglish]: 'Hi',
    [Language.Hindi]: 'हि',
  };

  return (
    <div className="p-4 pt-0">
      {isGuestLimitReached ? (
        <div className="text-center p-4 bg-yellow-100/80 dark:bg-yellow-900/50 traditional:bg-traditional-card border border-yellow-300 dark:border-yellow-700 traditional:border-traditional-primary/50 rounded-lg">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 traditional:text-traditional-secondary">You've reached the guest message limit.</p>
          <button onClick={openAuthModal} className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-300 traditional:text-traditional-primary hover:underline">
            Please Sign Up or Login to continue.
          </button>
        </div>
      ) : (
        <>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
            {quickTopics.map((topic) => (
            <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 traditional:bg-traditional-card text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 traditional:hover:bg-traditional-primary/20 disabled:opacity-50 transition-colors"
            >
                {topic}
            </button>
            ))}
        </div>
        <div className="flex items-end space-x-2 bg-white dark:bg-gray-800 traditional:bg-traditional-card rounded-xl shadow-lg p-2 border-2 border-transparent focus-within:border-traditional-primary transition-colors">
            <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
                setInputValue(e.target.value)
                onInputChange?.();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                }
            }}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent p-2 resize-none max-h-40 focus:outline-none dark:text-white traditional:text-traditional-text"
            rows={1}
            disabled={isLoading}
            />
            <div className="flex items-center">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent border-none text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary text-sm font-bold focus:ring-0 appearance-none pr-2"
                disabled={isLoading}
                >
                {Object.values(Language).map((lang) => (
                    <option key={lang} value={lang}>{langDisplayMap[lang]}</option>
                ))}
                </select>
            <button
                onClick={handleMicClick}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-700 traditional:hover:bg-traditional-primary/20 text-gray-500 dark:text-gray-400'}`}
                aria-label="Use microphone"
                disabled={isLoading}
            >
                <MicIcon className="w-6 h-6" />
            </button>
            <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-traditional-primary text-white rounded-full p-3 hover:bg-traditional-secondary disabled:bg-traditional-primary/50 transition-colors"
                aria-label="Send message"
            >
                <SendIcon className="w-6 h-6" />
            </button>
            </div>
        </div>
        </>
      )}
    </div>
  );
});

export default ChatInterface;