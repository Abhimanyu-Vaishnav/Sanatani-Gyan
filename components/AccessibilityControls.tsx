import React from 'react';
import type { FontSize } from '../types';

interface AccessibilityControlsProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  onClose: () => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  onClose,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 traditional:bg-traditional-card rounded-lg shadow-xl border dark:border-gray-700 traditional:border-traditional-primary/20 p-4 z-30">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 traditional:text-traditional-secondary mb-2">
            Font Size
          </label>
          <div className="flex items-center space-x-2">
            {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                  fontSize === size
                    ? 'bg-traditional-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 traditional:bg-traditional-primary/20 text-gray-700 dark:text-gray-200 traditional:text-traditional-secondary'
                }`}
              >
                {size === 'sm' && 'Small'}
                {size === 'md' && 'Medium'}
                {size === 'lg' && 'Large'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="high-contrast-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 traditional:text-traditional-secondary">
              High Contrast
            </label>
            <button
              id="high-contrast-toggle"
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                highContrast ? 'bg-traditional-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityControls;
