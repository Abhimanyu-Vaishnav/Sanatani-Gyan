import React from 'react';

const prompts = [
  "How can I practice detachment in my daily life?",
  "What is the role of 'dharma' in making difficult choices?",
  "How can I find peace amidst chaos?",
  "What do the scriptures say about dealing with failure?",
];

// Function to get a random subset of prompts
const getRandomPrompts = (count: number) => {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};


interface PromptSuggestionsProps {
  onPromptClick: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onPromptClick }) => {
  const [suggestedPrompts] = React.useState(() => getRandomPrompts(3));

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-2 animate-fade-in">
      <h3 className="text-sm font-semibold text-center mb-2 text-gray-500 dark:text-gray-400 traditional:text-traditional-secondary">
        Need inspiration? Try one of these prompts.
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 traditional:bg-traditional-card text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 traditional:hover:bg-traditional-primary/20 transition-all duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
