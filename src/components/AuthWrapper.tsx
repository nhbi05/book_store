import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';
import Login from '../pages/Login';
import Register from '../pages/Register';

interface AuthWrapperProps {
  children: (user: User, logout: () => Promise<void>) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        };
        setUser(userData);
        localStorage.setItem('bookstore_user', JSON.stringify(userData));
      }
      setIsLoading(false);
    };

    getSession();    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        };
        setUser(userData);
        localStorage.setItem('bookstore_user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('bookstore_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookstore_user', JSON.stringify(userData));
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bookstore_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('bookstore_user');
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
  return <>{children(user, handleLogout)}</>;
};

export default AuthWrapper;
