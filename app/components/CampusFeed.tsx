"use client";
import React, { useState, useEffect,  useMemo, useRef } from 'react';
import { ViewColumnsIcon, Squares2X2Icon, ListBulletIcon, ArrowsUpDownIcon, FireIcon, ClockIcon, ChatBubbleLeftEllipsisIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import CampusMessageCard from './CampusMessageCard';

type SortOption = 'recent' | 'upvotes' | 'trending' | 'controversial';
type ViewMode = 'grid' | 'columns' | 'list';
type Category = 'all' | 'general' | 'academics' | 'social' | 'housing' | 'food' | 'sports' | 'events';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    scrollTimer: ReturnType<typeof setTimeout>;
  }
}

export interface CampusFeedProps {
  posts: { 
    $id: string; 
    message: string; 
    createdAt: string;
    category: Category;
    isAnonymous: boolean;
    userId?: string;
    userName?: string;
  }[];
  votesMap: Record<string, {
    upvotes: number;
    downvotes: number;
    userVoted: 'up' | 'down' | null;
  }>;
  reactionsMap: {
    [postId: string]: {
      [reaction: string]: {
        count: number;
        userReacted: boolean;
      };
    };
  };
  replyCountMap: {
    [postId: string]: number;
  };
  isLoading?: boolean;
  onCreatePost: (message: string, category: Category, isAnonymous: boolean) => void;
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
  onReact: (postId: string, reactionType: string) => void;
  onReply: (postId: string) => void;
  onShare?: (postId: string) => void;
  onViewMessage: (postId: string, content: string) => void;
  currentCategory?: string;
  className?: string;
}

