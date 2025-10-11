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
    // Always clear sessions on app load - force logout
    const clearAllSessions = async () => {
      // Clear localStorage
      localStorage.removeItem('bookstore_user');
      
      // Sign out from Supabase to clear any existing sessions
      await supabase.auth.signOut();
      
      // Always start with no user logged in
      setUser(null);
      setIsLoading(false);
    };

    clearAllSessions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        };
        setUser(userData);
        // No localStorage persistence - session will not survive page refresh
      } else {
        setUser(null);
        // Clear any leftover localStorage data
        localStorage.removeItem('bookstore_user');
      }
    });

    // Clear session when user closes browser/tab
    const handleBeforeUnload = () => {
      localStorage.removeItem('bookstore_user');
      supabase.auth.signOut();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // No localStorage persistence - user will be logged out on refresh
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    // No localStorage persistence - user will be logged out on refresh
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
