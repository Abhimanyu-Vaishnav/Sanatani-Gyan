import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    let success = false;
    if (isLogin) {
      success = login(username);
      if (!success) setError('User not found. Please check the username or sign up.');
    } else {
      success = signup(username);
      if (!success) setError('This username is already taken. Please choose another.');
    }

    if (success) {
      setUsername('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 traditional:bg-traditional-card rounded-lg shadow-2xl p-8 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-serif text-center mb-2 text-gray-800 dark:text-gray-100 traditional:text-traditional-text">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 traditional:text-traditional-text mb-6">
          {isLogin ? 'Login to access your saved history.' : 'Sign up to save your conversations.'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 traditional:text-traditional-secondary mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-traditional-primary focus:border-traditional-primary dark:bg-gray-700 dark:text-white traditional:bg-white traditional:border-traditional-primary/50 traditional:focus:ring-traditional-primary/50 traditional:focus:border-traditional-primary"
              placeholder="e.g., Arjuna"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-traditional-primary text-white py-2 px-4 rounded-md hover:bg-traditional-secondary transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-traditional-primary hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;