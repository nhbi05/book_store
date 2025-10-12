import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || formData.email
        };

        onLogin(user);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to login. Please try again.';
      
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (err.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#e4c5c5' }}>
      {/* Books Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          {/* Decorative book shapes */}
          <div className="absolute top-10 left-10 w-16 h-20 bg-blue-600 transform rotate-12 rounded-sm shadow-lg"></div>
          <div className="absolute top-32 left-32 w-12 h-16 bg-red-500 transform -rotate-6 rounded-sm shadow-lg"></div>
          <div className="absolute top-20 right-20 w-14 h-18 bg-green-600 transform rotate-45 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-20 left-20 w-18 h-24 bg-purple-600 transform -rotate-12 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-32 right-32 w-16 h-20 bg-yellow-600 transform rotate-6 rounded-sm shadow-lg"></div>
          <div className="absolute top-1/2 left-20 w-10 h-14 bg-indigo-600 transform rotate-25 rounded-sm shadow-lg"></div>
          <div className="absolute top-1/3 right-40 w-12 h-16 bg-pink-600 transform -rotate-30 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-1/3 left-1/3 w-14 h-18 bg-teal-600 transform rotate-15 rounded-sm shadow-lg"></div>
        </div>
        
        {/* Floating book icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BookOpen className="absolute top-1/4 left-1/4 w-8 h-8 text-amber-300 opacity-20 animate-pulse" />
          <BookOpen className="absolute top-3/4 right-1/4 w-6 h-6 text-orange-300 opacity-30 animate-pulse animation-delay-1000" />
          <BookOpen className="absolute top-1/2 right-1/3 w-10 h-10 text-red-300 opacity-15 animate-pulse animation-delay-2000" />
          <BookOpen className="absolute bottom-1/4 left-1/3 w-7 h-7 text-blue-300 opacity-25 animate-pulse animation-delay-500" />
        </div>
      </div>

      {/* Glass card container */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <BookOpen className="h-16 w-16 text-amber-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              BookStore
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to manage your literary world
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-amber-600 hover:text-amber-700 transition-colors underline decoration-2 underline-offset-2"
              >
                Create one here
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    // You can implement password reset functionality here
                    alert('Password reset functionality would be implemented here with Supabase auth.resetPasswordForEmail()');
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 transition-colors underline decoration-2 underline-offset-2"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200 p-4">
                <div className="text-sm text-red-700 font-medium">
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Sign in to BookStore
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50">
              <div className="text-center">
                <p className="text-xs text-blue-800">
                  🔐 <strong>Security Notice:</strong> For enhanced security, you'll be automatically logged out when you refresh the page or close the browser.
                </p>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl border border-amber-200/50">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Quick Demo Access
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-amber-700 font-mono">demo@bookstore.com</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-gray-600 font-medium">Password:</span>
                    <span className="text-amber-700 font-mono">demo123</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
