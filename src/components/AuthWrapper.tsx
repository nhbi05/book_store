import React, { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import Login from '../pages/Login';
import Register from '../pages/Register';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('bookstore_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('bookstore_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookstore_user', JSON.stringify(userData));
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookstore_user', JSON.stringify(userData));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showRegister ? (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return <>{children(user)}</>;
};

export default AuthWrapper;