const CampusFeed: React.FC<CampusFeedProps> = ({
  posts,
  votesMap,
  reactionsMap,
  replyCountMap,
  isLoading = false,
  onUpvote,
  onDownvote,
  onReact,
  onReply,
  onShare,
  onViewMessage,
  currentCategory = 'all',
  className = ''
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>(currentCategory as Category);
  const [filteredPosts, setFilteredPosts] = useState(posts);

  // Add new state for advanced filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [minUpvotes, setMinUpvotes] = useState<number>(0);
  const [hasReplies, setHasReplies] = useState<'all' | 'with' | 'without'>('all');

  const feedRef = useRef<HTMLDivElement>(null);
  
  // Create memoized filtered posts to avoid excessive re-renders
  const memoizedFilteredPosts = useMemo(() => {
    console.log("CampusFeed received posts:", posts.length);
    
    let result = [...posts];
    
    // Filter by category if not 'all'
    if (category !== 'all') {
      console.log("Filtering by category:", category);
      result = result.filter(post => {
        const postCategory = post.category || 'general';
        return postCategory === category;
      });
    }

    // Apply advanced filters
    // 1. Date Range Filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      result = result.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= cutoffDate;
      });
    }

    // 2. Minimum Upvotes Filter
    if (minUpvotes > 0) {
      result = result.filter(post => {
        const postVotes = votesMap[post.$id];
        return postVotes && (postVotes.upvotes || 0) >= minUpvotes;
      });
    }

    // 3. Has Replies Filter
    if (hasReplies !== 'all') {
      result = result.filter(post => {
        const replyCount = replyCountMap[post.$id] || 0;
        return hasReplies === 'with' ? replyCount > 0 : replyCount === 0;
      });
    }
    
    // Sort posts
    if (sortOption === 'recent') {
      result = result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
    } else if (sortOption === 'upvotes') {
      result = result.sort((a, b) => {
        const aVotes = votesMap[a.$id]?.upvotes || 0;
        const bVotes = votesMap[b.$id]?.upvotes || 0;
        return bVotes - aVotes;
      });
    } else if (sortOption === 'trending') {
      // Simple algorithm: votes + (replies * 2) + (reactions * 0.5)
      result = result.sort((a, b) => {
        const aScore = (votesMap[a.$id]?.upvotes || 0) + 
                     ((replyCountMap[a.$id] || 0) * 2) + 
                     (Object.values(reactionsMap[a.$id] || {}).reduce((sum, { count }) => sum + count, 0) * 0.5);
        
        const bScore = (votesMap[b.$id]?.upvotes || 0) + 
                     ((replyCountMap[b.$id] || 0) * 2) + 
                     (Object.values(reactionsMap[b.$id] || {}).reduce((sum, { count }) => sum + count, 0) * 0.5);
        
        return bScore - aScore;
      });
    } else if (sortOption === 'controversial') {
      // Posts with many reactions but mixed upvotes/downvotes
      result = result.sort((a, b) => {
        const aReactions = Object.values(reactionsMap[a.$id] || {}).reduce((sum, { count }) => sum + count, 0);
        const bReactions = Object.values(reactionsMap[b.$id] || {}).reduce((sum, { count }) => sum + count, 0);
        
        // Simple controversy score: (reactions * replies) / (abs(upvotes) + 1)
        const aScore = (aReactions * (replyCountMap[a.$id] || 1)) / (Math.abs(votesMap[a.$id]?.upvotes || 0) + 1);
        const bScore = (bReactions * (replyCountMap[b.$id] || 1)) / (Math.abs(votesMap[b.$id]?.upvotes || 0) + 1);
        
        return bScore - aScore;
      });
    }
    
    console.log("Filtered posts count:", result.length);
    return result;
  }, [posts, votesMap, reactionsMap, replyCountMap, category, sortOption, dateRange, minUpvotes, hasReplies]);
  
  // Update filtered posts state when memoized version changes
  useEffect(() => {
    setFilteredPosts(memoizedFilteredPosts);
  }, [memoizedFilteredPosts]);

  // Add optimization to prevent too many renders during scroll
  useEffect(() => {
    const handleScroll = () => {
      // Add css class to reduce animations during scroll
      if (feedRef.current) {
        feedRef.current.classList.add('scrolling');
        
        // Remove class after scrolling stops
        clearTimeout(window.scrollTimer);
        window.scrollTimer = setTimeout(() => {
          if (feedRef.current) {
            feedRef.current.classList.remove('scrolling');
          }
        }, 100);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Category data with icons (could be from your backend in a real app)
  const categories: {id: Category; name: string; color: string}[] = [
    { id: 'all', name: 'All Topics', color: 'bg-primary text-white' },
    { id: 'general', name: 'General', color: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' },
    { id: 'academics', name: 'Academics', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' },
    { id: 'social', name: 'Social Life', color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100' },
    { id: 'housing', name: 'Housing', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' },
    { id: 'food', name: 'Food & Dining', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' },
    { id: 'sports', name: 'Sports', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' },
    { id: 'events', name: 'Events', color: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100' },
  ];
  
  // Get layout classes based on view mode
  const getLayoutClasses = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
      case 'columns':
        return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
      case 'list':
        return 'flex flex-col space-y-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };
  
  // Render individual message cards
  const renderMessageCard = (post: { 
    $id: string; 
    message: string; 
    createdAt?: string;
    category?: string;
    isAnonymous?: boolean;
    userId?: string;
    userName?: string;
  }, index: number) => {
    const isBottomRowItem = index >= filteredPosts.length - (viewMode === 'grid' ? 4 : (viewMode === 'columns' ? 3 : 1));
    
    // Get vote information for this post
    const voteInfo = votesMap[post.$id] || { upvotes: 0, downvotes: 0, userVoted: null };
    
    // Get reaction information for this post
    const postReactions = reactionsMap[post.$id] || {};
    const formattedReactions: {type: string; count: number; userReacted: boolean}[] = 
      Object.entries(postReactions).map(([type, info]) => ({
        type,
        count: info.count,
        userReacted: info.userReacted
      }));
    
    // Get reply count for this post
    const replyCount = replyCountMap[post.$id] || 0;
    
    // Determine if message is anonymous
    const isAnonymous = post.isAnonymous !== false;

    // Safely create props with empty defaults for each required field
    const messageProps = {
      id: post.$id,
      content: post.message || '',
      timestamp: post.createdAt || new Date().toISOString(),
      upvotes: voteInfo.upvotes,
      downvotes: voteInfo.downvotes,
      userVoted: voteInfo.userVoted,
      replyCount,
      reactions: formattedReactions,
      category: post.category,
      isAnonymous,
      userName: post.isAnonymous ? undefined : post.userName || "Anonymous",
      onUpvote: (id: string) => onUpvote(id),
      onDownvote: (id: string) => onDownvote(id),
      onReaction: onReact,
      onReply: (id: string) => {
        console.log('Reply clicked for post:', id, 'with content:', post.message);
        onReply(id);
        // Also call onViewMessage to ensure the modal opens with content
        onViewMessage(id, post.message || '');
      },
      onShare,
      onClick: (id: string) => onViewMessage(id, post.message || ''),
      className: isBottomRowItem ? 'bottom-row-card transform-gpu' : '',
      compact: viewMode === 'grid'
    };
    
    return (
      <CampusMessageCard key={post.$id} {...messageProps} />
    );
  };
  
  const selectedCategory = categories.find(c => c.id === category) || categories[0];
  
  return (
    <div className={`campus-feed ${className}`} ref={feedRef}>
      {/* Feed Controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Category Selection */}
        <div className="relative">
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className={`inline-flex items-center px-4 py-2 rounded-lg border ${selectedCategory.color} transition-colors`}
          >
            <span className="mr-2">{selectedCategory.name}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          
          {isCategoryMenuOpen && (
            <div className="absolute z-10 mt-2 w-56 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-up-fade">
              <div className="py-1 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`group flex items-center w-full px-4 py-2 text-sm ${
                      category === cat.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${cat.color.split(' ')[0]}`}></span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Sort options */}
          <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOption === 'recent' && <ClockIcon className="w-4 h-4 mr-2" />}
              {sortOption === 'upvotes' && <ArrowsUpDownIcon className="w-4 h-4 mr-2" />}
              {sortOption === 'trending' && <FireIcon className="w-4 h-4 mr-2" />}
              {sortOption === 'controversial' && <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />}
              
              <span>
                {sortOption === 'recent' && 'Most Recent'}
                {sortOption === 'upvotes' && 'Top Votes'}
                {sortOption === 'trending' && 'Trending'}
                {sortOption === 'controversial' && 'Controversial'}
              </span>
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>
            
            {isSortMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-up-fade">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortOption('recent');
                      setIsSortMenuOpen(false);
                    }}
                    className={`group flex items-center w-full px-4 py-2 text-sm ${
                      sortOption === 'recent'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Most Recent
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('upvotes');
                      setIsSortMenuOpen(false);
                    }}
                    className={`group flex items-center w-full px-4 py-2 text-sm ${
                      sortOption === 'upvotes'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ArrowsUpDownIcon className="w-4 h-4 mr-2" />
                    Top Votes
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('trending');
                      setIsSortMenuOpen(false);
                    }}
                    className={`group flex items-center w-full px-4 py-2 text-sm ${
                      sortOption === 'trending'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FireIcon className="w-4 h-4 mr-2" />
                    Trending
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('controversial');
                      setIsSortMenuOpen(false);
                    }}
                    className={`group flex items-center w-full px-4 py-2 text-sm ${
                      sortOption === 'controversial'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />
                    Controversial
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('columns')}
              className={`p-2 ${
                viewMode === 'columns'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Column view"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="List view"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Additional filter button */}
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`p-2 rounded-lg ${
              isFilterMenuOpen
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="More filters"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Extra filters panel - would be expanded in a real implementation */}
      {isFilterMenuOpen && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up-fade">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => {
                setDateRange('all');
                setMinUpvotes(0);
                setHasReplies('all');
              }}
              className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date Range</label>
              <select 
                className="campus-input py-1.5 w-full"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month' | 'all')}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Upvotes</label>
              <select 
                className="campus-input py-1.5 w-full"
                value={minUpvotes}
                onChange={(e) => setMinUpvotes(Number(e.target.value))}
              >
                <option value="0">Any</option>
                <option value="5">5+</option>
                <option value="10">10+</option>
                <option value="25">25+</option>
                <option value="50">50+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Has Replies</label>
              <select 
                className="campus-input py-1.5 w-full"
                value={hasReplies}
                onChange={(e) => setHasReplies(e.target.value as 'all' | 'with' | 'without')}
              >
                <option value="all">All Posts</option>
                <option value="with">With Replies</option>
                <option value="without">No Replies</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Message Feed */}
      {isLoading ? (
        <div className="flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg h-40"></div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">No posts found</div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {category !== 'all' 
              ? `There are no posts in the "${category}" category yet.` 
              : "There are no posts yet."}
          </p>
        </div>
      ) : (
        <div className={getLayoutClasses()} style={{ 
          // Improve rendering performance
          willChange: 'transform',
          contain: 'content'
        }}>
          {filteredPosts.map((post, index) => renderMessageCard(post, index))}
        </div>
      )}
      
      {/* Add CSS to optimize rendering during scroll */}
      <style jsx global>{`
        .campus-feed.scrolling .animate-pulse,
        .campus-feed.scrolling .hover-trigger {
          animation: none !important;
          transition: none !important;
        }
        
        .campus-feed .message-card {
          contain: content;
          transform: translateZ(0);
        }
        
        .bottom-row-card {
          transform: translate3d(0, 0, 0) !important;
          z-index: 1;
          contain: layout;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default CampusFeed; 