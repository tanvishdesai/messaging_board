"use client";
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid, HandThumbDownIcon as HandThumbDownIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

export interface ReactionType {
  type: string;
  count: number; 
  userReacted: boolean;
}

export interface MessageCardProps {
  id: string;
  content: string;
  timestamp: Date | string;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  replyCount: number;
  reactions: ReactionType[];
  category?: string;
  isAnonymous?: boolean;
  userName?: string;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onReaction: (id: string, reaction: string) => void;
  onReply: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

// Format the date to a friendly string - memoize to avoid recalculation
const formatDate = (date: Date | string) => {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } else {
    return messageDate.toLocaleDateString();
  }
};

// Cache color lookups for efficiency
const categoryColors: Record<string, string> = {
  general: 'bg-gray-600',
  academics: 'bg-blue-600',
  social: 'bg-purple-600',
  housing: 'bg-green-600',
  food: 'bg-orange-600',
  sports: 'bg-red-600',
  events: 'bg-indigo-600',
};

const getCategoryColor = (category?: string) => {
  const normalizedCategory = (category || 'general').toLowerCase();
  return categoryColors[normalizedCategory] || 'bg-blue-600';
};

// Cache emoji mappings to avoid recreating them repeatedly
const emojiMap: Record<string, string> = {
  'laugh': '😂',
  'heart': '❤️',
  'wow': '😮',
  'think': '🤔',
  'sad': '😢',
  'angry': '😡'
};



const CampusMessageCard: React.FC<MessageCardProps> = memo(({
  id,
  content,
  timestamp,
  upvotes,
  downvotes,
  userVoted,
  replyCount,
  reactions,
  category,
  isAnonymous = true,
  userName,
  onUpvote,
  onDownvote,
  onReaction,
  onReply,
  onShare,
  onSave,
  onClick,
  className = '',
  compact = false
}) => {
  const [saved, setSaved] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isHandlingEvent, setIsHandlingEvent] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside of reaction picker to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleAction = useCallback((action: () => void) => {
    if (isHandlingEvent) return;
    setIsHandlingEvent(true);
    
    try {
      action();
    } finally {
      setTimeout(() => {
        setIsHandlingEvent(false);
      }, 300);
    }
  }, [isHandlingEvent]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleAction(() => {
      setSaved(!saved);
      onSave?.(id);
    });
  }, [saved, id, onSave, handleAction]);

  const handleCardClick = useCallback(() => {
    handleAction(() => {
      onClick?.(id);
    });
  }, [id, onClick, handleAction]);
  
  const handleUpvote = useCallback((e: React.MouseEvent) => { 
    e.stopPropagation();
    handleAction(() => {
      onUpvote(id);
    });
  }, [id, onUpvote, handleAction]);
  
  const handleDownvote = useCallback((e: React.MouseEvent) => { 
    e.stopPropagation();
    handleAction(() => {
      onDownvote(id);
    });
  }, [id, onDownvote, handleAction]);
  
  const handleReply = useCallback((e: React.MouseEvent) => { 
    e.stopPropagation();
    handleAction(() => {
      onReply(id);
    });
  }, [id, onReply, handleAction]);
  
  const toggleReactionPicker = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleAction(() => {
      setShowReactionPicker(!showReactionPicker);
    });
  }, [showReactionPicker, handleAction]);

  const handleReaction = useCallback((e: React.MouseEvent, reactionType: string) => {
    e.stopPropagation();
    handleAction(() => {
      setShowReactionPicker(false);
      onReaction(id, reactionType);
    });
  }, [id, onReaction, handleAction]);
  
  // Parse the content for any possible embedded media links
  
  // Get the vote score
  const voteScore = upvotes - downvotes;
  const scoreColor = 
    voteScore > 5 ? 'text-emerald-500' : 
    voteScore < 0 ? 'text-red-500' : 
    'text-gray-600 dark:text-gray-400';
  
  return (
    <div 
      ref={cardRef}
      className={`message-card relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${compact ? 'p-3' : 'p-4'} ${className}`}
      onClick={handleCardClick}
      style={{
        overscrollBehavior: 'contain',
        willChange: compact ? 'auto' : 'transform, opacity',
        transform: 'translateZ(0)',
        contain: 'content'
      }}
    >
      {/* Category Badge */}
      {category && (
        <div className={`inline-flex items-center ${compact ? 'text-[10px] py-0.5 px-2 mb-2' : 'absolute top-3 right-3 text-xs py-1 px-3'} ${getCategoryColor(category)} text-white rounded-full font-medium shadow-sm`}>
          <span className="max-w-[100px] truncate">{category}</span>
        </div>
      )}
      
      {/* User Info or Anonymous */}
      <div className="flex items-center justify-between mb-3">
        {isAnonymous ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">Anonymous</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName?.[0] || 'U'}
            </div>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{userName}</span>
          </div>
        )}
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{formatDate(timestamp)}</span>
      </div>
      
      {/* Message Content */}
      <div className="mb-4">
        <p className={`text-gray-700 dark:text-gray-300 ${compact ? 'text-sm line-clamp-3' : 'whitespace-pre-line'}`}>
          {content}
        </p>
      </div>

      {/* Reactions Row */}
      <div className="flex flex-wrap gap-1 mb-3">
        {reactions.map(reaction => (
          <button
            key={reaction.type}
            onClick={(e) => { 
              e.stopPropagation();
              onReaction(id, reaction.type);
            }}
            className={`flex items-center gap-1 text-xs ${reaction.userReacted ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'} rounded-full px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors`}
          >
            <span>{emojiMap[reaction.type] || reaction.type}</span>
            <span>{reaction.count}</span>
          </button>
        ))}
        
        <button 
          onClick={toggleReactionPicker}
          className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400"
        >
          +
        </button>
        
        {/* Reaction picker popup */}
        {showReactionPicker && (
          <div 
            ref={reactionPickerRef}
            className="absolute z-10 bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2"
          >
            {Object.entries(emojiMap).map(([type, emoji]) => (
              <button
                key={type}
                onClick={(e) => handleReaction(e, type)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions Row - Apply will-change for button hover states */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Vote Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handleUpvote}
            className={`p-1.5 rounded-full ${userVoted === 'up' ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            aria-label="Upvote"
            style={{ willChange: 'transform, background' }}
          >
            {userVoted === 'up' ? <HandThumbUpIconSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
          </button>
          <span className={`font-medium ${scoreColor}`}>{voteScore}</span>
          <button 
            onClick={handleDownvote}
            className={`p-1.5 rounded-full ${userVoted === 'down' ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            aria-label="Downvote"
            style={{ willChange: 'transform, background' }}
          >
            {userVoted === 'down' ? <HandThumbDownIconSolid className="w-5 h-5" /> : <HandThumbDownIcon className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Comment Count */}
        <button 
          onClick={handleReply}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="View comments"
          style={{ willChange: 'transform, background' }}
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="text-sm">{replyCount}</span>
        </button>
        
        {/* Share & Save Buttons */}
        <div className="flex items-center">
          {!compact && onShare && (
            <button 
              onClick={(e) => { e.stopPropagation(); onShare(id); }}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Share message"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          )}
          
          {!compact && onSave && (
            <button 
              onClick={handleSave}
              className={`p-1.5 ${saved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'} rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              aria-label="Save message"
            >
              {saved ? <BookmarkIconSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
            </button>
          )}
          
          {!compact && (
            <button 
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="More options"
            >
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Add display name for memo component
CampusMessageCard.displayName = 'CampusMessageCard';

export default CampusMessageCard; 