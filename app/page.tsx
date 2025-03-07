"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  memo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Client, Account, Databases, Query, ID } from "appwrite";

import {
  ShareIcon} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Import our new components
import CampusFeed from './components/CampusFeed';
import CampusComposer from './components/CampusComposer';
import CampusModal from './components/CampusModal';
import MessageDetails from './components/MessageDetails';

interface AppwriteUser {
  $id?: string;
  name?: string;
  email?: string;
}

// Add CSS animations

// Add these type definitions before the component
interface VoteDocument {
  $id: string;
  postId: string;
  userId: string;
  vote: number; // 1 for upvote, -1 for downvote
}

interface VoteInfo {
  upvotes: number;
  downvotes: number;
  userVoted: number | null;
}

type VotesMap = Record<string, VoteInfo>;

// Add type definitions for reactions and replies
interface ReactionInfo {
  count: number;
  userReacted: boolean;
}

interface ReactionsMap {
  [postId: string]: {
    [reaction: string]: ReactionInfo;
  };
}

interface ReplyCountMap {
  [postId: string]: number;
}

// Add type definitions for filtered posts and notifications
interface Post {
  $id: string;
  message: string;
  createdAt: string;
  category: Category;
  isAnonymous: boolean;
  userId?: string;
  userName?: string;
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

// Add interface for reply documents from Appwrite
interface ReplyDocument {
  $id: string;
  messageId: string;
  reply: string;
  $createdAt: string;
  userId: string;
  isRead: boolean;
  isAnonymous: boolean;
}

// Add interface for reply with message context
interface ReplyWithMessage extends ReplyDocument {
  message: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppwriteUser | null>(null);

  useEffect(() => {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
    const account = new Account(client);

    account
      .get()
      .then((userData: AppwriteUser) => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        router.push("/signup");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Loading Campus Whispers</h2>
        <p className="text-gray-500 dark:text-gray-400">Connecting to your campus community...</p>
      </div>
    );
  }

  return <CampusWhispersPage user={user!} />;
}

interface CampusWhispersPageProps {
  user: AppwriteUser;
}


type Category = 'general' | 'academics' | 'social' | 'housing' | 'food' | 'sports' | 'events' | 'all';

// ----------------------
// Modal Component
// ----------------------
const Modal = memo(
  ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-white/10 border border-white/20 rounded-lg shadow-2xl backdrop-blur-md flex flex-col max-h-[90vh] animate-fadeIn"
        >
          {/* Modal Header */}
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-white/10 border-b border-white/20 rounded-t-lg">
            <h3 className="text-lg font-semibold text-white">
              Confession & Replies
            </h3>
            <button
              onClick={onClose}
              className="text-xl font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg w-8 h-8 flex items-center justify-center transition"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

// ----------------------
// ReplyTextArea Component
// ----------------------
const ReplyTextArea = memo(
  ({
    value,
    onChange,
    onSubmit,
    onShare,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onShare?: () => void;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, []);

    return (
      <div className="sticky bottom-0 bg-white/10 p-4 border-t border-white/20">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-3 bg-transparent border border-white/30 rounded-md mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          rows={2}
        />
        <div className="flex space-x-4">
          <button
            onClick={onSubmit}
            className="flex-1 py-2 font-semibold rounded-md bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition text-white"
          >
            Send Reply
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="py-2 px-4 font-semibold rounded-md border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white transition flex items-center gap-1"
            >
              <ShareIcon className="w-5 h-5" />
              Share
            </button>
          )}
        </div>
      </div>
    );
  }
);
ReplyTextArea.displayName = "ReplyTextArea";

// ----------------------
// ConfessionsPage Component
// ----------------------
const CampusWhispersPage: React.FC<CampusWhispersPageProps> = ({ user }) => {
  const router = useRouter();
  const client = useMemo(() => new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!), []);

  const databases = useMemo(() => new Databases(client), [client]);

