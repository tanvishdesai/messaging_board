"use client";

import React, { useState, useEffect } from 'react';
import { Client, Account, Databases, Query } from "appwrite";
import Link from 'next/link';

interface Message {
  $id: string;
  userId: string;
  message: string;
  $createdAt: string;
  anonymous: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Message[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<any>(null);
  
  // Initialize Appwrite
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  
  const account = new Account(client);
  const databases = new Databases(client);
  
  const databaseId = process.env.NEXT_PUBLIC_AW_DATABASE_ID!;
  const messagesCollectionId = process.env.NEXT_PUBLIC_AW_COLLECTION_ID!;
  
  // Fetch user data
  useEffect(() => {
    account.get()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
        fetchUserPosts(userData.$id);
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
  
  // Fetch user posts
  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await databases.listDocuments(
        databaseId,
        messagesCollectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      
      setUserPosts(response.documents as unknown as Message[]);
      setPostsLoading(false);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPostsLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to view your profile.</p>
          <a href="/signin" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0] || user.email?.[0] || 'U'}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              {userPrefs?.enrollmentNo && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Enrollment No:</span> {userPrefs.enrollmentNo}
                </p>
              )}
              <div className="mt-2">
                <Link 
                  href="/settings" 
                  className="text-sm text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Edit Profile Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Posts */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Posts</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {postsLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">You haven't created any posts yet.</p>
              <Link 
                href="/" 
                className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Create a Post
              </Link>
            </div>
          ) : (
            userPosts.map(post => (
              <div key={post.$id} className="p-6">
                <div className="flex justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.$createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.anonymous ? 'Posted anonymously' : 'Posted with name'}
                  </p>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {post.message}
                </p>
                <div className="mt-2">
                  <Link 
                    href={`/?message=${post.$id}`}
                    className="text-sm text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    View Post & Replies
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 