"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { Client, Account, Databases, Query } from "appwrite";
import { 
  BellIcon, 
  UserCircleIcon, 
  SunIcon, 
  MoonIcon,  
  MagnifyingGlassIcon, 
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { signOut } from "../lib/appwrite";

interface AppwriteUser {
  $id?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}

interface Notification {
  $id: string;
  messageId: string;
  message: string;
  replyId: string;
  replyContent: string;
  createdAt: string;
  isRead: boolean;
}

export default function UnifiedNavbar() {
  // Always call hooks at the top
  const pathname = usePathname();
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Initialize Appwrite clients
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  
  const account = new Account(client);
  const databases = new Databases(client);
  
  const databaseId = process.env.NEXT_PUBLIC_AW_DATABASE_ID!;
  const messagesCollectionId = process.env.NEXT_PUBLIC_AW_COLLECTION_ID!;
  const repliesCollectionId = process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID!;

  // Fetch user on component mount and route change
  useEffect(() => {
    account
      .get()
      .then((userData: AppwriteUser) => {
        setUser(userData);
        fetchNotifications(userData);
      })
      .catch(() => {
        setUser(null);
      });
  }, [pathname]);
  
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
    if (searchTerm.trim()) {
      // Use search function to filter posts
      // This will need to be handled by the parent component in the actual implementation
      console.log("Searching for:", searchTerm.trim());
    }
  };
  
  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // Fetch notifications
  const fetchNotifications = useCallback(async (currentUser: AppwriteUser | null = user) => {
    if (!currentUser || !currentUser.$id) return;
    
    try {
      // 1. Get user's posts
      const userPosts = await databases.listDocuments(
        databaseId,
        messagesCollectionId,
        [Query.equal('userId', currentUser.$id)]
      );
      
      if (userPosts.documents.length === 0) return;
      
      // 2. Get all post IDs from user
      const userPostIds = userPosts.documents.map(post => post.$id);
      
      // 3. Get replies to those posts, ordered by creation date
      const allReplies: any[] = [];
      for (const postId of userPostIds) {
        const replies = await databases.listDocuments(
          databaseId,
          repliesCollectionId,
          [
            Query.equal('messageId', postId),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
          ]
        );
        
        // Add post message to each reply for context
        const postMessage = userPosts.documents.find((p: any) => p.$id === postId)?.message || '';
        
        const typedReplies = replies.documents as any[];
        allReplies.push(...typedReplies.map(reply => ({
          ...reply,
          message: postMessage,
          createdAt: reply.$createdAt,
          isRead: reply.isRead || false
        })));
      }
      
      // Sort all replies by creation date
      const sortedReplies = allReplies.sort((a, b) => 
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );
      
      // Convert to Notification type
      const notifications: Notification[] = sortedReplies.map(reply => ({
        $id: reply.$id,
        messageId: reply.messageId,
        message: reply.message,
        replyId: reply.$id,
        replyContent: reply.reply,
        createdAt: reply.$createdAt,
        isRead: reply.isRead
      }));
      
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.isRead).length);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user, databases, databaseId, messagesCollectionId, repliesCollectionId]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    try {
      // First update the local state for immediate UI feedback
      setNotifications(prev => 
        prev.map(n => n.$id === notificationId ? {...n, isRead: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Then update in the database
      const result = await databases.updateDocument(
        databaseId,
        repliesCollectionId,
        notificationId,
        { isRead: true }
      );
      
      console.log('Successfully marked notification as read:', result);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert the local state change on error
      fetchNotifications(); // Re-fetch to get the correct state
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        await databases.updateDocument(
          databaseId,
          repliesCollectionId,
          notification.$id,
          { isRead: true }
        );
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({...n, isRead: true}))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Toggle notifications panel
  const handleToggleNotifications = () => {
    // Fetch latest notifications when opening panel
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };
  
  // Handle opening a notification
  const handleOpenNotification = (notification: Notification) => {
    // Mark as read
    handleMarkAsRead(notification.$id);
    
    // Open the related message (implementation will depend on your app's structure)
    router.push(`/?message=${notification.messageId}`);
    
    // Close notification panel
    setShowNotifications(false);
  };
  
  // Refresh notifications periodically
  useEffect(() => {
    if (!user) return;
    
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Check every minute
    
    return () => clearInterval(notificationInterval);
  }, [user, fetchNotifications]);
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (isProfileOpen && !target.closest('.user-menu-container')) {
        setIsProfileOpen(false);
      }
      
      if (showNotifications && !target.closest('.notifications-container') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, showNotifications]);
  
  // Conditionally render Navbar
  if (pathname === "/signin" || pathname === "/signup") {
    return null;
  }

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
              <div className="bg-gradient-to-r from-primary to-tertiary w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-lg mr-2">
                CW
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary">
                Campus Whispers
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
                className="w-full py-2 pl-10 pr-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
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
            <button 
              onClick={handleToggleNotifications}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative notification-button"
            >
              {unreadCount > 0 ? (
                <>
                  <BellIconSolid className="h-5 w-5" />
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              ) : (
                <BellIcon className="h-5 w-5" />
              )}
            </button>
            
            {/* Settings */}
            <button 
              onClick={() => router.push('/settings')}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
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
                      {user?.email || ''}
                    </p>
                  </div>
                  
                  {/* User Profile Section */}
                  {user ? (
                    <>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Profile
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/signin" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/signup" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md animate-slideDown">
          <div className="pt-2 pb-3 px-2">
            <div className="relative mb-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </form>
            </div>
            
            <button 
              onClick={handleToggleNotifications}
              className="flex w-full items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <BellIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            
            <button
              onClick={() => router.push('/settings')}
              className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Settings</span>
            </button>
            
            {user ? (
              <>
                <Link 
                  href="/profile"
                  className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Profile</span>
                </Link>
                <div className="px-2">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center p-2 text-red-600 dark:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="mr-3 h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                      </svg>
                      Logout
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 flex justify-between">
                <Link
                  href="/signin"
                  className="w-1/2 mr-1 py-2 text-center bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-1/2 ml-1 py-2 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 notifications-container">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex space-x-3">
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map(notification => (
                <li 
                  key={notification.$id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex flex-col">
                    <div 
                      onClick={() => handleOpenNotification(notification)}
                      className="cursor-pointer mb-2"
                    >
                      <p className="text-base font-medium text-gray-900 dark:text-white truncate mb-1">
                        New reply to your post
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm italic text-gray-700 dark:text-gray-300 mb-1 truncate">
                        Your post: &quot;{notification.message}&quot;
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {notification.replyContent}
                      </p>
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.$id);
                        }}
                        className="self-end text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </header>
  );
} 