  // Check environment variables
  if (
    !process.env.NEXT_PUBLIC_AW_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_AW_DATABASE_ID ||
    !process.env.NEXT_PUBLIC_AW_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_VOTES_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_ENDPOINT
  ) {
    console.error('Missing required environment variables:', {
      NEXT_PUBLIC_AW_PROJECT_ID: !!process.env.NEXT_PUBLIC_AW_PROJECT_ID,
      NEXT_PUBLIC_AW_DATABASE_ID: !!process.env.NEXT_PUBLIC_AW_DATABASE_ID,
      NEXT_PUBLIC_AW_COLLECTION_ID: !!process.env.NEXT_PUBLIC_AW_COLLECTION_ID,
      NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID: !!process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID,
      NEXT_PUBLIC_AW_VOTES_COLLECTION_ID: !!process.env.NEXT_PUBLIC_AW_VOTES_COLLECTION_ID,
      NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID: !!process.env.NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID,
      NEXT_PUBLIC_AW_ENDPOINT: !!process.env.NEXT_PUBLIC_AW_ENDPOINT
    });
    throw new Error("Required environment variables are not set");
  }

  const databaseId = process.env.NEXT_PUBLIC_AW_DATABASE_ID;
  const messagesCollectionId = process.env.NEXT_PUBLIC_AW_COLLECTION_ID;
  const repliesCollectionId = process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID;
  const votesCollectionId = process.env.NEXT_PUBLIC_AW_VOTES_COLLECTION_ID;
  const reactionsCollectionId = process.env.NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID;
  const replyVotesCollectionId = process.env.NEXT_PUBLIC_AW_REPLY_VOTES_COLLECTION_ID;

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [votes, setVotes] = useState<VotesMap>({});
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [replyCountMap, setReplyCountMap] = useState<ReplyCountMap>({});
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [selectedMessageContent, setSelectedMessageContent] = useState<string>("");
  const [selectedMessageReplies, setSelectedMessageReplies] = useState<{
    id: string;
    content: string;
    timestamp: string;
    userId?: string;
    userName?: string;
    isAnonymous: boolean;
    votes: number;
    userVoted?: 1 | -1 | null;
  }[]>([]);
  
