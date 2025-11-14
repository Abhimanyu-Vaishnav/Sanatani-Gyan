import React, { useState, useContext } from 'react';
import type { Message, Language } from '../types';
import { BookmarkIcon, ReplyIcon, TrashIcon, ShareIcon } from './icons';
import SpeechControls from './SpeechControls';
import ShareModal from './ShareModal';
import { AuthContext } from '../contexts/AuthContext';

interface MessageCardProps {
  message: Message;
  toggleSaveMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  onAskFollowUp: () => void;
  language: Language;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, toggleSaveMessage, deleteMessage, onAskFollowUp, language }) => {
  const { user } = useContext(AuthContext);
  const [showShareModal, setShowShareModal] = useState(false);
  
  if (message.role === 'user') {
    return (
      <div className="group flex justify-end items-start gap-2">
         {user && (
          <button onClick={() => deleteMessage(message.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300" title="Delete message">
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
        <div className="bg-traditional-primary text-white rounded-2xl rounded-br-none p-3 max-w-lg">
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  const { answer } = message;

  return (
    <>
      <div className="group flex justify-start items-start gap-2">
        <div className="bg-gray-100 dark:bg-gray-800 traditional:bg-traditional-card text-gray-800 dark:text-gray-200 traditional:text-traditional-text rounded-2xl rounded-bl-none p-4 max-w-2xl w-full font-serif shadow-sm">
          {answer ? (
            <div className="space-y-4">
              <div className="border-l-4 border-gray-500 dark:border-gray-400 traditional:border-traditional-primary pl-4">
                <p className="text-lg italic">"{answer.shortTeaching}"</p>
              </div>
              
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary mb-1">Scripture</h3>
                <p className="text-sm dark:text-gray-300 traditional:text-traditional-text">
                  {answer.scripturePassage}
                </p>
                <p className="text-xs text-right mt-1 font-semibold text-gray-600 dark:text-gray-400 traditional:text-traditional-primary">
                  — {answer.scriptureReference}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary mb-1">Relatable Example</h3>
                <p className="text-sm dark:text-gray-300 traditional:text-traditional-text">{answer.relatableExample}</p>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary mb-2">Actionable Steps</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {answer.actionableSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="border-t dark:border-gray-700 traditional:border-traditional-primary/20 pt-3 flex items-center justify-between text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary">
                <SpeechControls answer={answer} language={language} />
                <div className="flex items-center space-x-2">
                  <button onClick={onAskFollowUp} className="hover:text-gray-800 dark:hover:text-gray-200 traditional:hover:text-traditional-primary transition-colors" title="Ask follow-up">
                    <ReplyIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => setShowShareModal(true)} className="hover:text-gray-800 dark:hover:text-gray-200 traditional:hover:text-traditional-primary transition-colors" title="Share">
                    <ShareIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => toggleSaveMessage(message.id)} className="hover:text-gray-800 dark:hover:text-gray-200 traditional:hover:text-traditional-primary transition-colors" title="Save answer">
                    <BookmarkIcon className="w-5 h-5" isFilled={message.isSaved} />
                  </button>
                </div>
              </div>
              
            </div>
          ) : (
            <p className="italic text-gray-500">{message.text}</p>
          )}
        </div>
        {user && (
          <button onClick={() => deleteMessage(message.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300" title="Delete message">
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {answer && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          answer={answer}
        />
      )}
    </>
  );
};

export default MessageCard;