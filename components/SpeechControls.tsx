import React, { useState, useEffect, useCallback } from 'react';
import type { Answer, SpeechState, Language } from '../types';
import { PlayIcon, PauseIcon, StopIcon } from './icons';

interface SpeechControlsProps {
  answer: Answer;
  language: Language;
}

// Keep utterance in a module-level scope to persist it across re-renders
// and allow for on-the-fly modifications (like rate change).
let utterance: SpeechSynthesisUtterance | null = null;

const SpeechControls: React.FC<SpeechControlsProps> = ({ answer, language }) => {
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState<number>(1);

  // Effect to load voices and clean up on unmount
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Initial load

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      // Ensure any speech is stopped when the component unmounts
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      utterance = null;
    };
  }, []); // Run only once

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

    // Prioritize voice based on selected language for a more authentic experience
    if (language === 'Hindi') {
      voice = voices.find(v => v.lang === 'hi-IN');
    } else if (language === 'Hinglish') {
      // Prioritize Indian English for Hinglish, as it handles mixed language well
      voice = voices.find(v => v.lang === 'en-IN');
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

    // Apply the selected rate
    utterance.rate = rate;

    utterance.onend = () => {
      setSpeechState('stopped');
      utterance = null;
    };
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setSpeechState('stopped');
        utterance = null;
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
  
  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (utterance) {
      // Update rate on the fly if speech is active or paused
      utterance.rate = newRate;
    }
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

      {/* Divider */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 traditional:bg-traditional-primary/30"></div>
      
      {/* Rate Controls */}
      <div className="flex items-center space-x-1">
        {[0.75, 1, 1.25].map((r) => (
          <button
            key={r}
            onClick={() => handleRateChange(r)}
            className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
              rate === r
                ? 'bg-traditional-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 traditional:bg-traditional-primary/20 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-pressed={rate === r}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeechControls;
