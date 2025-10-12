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
    // Check for existing session on app load
    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else if (session?.user) {
          // User has valid session, set user data
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || ''
          };
          setUser(userData);
        } else {
          // No valid session
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      
      // Update loading state when auth state changes
      if (event === 'SIGNED_OUT') {
        setIsLoading(false);
      }
    });

    // Handle browser/tab close - only clear session on complete browser close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only sign out if the user is actually closing the browser/tab
      // Note: This will still persist sessions on page refresh
      if (event.type === 'beforeunload') {
        // For persistent sessions, we don't sign out on beforeunload
        // The session will be maintained until explicit logout
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleLogin = (userData: User) => {
    setUser(userData);
    // Session persistence is handled by Supabase automatically
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    // Session persistence is handled by Supabase automatically
  };
  const handleLogout = async () => {
    try {
      // Sign out from Supabase - this will clear the session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      // User state will be updated via the auth state change listener
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear user state even if there's an error
      setUser(null);
    }
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
