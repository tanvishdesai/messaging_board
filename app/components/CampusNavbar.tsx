"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BellIcon, UserCircleIcon, SunIcon, MoonIcon,  MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

type NavbarProps = {
  user: {
    $id?: string;
    name?: string;
    email?: string;
    imageUrl?: string;
  } | null;
  onLogout?: () => void;
  campusName?: string;
  logoUrl?: string;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  unreadNotifications?: number;
};

const CampusNavbar: React.FC<NavbarProps> = ({ 
  user,
  
  campusName = "Campus Whispers",
  logoUrl,
  onSignIn,
  onSignOut,
  onSearch,
  unreadNotifications = 0
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  
  // Check for dark mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setDarkMode(isDarkMode);
      document.documentElement.classList[isDarkMode ? 'add' : 'remove']('dark');
    }
  }, []);
  
  // Handle scroll for transparent to solid background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList[newMode ? 'add' : 'remove']('dark');
  };
  
 
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setIsProfileOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);
  
  return (
    <header 
      className={`sticky top-0 z-40 w-full ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' 
          : 'bg-white dark:bg-gray-900'
      } transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt={campusName}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="bg-gradient-to-r from-primary to-tertiary w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-lg mr-2">
                  CW
                </div>
              )}
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary">
                {campusName}
              </span>
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
          
          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              {unreadNotifications > 0 ? (
                <>
                  <BellIconSolid className="h-5 w-5" />
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                </>
              ) : (
                <BellIcon className="h-5 w-5" />
              )}
            </button>
            
            {/* Settings */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            
            {/* User Menu */}
            <div className="relative user-menu-container">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                      {user.name || user.email || 'User'}
                    </span>
                  </>
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </button>
              
              {/* User Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-10 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user ? (
                        user.name || 'User'
                      ) : (
                        'Not logged in'
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user ? (
                        user.email || ''
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onSignOut && onSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
            >
              <span className={`block w-5 h-0.5 bg-current mb-1 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current mb-1 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Search and Menu */}
      <div 
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-gray-200 dark:border-gray-700 animate-slideDown`}
      >
        <div className="px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>
        
        <div className="px-2 pt-2 pb-3 space-y-1">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="flex items-center">
              <BellIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Notifications</span>
            </div>
            {unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <>
                <SunIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
              </>
            )}
          </button>
          
          <div className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Settings</span>
          </div>
          
          {user ? (
            <>
              <div className="flex items-center p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {user.name?.[0] || user.email?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email || ''}
                  </p>
                </div>
              </div>
              
              <Link href="/profile" className="block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                Your Profile
              </Link>
              
              {onSignOut && (
                <button 
                  onClick={onSignOut}
                  className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                >
                  Sign out
                </button>
              )}
            </>
          ) : (
            <div>
              {onSignIn && (
                <button 
                  onClick={onSignIn}
                  className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600"
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CampusNavbar; 