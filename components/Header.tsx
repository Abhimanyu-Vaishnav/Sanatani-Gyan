import React, { useContext } from 'react';
import { Theme } from '../types';
import { SunIcon, MoonIcon, OmIcon, UserIcon, LogoutIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  openAuthModal: () => void;
  clearHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, openAuthModal, clearHistory }) => {
  const { user, logout } = useContext(AuthContext);

  const handleClearHistory = () => {
    if(window.confirm("Are you sure you want to delete all your chat history? This cannot be undone.")) {
      clearHistory();
    }
  }

  return (
    <header className="sticky top-0 z-20 p-4 bg-white/80 dark:bg-gray-900/80 traditional:bg-traditional-bg/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <OmIcon className="h-8 w-8 text-gray-700 dark:text-gray-200 traditional:text-traditional-primary" />
          <h1 className="text-xl md:text-2l font-serif font-bold text-gray-800 dark:text-gray-100 traditional:text-traditional-secondary">
            Sanatani Gyan
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 traditional:bg-traditional-card p-1 rounded-full">
            <button onClick={() => setTheme(Theme.Light)} className={`p-1.5 rounded-full transition-colors ${theme === Theme.Light ? 'bg-white shadow' : 'text-gray-500'}`} aria-label="Light mode">
              <SunIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme(Theme.Dark)} className={`p-1.5 rounded-full transition-colors ${theme === Theme.Dark ? 'bg-gray-800 text-white shadow' : 'text-gray-500'}`} aria-label="Dark mode">
              <MoonIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme(Theme.Traditional)} className={`p-1.5 rounded-full transition-colors ${theme === Theme.Traditional ? 'bg-traditional-primary text-white shadow' : 'text-traditional-secondary'}`} aria-label="Traditional mode">
              <OmIcon className="w-5 h-5" />
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={handleClearHistory} className="text-sm text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary hover:underline">
                Clear History
              </button>
              <div className="flex items-center space-x-2">
                 <UserIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 traditional:text-traditional-secondary" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-200 traditional:text-traditional-secondary hidden sm:inline">{user.username}</span>
              </div>
              <button onClick={logout} aria-label="Logout" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 traditional:hover:bg-traditional-primary/20">
                <LogoutIcon className="w-6 h-6 text-gray-600 dark:text-gray-300 traditional:text-traditional-secondary"/>
              </button>
            </div>
          ) : (
            <button 
              onClick={openAuthModal}
              className="px-3 py-1.5 text-sm font-semibold bg-gray-800 text-white rounded-full hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 traditional:bg-traditional-primary traditional:hover:bg-traditional-secondary transition-colors"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;