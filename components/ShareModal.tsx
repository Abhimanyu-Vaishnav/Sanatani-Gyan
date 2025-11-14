import React, { useState } from 'react';
import type { Answer } from '../types';
import { XIcon, CopyIcon } from './icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: Answer;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, answer }) => {
  const [includeTeaching, setIncludeTeaching] = useState(true);
  const [includeExample, setIncludeExample] = useState(true);
  const [includeSteps, setIncludeSteps] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateShareText = () => {
    let text = `Wisdom from Sanatani Gyan (${answer.scriptureReference}):\n\n`;
    if (includeTeaching) text += `"${answer.shortTeaching}"\n\n`;
    if (includeExample) text += `Example: ${answer.relatableExample}\n\n`;
    if (includeSteps) {
      text += `Steps:\n${answer.actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    return text.trim();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShareToX = () => {
    const text = generateShareText();
    const tweetText = text.length > 280 ? text.substring(0, 277) + '...' : text;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 traditional:bg-traditional-card rounded-lg shadow-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold font-serif mb-4 text-gray-800 dark:text-gray-100 traditional:text-traditional-text">Share Wisdom</h3>
        
        <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeTeaching} onChange={() => setIncludeTeaching(!includeTeaching)} className="h-5 w-5 rounded text-traditional-primary focus:ring-traditional-primary/50" />
                <span className="text-gray-700 dark:text-gray-300 traditional:text-traditional-text">Short Teaching</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeExample} onChange={() => setIncludeExample(!includeExample)} className="h-5 w-5 rounded text-traditional-primary focus:ring-traditional-primary/50" />
                <span className="text-gray-700 dark:text-gray-300 traditional:text-traditional-text">Relatable Example</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeSteps} onChange={() => setIncludeSteps(!includeSteps)} className="h-5 w-5 rounded text-traditional-primary focus:ring-traditional-primary/50" />
                <span className="text-gray-700 dark:text-gray-300 traditional:text-traditional-text">Actionable Steps</span>
            </label>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700/50 traditional:bg-traditional-bg p-3 rounded-md mb-6 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300 traditional:text-traditional-text whitespace-pre-wrap">{generateShareText()}</p>
        </div>

        <div className="flex justify-end items-center space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 traditional:hover:bg-traditional-primary/20">
            Cancel
          </button>
          <button onClick={handleCopyToClipboard} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md traditional:text-traditional-secondary traditional:bg-traditional-primary/20 traditional:hover:bg-traditional-primary/40">
            <CopyIcon className="w-5 h-5"/>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button onClick={handleShareToX} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
            <XIcon className="w-4 h-4" />
            <span>Share on X</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;