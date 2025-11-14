import React, { useState, useEffect, useCallback } from 'react';
import type { Answer, SpeechState, Language } from '../types';
import { PlayIcon, PauseIcon, StopIcon } from './icons';

interface SpeechControlsProps {
  answer: Answer;
  language: Language;
}

let utterance: SpeechSynthesisUtterance | null = null;

const SpeechControls: React.FC<SpeechControlsProps> = ({ answer, language }) => {
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Initial load

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      // Cleanup: stop speaking if component unmounts
      if (speechState !== 'stopped') {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechState]);

  const getFullText = useCallback(() => {
    return `
      ${answer.shortTeaching}.
      From ${answer.scriptureReference}, it is said: ${answer.scripturePassage}.
      Here is an example: ${answer.relatableExample}.
      Here are three steps you can take:
      First, ${answer.actionableSteps[0]}.
      Second, ${answer.actionableSteps[1]}.
      And third, ${answer.actionableSteps[2]}.
    `;
  }, [answer]);

  const handlePlay = () => {
    if (speechState === 'paused' && utterance) {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    const textToRead = getFullText();
    utterance = new SpeechSynthesisUtterance(textToRead);

    let voice: SpeechSynthesisVoice | undefined;

    // Prioritize voice based on selected language
    if (language === 'Hindi') {
      voice = voices.find(v => v.lang === 'hi-IN');
    } else if (language === 'Hinglish') {
      voice = voices.find(v => v.lang === 'en-IN'); // Prioritize Indian English for Hinglish
    }
    
    // Fallback for English or if preferred voice not found
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en-') && v.localService);
    }

    // Final fallback to any english voice
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en-'));
    }

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onend = () => setSpeechState('stopped');
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setSpeechState('stopped');
    };

    window.speechSynthesis.speak(utterance);
    setSpeechState('playing');
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setSpeechState('paused');
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeechState('stopped');
    utterance = null;
  };
  
  return (
    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary">
      {speechState !== 'playing' ? (
        <button onClick={handlePlay} className="hover:text-gray-800 dark:hover:text-gray-100 traditional:hover:text-traditional-primary transition-colors" title={speechState === 'paused' ? 'Resume' : 'Play'}>
          <PlayIcon className="w-5 h-5" />
        </button>
      ) : (
        <button onClick={handlePause} className="hover:text-gray-800 dark:hover:text-gray-100 traditional:hover:text-traditional-primary transition-colors" title="Pause">
          <PauseIcon className="w-5 h-5" />
        </button>
      )}
      {speechState !== 'stopped' && (
        <button onClick={handleStop} className="hover:text-gray-800 dark:hover:text-gray-100 traditional:hover:text-traditional-primary transition-colors" title="Stop">
          <StopIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SpeechControls;