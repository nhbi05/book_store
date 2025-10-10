import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import type { User as UserType } from '../types/auth';

interface RegisterProps {
  onRegister: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful registration
      const user: UserType = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email
      };

      onRegister(user);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Books Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 opacity-10">
          {/* Decorative book shapes */}
          <div className="absolute top-16 right-16 w-16 h-20 bg-emerald-600 transform -rotate-12 rounded-sm shadow-lg"></div>
          <div className="absolute top-40 right-40 w-12 h-16 bg-teal-500 transform rotate-6 rounded-sm shadow-lg"></div>
          <div className="absolute top-32 left-16 w-14 h-18 bg-cyan-600 transform -rotate-45 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-16 right-16 w-18 h-24 bg-blue-600 transform rotate-12 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-40 left-40 w-16 h-20 bg-indigo-600 transform -rotate-6 rounded-sm shadow-lg"></div>
          <div className="absolute top-1/2 right-16 w-10 h-14 bg-green-600 transform -rotate-25 rounded-sm shadow-lg"></div>
          <div className="absolute top-2/3 left-20 w-12 h-16 bg-lime-600 transform rotate-30 rounded-sm shadow-lg"></div>
          <div className="absolute bottom-1/4 right-1/3 w-14 h-18 bg-violet-600 transform -rotate-15 rounded-sm shadow-lg"></div>
        </div>
        
        {/* Floating book icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BookOpen className="absolute top-1/3 right-1/4 w-8 h-8 text-emerald-300 opacity-20 animate-pulse" />
          <BookOpen className="absolute bottom-1/4 left-1/4 w-6 h-6 text-teal-300 opacity-30 animate-pulse animation-delay-1000" />
          <BookOpen className="absolute top-1/2 left-1/3 w-10 h-10 text-cyan-300 opacity-15 animate-pulse animation-delay-2000" />
          <BookOpen className="absolute top-1/4 right-1/3 w-7 h-7 text-blue-300 opacity-25 animate-pulse animation-delay-500" />
        </div>
      </div>

      {/* Glass card container */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <BookOpen className="h-16 w-16 text-emerald-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              BookStore
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Join Our Library
            </h2>
            <p className="text-gray-600">
              Create your account to start your literary journey
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-2"
              >
                Sign in here
              </button>
            </p>
          </div>          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
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
              className="w-full flex justify-center py-3 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating your account...
                </div>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Join BookStore
                </>
              )}
            </button>

            {/* Terms */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl border border-emerald-200/50">
              <p className="text-xs text-center text-emerald-800">
                By creating an account, you agree to our{' '}
                <a href="#" className="font-semibold text-emerald-700 hover:text-emerald-800 underline decoration-2 underline-offset-2">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-emerald-700 hover:text-emerald-800 underline decoration-2 underline-offset-2">
                  Privacy Policy
                </a>
              </p>            </div>
          </form>
        </div>
      </div>
    </div>  );
};

export default Register;
