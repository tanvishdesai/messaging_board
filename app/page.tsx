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
  ShareIcon,
} from "@heroicons/react/24/solid";

// Import our new components
import CampusNavbar from './components/CampusNavbar';
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

  // State
  const [posts, setPosts] = useState<{ 
    $id: string; 
    message: string; 
    createdAt: string;
    category: Category;
    isAnonymous: boolean;
    userId?: string;
    userName?: string;
  }[]>([]);
  
  const [votes, setVotes] = useState<VotesMap>({});
  const [reactions, setReactions] = useState<{
    [postId: string]: {
      [reaction: string]: {
        count: number;
        userReacted: boolean;
      };
    };
  }>({});
  const [replyCountMap, setReplyCountMap] = useState<{ [postId: string]: number }>({});
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [selectedMessageContent, setSelectedMessageContent] = useState<string>("");
  const [selectedMessageReplies, setSelectedMessageReplies] = useState<{
    id: string;
    content: string;
    timestamp: string;
    userId: string;
    userName?: string;
    isAnonymous: boolean;
    votes: number;
  }[]>([]);
  
  const [isComposerMinimized, setIsComposerMinimized] = useState(true);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  
  // Theme state - dark mode handled by CampusNavbar
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isRepliesLoading, setIsRepliesLoading] = useState(true);
  
  // Add selected category state
  
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
      posts.forEach(post => {
        newVotesMap[post.$id] = {
          upvotes: 0,
          downvotes: 0,
          userVoted: null
        };
      });

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
      const reactionsMap: {
        [postId: string]: {
          [reaction: string]: {
            count: number;
            userReacted: boolean;
          };
        };
      } = {};
      
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
      
      const replyCounts: { [postId: string]: number } = {};
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
      setIsLoading(true);
      console.log("Fetching all posts...");
      
      // Track all documents across multiple pages
      let allDocuments: Array<Record<string, unknown>> = [];
      let currentPage = 0;
      let hasMorePages = true;
      
      // Use Appwrite Query for pagination
      const limit = 100; // Increase limit to reduce number of API calls
      
      // Fetch pages until we have all documents
      while (hasMorePages) {
        console.log(`Fetching page ${currentPage + 1}...`);
        
        // Call with pagination parameters
        const response = await databases.listDocuments(
          databaseId,
          messagesCollectionId,
          [
            // Set the limit (max 100 per request)
            Query.limit(limit),
            // Skip already fetched documents
            Query.offset(currentPage * limit),
            // Sort by creation date
            Query.orderDesc('createdAt')
          ]
        );
        
        // Add documents from this page to our collection
        allDocuments = [...allDocuments, ...response.documents];
        
        // Check if we've reached the end
        if (response.documents.length < limit) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }
      
      console.log("Total fetched posts count:", allDocuments.length);
      
      const postsData = allDocuments as unknown as {
        $id: string;
        message: string;
        createdAt: string;
        category: Category;
        isAnonymous: boolean;
        userId?: string;
        userName?: string;
      }[];
      
      // Update state with all posts
      setPosts(postsData);
      setIsLoading(false);
      return postsData;
    } catch (err) {
      console.error("Error fetching posts:", err);
      setIsLoading(false);
      return [];
    }
  }, [databases, databaseId, messagesCollectionId]);
  
  // Initialize data
  useEffect(() => {
    let isSubscribed = true;

    const initializeData = async () => {
      try {
        const fetchedPosts = await fetchAllPosts();
        if (!isSubscribed) return;

        if (fetchedPosts.length > 0) {
          await Promise.all([
            fetchVotes(),
            fetchReactions(),
            fetchReplyCounts()
          ]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();

    return () => {
      isSubscribed = false;
    };
  }, [fetchAllPosts, fetchVotes, fetchReactions, fetchReplyCounts]);

  // Set up periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (!isLoading) {
        console.log('Refreshing data...');
        await fetchAllPosts();
        if (posts.length > 0) {
          await Promise.all([
            fetchVotes(),
            fetchReactions(),
            fetchReplyCounts()
          ]);
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isLoading, posts.length, fetchAllPosts, fetchVotes, fetchReactions, fetchReplyCounts]);

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
  const handleReply = async (replyText: string) => {
    console.group('Reply Submission Process');
    console.log('Initial Check: ', {
      replyText: replyText,
      selectedMessageId: selectedMessageId,
      userId: user?.$id,
      userExists: !!user
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
        userId: user.$id
      });
  
      const newReply = await databases.createDocument(
        databaseId,
        repliesCollectionId,
        ID.unique(),
        {
          messageId: selectedMessageId,
          reply: replyText.trim(),
          isAnonymous: true,
          userId: user.$id,
          createdAt: new Date().toISOString()
        }
      );
  
      console.log('Reply document created successfully', {
        replyId: newReply.$id,
        content: replyText.trim()
      });
  
      // Update UI state
      setSelectedMessageReplies(prev => {
        const updatedReplies = [{
          id: newReply.$id,
          content: replyText.trim(),
          timestamp: newReply.createdAt,
          userId: user.$id || 'anonymous',
          userName: undefined,
          isAnonymous: true,
          votes: 0
        }, ...prev];
  
        console.log('Updated replies state', {
          previousRepliesCount: prev.length,
          newRepliesCount: updatedReplies.length
        });
  
        return updatedReplies;
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
      // Set all state updates together to reduce re-renders
      const stateUpdates = {
        selectedMessageId: postId,
        selectedMessageContent: content || '',
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
        content: reply.content || reply.reply,
        timestamp: reply.createdAt,
        userId: reply.userId || 'anonymous',
        userName: undefined,
        isAnonymous: true,
        votes: 0
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 campus-pattern-bg">
      {/* Navbar */}
      <CampusNavbar 
        user={user} 
        onLogout={handleLogout}
        campusName="Campus Whispers" 
      />
      
      {/* Main Content */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        
        {/* Add loading overlay when fetching posts */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-auto">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-700 dark:text-gray-300">Loading all messages...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Message Feed */}
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
        <MessageDetails
          message={selectedMessageContent}
          replies={selectedMessageReplies}
          onVote={handleVoteForMessage}
          onReact={(reaction) => handleReaction(selectedMessageId, reaction)}
          onReply={handleReply}
          userVote={votes[selectedMessageId]?.userVoted ?? 0}
          voteCount={
            (votes[selectedMessageId]?.upvotes || 0) - 
            (votes[selectedMessageId]?.downvotes || 0)
          }
          isLoading={isRepliesLoading}
        />
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

// For IconType error in the PaperAirplaneIcon, importing it separately
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';