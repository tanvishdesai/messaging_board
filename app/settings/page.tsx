"use client";

import React, { useState, useEffect } from 'react';
import { Client, Account } from "appwrite";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<any>(null);
  
  // Initialize Appwrite
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  
  const account = new Account(client);
  
  // Fetch user data
  useEffect(() => {
    account.get()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
        fetchUserPrefs();
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);
  
  // Fetch user preferences
  const fetchUserPrefs = async () => {
    try {
      const prefs = await account.getPrefs();
      setUserPrefs(prefs);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to access settings.</p>
          <a href="/signin" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Account Settings</h1>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  disabled
                  value={user.name || 'Not set'}
                  className="flex-1 focus:ring-primary focus:border-primary block w-full min-w-0 rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed opacity-60"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                To change your name, please contact support.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="flex-1 focus:ring-primary focus:border-primary block w-full min-w-0 rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed opacity-60"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                To change your email, please contact support.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enrollment Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  disabled
                  value={userPrefs?.enrollmentNo || 'Not set'}
                  className="flex-1 focus:ring-primary focus:border-primary block w-full min-w-0 rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-not-allowed opacity-60"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                To change your enrollment number, please contact support.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              More settings coming soon! We're working on adding more customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 