  const [isComposerMinimized, setIsComposerMinimized] = useState(true);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  
  // Theme state - dark mode handled by CampusNavbar
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isRepliesLoading, setIsRepliesLoading] = useState(true);
  
  // Add selected category state
  
  // Add search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Add notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(true);
  
  // Add new post modal state
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  
  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);
    
    if (!query) {
      setFilteredPosts([]);
      return;
    }
    
    const results = posts.filter(post => 
      post.message.toLowerCase().includes(query.toLowerCase()) ||
      (post.userName && post.userName.toLowerCase().includes(query.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredPosts(results);
  }, [posts]);
  
  // Fetch notifications (replies to user's posts)
  const fetchNotifications = useCallback(async () => {
    if (!user || !user.$id) return;
    
    try {
      // 1. Get user's posts
      const userPosts = await databases.listDocuments(
        databaseId,
        messagesCollectionId,
        [Query.equal('userId', user.$id)]
      );
      
      if (userPosts.documents.length === 0) return;
      
      // 2. Get all post IDs from user
      const userPostIds = userPosts.documents.map(post => post.$id);
      
      // 3. Get replies to those posts, ordered by creation date
      const allReplies: ReplyWithMessage[] = [];
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
        const postMessage = userPosts.documents.find(p => p.$id === postId)?.message || '';
        
        const typedReplies = replies.documents as unknown as ReplyDocument[];
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
    try {
      await databases.updateDocument(
        databaseId,
        repliesCollectionId,
        notificationId,
        { isRead: true }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.$id === notificationId ? {...n, isRead: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
  
  // Initial fetch of notifications
  useEffect(() => {
    if (user && user.$id) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);
  
  // Refresh notifications periodically
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (user && user.$id) {
        fetchNotifications();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(notificationInterval);
  }, [user, fetchNotifications]);

  // Fetch votes
  const fetchVotes = useCallback(async () => {
    try {
      console.log('Fetching votes...');
      const response = await databases.listDocuments(
        databaseId,
        votesCollectionId,
        [
          Query.limit(100), // Increase limit to get more votes
          Query.orderDesc('$createdAt')
        ]
      );

      const allVotes = response.documents as unknown as VoteDocument[];
      const newVotesMap: VotesMap = {};

      console.log('Processing votes:', allVotes.length);

      // Initialize votes map for all posts
      if (posts && posts.length > 0) {
        posts.forEach(post => {
          newVotesMap[post.$id] = {
            upvotes: 0,
            downvotes: 0,
            userVoted: null
          };
        });
      }

      // Process votes
      allVotes.forEach(vote => {
        if (!vote.postId || !vote.vote) return;
        
        if (!newVotesMap[vote.postId]) {
          newVotesMap[vote.postId] = {
            upvotes: 0,
            downvotes: 0,
            userVoted: null
          };
        }

        if (vote.vote === 1) {
          newVotesMap[vote.postId].upvotes++;
        } else if (vote.vote === -1) {
          newVotesMap[vote.postId].downvotes++;
        }

        // Track user's vote
        if (vote.userId === user.$id) {
          newVotesMap[vote.postId].userVoted = vote.vote;
        }
      });

      console.log('Setting votes:', newVotesMap);
      setVotes(newVotesMap);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  }, [databases, databaseId, votesCollectionId, posts, user.$id]);

  // Voting handler with optimistic updates
  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user || !postId || !user.$id) return;
    
    try {
      // Convert vote type to number
      const voteValue = voteType === 'up' ? 1 : -1;

      // Optimistically update UI
      setVotes(prevVotes => {
        const postVotes = prevVotes[postId] || { upvotes: 0, downvotes: 0, userVoted: null };
        const newPostVotes = { ...postVotes };

        // Remove previous vote if exists
        if (postVotes.userVoted === 1) newPostVotes.upvotes--;
        if (postVotes.userVoted === -1) newPostVotes.downvotes--;

        // If clicking same vote type, remove vote
        if (postVotes.userVoted === voteValue) {
          newPostVotes.userVoted = null;
        } else {
          // Add new vote
          if (voteValue === 1) newPostVotes.upvotes++;
          if (voteValue === -1) newPostVotes.downvotes++;
          newPostVotes.userVoted = voteValue;
        }

        return {
          ...prevVotes,
          [postId]: newPostVotes
        };
      });

      // Create vote data
      const voteData = {
        vote: voteValue,
        userId: user.$id,
        postId: postId
      };

      // Check for existing vote
      const existingVotes = await databases.listDocuments(
        databaseId,
        votesCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.equal('postId', postId)
        ]
      );

      if (existingVotes.documents.length > 0) {
        const existingVote = existingVotes.documents[0];
        if (existingVote.vote === voteValue) {
          // Remove vote if same type
          await databases.deleteDocument(
            databaseId,
            votesCollectionId,
            existingVote.$id
          );
        } else {
          // Update to new vote value
          await databases.updateDocument(
            databaseId,
            votesCollectionId,
            existingVote.$id,
            voteData
          );
        }
      } else {
        // Create new vote
        await databases.createDocument(
          databaseId,
          votesCollectionId,
          ID.unique(),
          voteData
        );
      }

      // Refetch votes to ensure consistency
      await fetchVotes();
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      await fetchVotes();
    }
  };

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        databaseId,
        reactionsCollectionId
      );
      const reactionsData = response.documents as unknown as {
        $id: string;
        postId: string;
        reaction: string;
        userId: string;
      }[];
      const reactionsMap: ReactionsMap = {};
      
      reactionsData.forEach((doc) => {
        const { postId, reaction, userId } = doc;
        if (!reactionsMap[postId]) {
          reactionsMap[postId] = {};
        }
        if (!reactionsMap[postId][reaction]) {
          reactionsMap[postId][reaction] = {
            count: 0,
            userReacted: false
          };
        }
        reactionsMap[postId][reaction].count++;
        if (userId === user.$id) {
          reactionsMap[postId][reaction].userReacted = true;
        }
      });
      setReactions(reactionsMap);
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  }, [databases, databaseId, reactionsCollectionId, user.$id]);

  // Fetch reply counts
  const fetchReplyCounts = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        databaseId,
        repliesCollectionId
      );
      const repliesData = response.documents as unknown as {
        $id: string;
        messageId: string;
        reply: string;
      }[];
      
      const replyCounts: ReplyCountMap = {};
      repliesData.forEach((doc) => {
        const { messageId } = doc;
        if (!replyCounts[messageId]) {
          replyCounts[messageId] = 0;
        }
        replyCounts[messageId]++;
      });
      
      setReplyCountMap(replyCounts);
    } catch (err) {
      console.error("Error fetching reply counts:", err);
    }
  }, [databases, databaseId, repliesCollectionId]);

  // Fetch posts
  const fetchAllPosts = useCallback(async () => {
    try {
      console.log("Fetching all posts...");
      
      let allDocuments: Post[] = [];
      let currentPage = 0;
      let hasMorePages = true;
      const limit = 100;
      
      while (hasMorePages) {
        console.log(`Fetching page ${currentPage + 1}...`);
        
        const response = await databases.listDocuments(
          databaseId,
          messagesCollectionId,
          [
            Query.limit(limit),
            Query.offset(currentPage * limit),
            Query.orderDesc('$createdAt')
          ]
        );
        
        const posts = response.documents as unknown as Post[];
        allDocuments = [...allDocuments, ...posts];
        
        hasMorePages = response.documents.length === limit;
        if (hasMorePages) currentPage++;
      }
      
      console.log("Total fetched posts count:", allDocuments.length);
      setPosts(allDocuments);
      return allDocuments;
    } catch (err) {
      console.error("Error fetching posts:", err);
      return [];
    }
  }, [databases, databaseId, messagesCollectionId]);
  
  // Fix fetchData to handle loading state properly
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const newPosts = await fetchAllPosts();
      if (newPosts.length > 0) {
        await Promise.all([
          fetchVotes(),
          fetchReactions(),
          fetchReplyCounts()
        ]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  }, [fetchAllPosts, fetchVotes, fetchReactions, fetchReplyCounts]);

  // Initialize data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Run only once on mount

  // Set up periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  // Handle new post creation
  const handleCreatePost = async (message: string, isAnonymous: boolean, category: Category) => {
    try {
      if (!user || !user.$id) {
        throw new Error("User not authenticated");
      }

      // Create the post document
      const newPost = await databases.createDocument(
        databaseId,
        messagesCollectionId,
        ID.unique(),
        {
          message: message.trim(),
          userId: user.$id,
          userName: user.name || user.email?.split('@')[0] || 'Anonymous',
          isAnonymous: isAnonymous,
          category: category,
          createdAt: new Date().toISOString()
        }
      );

      console.log('New post created:', newPost);
      
      // Refresh the posts list
      await fetchAllPosts();
      setIsComposeModalOpen(false);
      
      return Promise.resolve();
    } catch (err) {
      console.error("Error posting message:", err);
      return Promise.reject(err);
    }
  };
  // Handle reply submission
  const handleReply = async (replyText: string, isAnonymous: boolean) => {
    console.group('Reply Submission Process');
    console.log('Initial Check: ', {
      replyText: replyText,
      selectedMessageId: selectedMessageId,
      userId: user?.$id,
      userExists: !!user,
      isAnonymous
    });
  
    // Initial validation checks with detailed logging
    if (!replyText.trim()) {
      console.warn('Reply submission failed: Empty reply text');
      return false;
    }
  
    if (!selectedMessageId) {
      console.error('Reply submission failed: No selected message ID');
      return false;
    }
  
    if (!user?.$id) {
      console.error('Reply submission failed: No user ID - user not logged in');
      return false;
    }
  
    try {
      console.log('Preparing to create reply document', {
        databaseId,
        repliesCollectionId,
        messageId: selectedMessageId,
        userId: user.$id,
        isAnonymous
      });
  
      const newReply = await databases.createDocument(
        databaseId,
        repliesCollectionId,
        ID.unique(),
        {
          messageId: selectedMessageId,
          reply: replyText.trim(),
          isAnonymous: isAnonymous,
          userId: user.$id,
          createdAt: new Date().toISOString()
        }
      );
  
      console.log('Reply document created successfully', {
        replyId: newReply.$id,
        content: replyText.trim()
      });
  
      // Optimistically update replies for the selected message
      setSelectedMessageReplies(prev => {
        return [{
          id: newReply.$id,
          content: replyText.trim(),
          timestamp: new Date().toISOString(),
          userId: user.$id || 'anonymous',
          userName: undefined,
          isAnonymous: isAnonymous,
          votes: 0,
          userVoted: null
        }, ...prev];
      });
  
      // Update reply counts
      setReplyCountMap(prev => {
        const updatedCountMap = {
          ...prev,
          [selectedMessageId]: (prev[selectedMessageId] || 0) + 1
        };
  
        console.log('Updated reply count', {
          previousCount: prev[selectedMessageId] || 0,
          newCount: updatedCountMap[selectedMessageId]
        });
  
        return updatedCountMap;
      });
  
      console.groupEnd();
      return true;
    } catch (err) {
      console.error('Detailed Error in Reply Submission:', err);
      console.log('Error Details', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      console.groupEnd();
      return false;
    }
  };
  // Handle opening a message
  const handleOpenMessage = async (postId: string, content?: string) => {
    console.log('handleOpenMessage started:', { postId, content });
    try {
      // Find the post data if content is not provided
      let messageContent = content;
      if (!messageContent) {
        const post = posts.find(p => p.$id === postId);
        if (post) {
          messageContent = post.message;
          console.log('Found message content from posts:', messageContent);
        }
      }

      if (!messageContent) {
        console.error('No message content found for post ID:', postId);
        return;
      }

      // Set all state updates together to reduce re-renders
      const stateUpdates = {
        selectedMessageId: postId,
        selectedMessageContent: messageContent,
        isModalOpen: true,
        isRepliesLoading: true,
        selectedMessageReplies: []
      };

      // Batch state updates
      setSelectedMessageId(stateUpdates.selectedMessageId);
      setSelectedMessageContent(stateUpdates.selectedMessageContent);
      setIsModalOpen(stateUpdates.isModalOpen);
      setIsRepliesLoading(stateUpdates.isRepliesLoading);
      setSelectedMessageReplies(stateUpdates.selectedMessageReplies);
      
      console.log('Fetching replies from database...');
      const response = await databases.listDocuments(
        databaseId,
        repliesCollectionId,
        [
          Query.equal('messageId', postId),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );
      
      console.log('Processing replies...', { count: response.documents.length });
      const formattedReplies = response.documents.map(reply => ({
        id: reply.$id,
        content: reply.reply,
        timestamp: reply.$createdAt,
        userId: reply.userId || 'anonymous',
        userName: undefined,
        isAnonymous: reply.isAnonymous || true,
        votes: 0,
        userVoted: null
      }));
      
      // Update replies and loading state together
      setSelectedMessageReplies(formattedReplies);
      setIsRepliesLoading(false);
      
      console.log('handleOpenMessage completed successfully');
    } catch (error) {
      console.error("Detailed error in handleOpenMessage:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      // Reset state on error
      setIsRepliesLoading(false);
      setIsModalOpen(false);
      setSelectedMessageId('');
      setSelectedMessageContent('');
      setSelectedMessageReplies([]);
    }
  };

  // Handle reaction
  const handleReaction = async (postId: string, reaction: string) => {
    if (!postId || !reaction || !user?.$id) return;
    
    try {
      const existingReactions = await databases.listDocuments(
        databaseId,
        reactionsCollectionId,
        [
          Query.equal('postId', postId),
          Query.equal('userId', user.$id as string),
          Query.equal('reaction', reaction)
        ]
      );

      if (existingReactions.documents.length > 0) {
        // Remove reaction
        await databases.deleteDocument(
          databaseId,
          reactionsCollectionId,
          existingReactions.documents[0].$id
        );
      } else {
        // Add reaction
        await databases.createDocument(
          databaseId,
          reactionsCollectionId,
          "unique()",
          {
            postId,
            userId: user.$id,
            reaction,
          }
        );
      }
      
      // Fetch reactions again to update UI
      await fetchReactions();
    } catch (err) {
      console.error("Error handling reaction:", err);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await new Account(client).deleteSession('current');
      router.push('/signin');
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  // Convert old vote handling to new interface
  const handleUpvote = (postId: string) => {
    handleVote(postId, 'up');
  };

  const handleDownvote = (postId: string) => {
    handleVote(postId, 'down');
  };

  // Update the vote handling to use correct types
  const handleVoteForMessage = (value: number) => {
    if (selectedMessageId) {
      // Convert numeric vote to up/down
      handleVote(selectedMessageId, value >= 0 ? 'up' : 'down');
    }
  };

  // Convert votes for CampusFeed component
  const convertVotesForFeed = (votesMap: VotesMap): Record<string, { upvotes: number; downvotes: number; userVoted: 'up' | 'down' | null }> => {
    const converted: Record<string, { upvotes: number; downvotes: number; userVoted: 'up' | 'down' | null }> = {};
    
    for (const [postId, voteInfo] of Object.entries(votesMap)) {
      converted[postId] = {
        upvotes: voteInfo.upvotes || 0,
        downvotes: voteInfo.downvotes || 0,
        userVoted: voteInfo.userVoted === 1 ? 'up' : voteInfo.userVoted === -1 ? 'down' : null
      };
    }
    
    return converted;
  };

  // Create a wrapper for CampusFeed's onCreatePost
  const handleCreatePostForFeed = (message: string, category: Category, isAnonymous: boolean) => {
    return handleCreatePost(message, isAnonymous, category);
  };

  // Vote on a reply
  const handleReplyVote = async (replyId: string, voteValue: 1 | -1) => {
    if (!user?.$id) {
      alert('Please sign in to vote');
      return;
    }

    try {
      // Check if the user has already voted on this reply
      const existingVotes = await databases.listDocuments(
        databaseId,
        replyVotesCollectionId || '',
        [
          Query.equal('replyId', replyId),
          Query.equal('userId', user.$id)
        ]
      );

      let voteDoc;
      if (existingVotes.documents.length > 0) {
        // User has already voted, update the vote
        const existingVote = existingVotes.documents[0];
        
        if (existingVote.vote === voteValue) {
          // User is clicking the same vote again, remove their vote
          await databases.deleteDocument(
            databaseId,
            replyVotesCollectionId || '',
            existingVote.$id
          );
          // Set to null to indicate vote removal in UI update
          setSelectedMessageReplies(prev => {
            return prev.map(reply => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  votes: reply.userVoted === 1 ? reply.votes - 1 : reply.userVoted === -1 ? reply.votes + 1 : reply.votes,
                  userVoted: null
                };
              }
              return reply;
            });
          });
        } else {
          // Update to the new vote value
          voteDoc = await databases.updateDocument(
            databaseId,
            replyVotesCollectionId || '',
            existingVote.$id,
            { vote: voteValue }
          );

          // Update the UI optimistically for vote change
          setSelectedMessageReplies(prev => {
            return prev.map(reply => {
              if (reply.id === replyId) {
                // User changing their vote
                const voteDiff = (voteValue === 1 ? 1 : -1) - (reply.userVoted === 1 ? 1 : -1);
                return {
                  ...reply,
                  votes: reply.votes + voteDiff,
                  userVoted: voteValue
                };
              }
              return reply;
            });
          });
        }
      } else {
        // Create a new vote document
        voteDoc = await databases.createDocument(
          databaseId,
          replyVotesCollectionId || '',
          ID.unique(),
          {
            replyId,
            userId: user.$id,
            vote: voteValue,
            createdAt: new Date().toISOString()
          }
        );

        // Update the UI optimistically for new vote
        setSelectedMessageReplies(prev => {
          return prev.map(reply => {
            if (reply.id === replyId) {
              return {
                ...reply,
                votes: voteValue === 1 ? reply.votes + 1 : reply.votes - 1,
                userVoted: voteValue
              };
            }
            return reply;
          });
        });
      }
    } catch (error) {
      console.error('Error voting on reply:', error);
      alert('Failed to vote on reply. Please try again.');
    }
  };

  useEffect(() => {
    let isEffectActive = true;
    
    const loadRepliesForMessage = async (messageId: string) => {
      if (!messageId) return;
      
      try {
        console.log('Loading replies for message:', messageId);
        
        setIsRepliesLoading(true);
        
        // Fetch replies
        const repliesResponse = await databases.listDocuments(
          databaseId,
          repliesCollectionId || '',
          [
            Query.equal('messageId', messageId),
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        );
        
        // If component is no longer mounted, don't update state
        if (!isEffectActive) return;
        
        if (repliesResponse.documents.length > 0) {
          // Load votes for these replies if user is logged in
          let replyVotes: Record<string, 1 | -1 | null> = {};
          
          if (user?.$id) {
            try {
              const votesResponse = await databases.listDocuments(
                databaseId,
                replyVotesCollectionId || '',
                [
                  Query.equal('userId', user.$id),
                  Query.limit(500)
                ]
              );
              
              // Create a map of replyId -> userVote
              replyVotes = votesResponse.documents.reduce((acc, vote) => {
                acc[vote.replyId] = vote.vote as 1 | -1;
                return acc;
              }, {} as Record<string, 1 | -1>);
            } catch (error) {
              console.error('Error fetching user votes for replies:', error);
            }
          }
          
          // Get total votes for each reply
          const replyIds = repliesResponse.documents.map(doc => doc.$id);
          let voteTotals: Record<string, number> = {};
          
          try {
            // Only fetch votes if there are replies
            if (replyIds.length > 0) {
              const allVotesResponse = await databases.listDocuments(
                databaseId,
                replyVotesCollectionId || '',
                [
                  Query.equal('replyId', replyIds),
                  Query.limit(1000)
                ]
              );
              
              // Calculate total votes for each reply
              voteTotals = allVotesResponse.documents.reduce((acc, vote) => {
                if (!acc[vote.replyId]) {
                  acc[vote.replyId] = 0;
                }
                acc[vote.replyId] += vote.vote;
                return acc;
              }, {} as Record<string, number>);
            }
          } catch (error) {
            console.error('Error fetching votes for replies:', error);
          }
          
          // Map the replies
          const formattedReplies = repliesResponse.documents.map(doc => ({
            id: doc.$id,
            content: doc.reply,
            timestamp: doc.$createdAt,
            userId: doc.userId,
            userName: doc.userName || undefined,
            isAnonymous: doc.isAnonymous || true,
            votes: voteTotals[doc.$id] || 0,
            userVoted: replyVotes[doc.$id] || null
          }));
          
          setSelectedMessageReplies(formattedReplies);
        } else {
          setSelectedMessageReplies([]);
        }
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        if (isEffectActive) {
          setIsRepliesLoading(false);
        }
      }
    };
    
    if (selectedMessageId) {
      loadRepliesForMessage(selectedMessageId);
    } else {
      setSelectedMessageReplies([]);
    }
    
    return () => {
      isEffectActive = false;
    };
  }, [selectedMessageId, databases, databaseId, repliesCollectionId, user, replyVotesCollectionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 campus-pattern-bg">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="relative bg-gradient-to-r from-primary to-tertiary rounded-xl p-6 mb-8 text-white shadow-lg animate-float">
            <button
              onClick={() => setShowWelcomeBanner(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Campus Whispers</h1>
            <p className="mb-4 max-w-2xl">
              Share thoughts, ask questions, and connect with your campus community.
              Post anonymously or build your profile. Be kind, be respectful, be yourself.
            </p>
            
            <button 
              onClick={() => setIsComposeModalOpen(true)}
              className="bg-white text-primary hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md"
            >
              Create Your First Post
            </button>
          </div>
        )}
        
        {/* Search Results */}
        {isSearching && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Search Results {filteredPosts.length > 0 ? `(${filteredPosts.length})` : ''}
            </h2>
            
            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <>No posts found matching &quot;{searchQuery}&quot;</>
                  ) : (
                    <>No posts available</>
                  )}
                </p>
              </div>
            ) : (
              <CampusFeed 
                posts={filteredPosts}
                votesMap={convertVotesForFeed(votes)}
                reactionsMap={reactions}
                replyCountMap={replyCountMap}
                isLoading={false}
                onCreatePost={handleCreatePostForFeed}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onReact={handleReaction}
                onReply={handleOpenMessage}
                onShare={() => {}}
                onViewMessage={handleOpenMessage}
              />
            )}
          </div>
        )}
        
        {/* Regular Feed (when not searching) */}
        {!isSearching && (
          <CampusFeed 
            posts={posts}
            votesMap={convertVotesForFeed(votes)}
            reactionsMap={reactions}
            replyCountMap={replyCountMap}
            isLoading={isLoading}
            onCreatePost={handleCreatePostForFeed}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onReact={handleReaction}
            onReply={handleOpenMessage}
            onShare={() => {}}
            onViewMessage={handleOpenMessage}
          />
        )}
      </main>
      
      {/* New Post Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsComposeModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        >
          <PaperAirplaneIcon className="w-6 h-6 transform rotate-45" />
        </button>
      </div>
      
      {/* New Post Button (Desktop) */}
      <div className="hidden md:block">
        <CampusComposer
          onSubmit={handleCreatePost}
          isMinimized={isComposerMinimized}
          onToggleMinimize={() => setIsComposerMinimized(!isComposerMinimized)}
          placeholder="Share something with your campus..."
        />
      </div>
      
      {/* Message Details Modal */}
      <CampusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Campus Whisper"
      >
        {selectedMessageContent && (
          <MessageDetails
            message={selectedMessageContent}
            replies={selectedMessageReplies}
            onVote={handleVoteForMessage}
            onReact={(reaction) => handleReaction(selectedMessageId, reaction)}
            onReply={handleReply}
            onReplyVote={handleReplyVote}
            userVote={votes[selectedMessageId]?.userVoted ?? 0}
            voteCount={
              (votes[selectedMessageId]?.upvotes || 0) - 
              (votes[selectedMessageId]?.downvotes || 0)
            }
            isLoading={isRepliesLoading}
          />
        )}
      </CampusModal>
      
      {/* New Post Modal (for mobile) */}
      <CampusModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        title="New Campus Whisper"
      >
        <div className="p-4">
          <CampusComposer
            onSubmit={handleCreatePost}
            onCancel={() => setIsComposeModalOpen(false)}
            isModalVersion={true}
            placeholder="Share something with your campus..."
          />
        </div>
      </CampusModal>
    </div>
  );
};