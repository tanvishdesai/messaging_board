"use client";
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  EllipsisHorizontalIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpIconSolid, 
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid';

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
  'angry': '😡',
  'thumbsup': '👍'
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
    e.preventDefault();
    e.stopPropagation();
    console.log('Reply button clicked for post:', id, 'with content:', content);
    
    // Make sure we're not already handling an event
    if (isHandlingEvent) {
      console.log('Already handling an event, ignoring click');
      return;
    }
    
    setIsHandlingEvent(true);
    try {
      // Call the onReply callback with the post ID
      onReply(id);
    } catch (error) {
      console.error('Error handling reply click:', error);
    } finally {
      // Reset the handling state after a delay
      setTimeout(() => {
        setIsHandlingEvent(false);
      }, 300);
    }
  }, [id, onReply, isHandlingEvent, content]);
  
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
  
  return (
    <div 
      ref={cardRef}
      className={`message-card relative bg-[#1e2030] dark:bg-[#1a1b26] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${compact ? 'p-3' : 'p-4'} ${className} border border-gray-700 dark:border-gray-800`}
      onClick={handleCardClick}
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="ml-2 font-medium text-gray-200">Anonymous</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {userName?.[0] || 'U'}
            </div>
            <span className="ml-2 font-medium text-gray-200">{userName}</span>
          </div>
        )}
        <span className="ml-auto text-xs text-gray-400">{formatDate(timestamp)}</span>
      </div>
      
      {/* Message Content */}
      <div className="mb-3">
        <p className={`text-gray-200 ${compact ? 'text-sm line-clamp-3' : 'whitespace-pre-line'}`}>
          {content}
        </p>
      </div>

      {/* Active Reactions Display */}
      {reactions.length > 0 && (
        <div className="reaction-container">
          {reactions.map(reaction => (
            <button
              key={reaction.type}
              onClick={(e) => { 
                e.stopPropagation();
                onReaction(id, reaction.type);
              }}
              className="reaction-emoji"
              title={`${reaction.count} ${reaction.type}`}
            >
              {emojiMap[reaction.type] || reaction.type}
            </button>
          ))}
        </div>
      )}
      
      {/* Divider */}
      <div className="border-t border-gray-700 dark:border-gray-800 my-2"></div>
      
      {/* Actions Row */}
      <div className="flex items-center justify-between mt-2">
        {/* Vote buttons in a group */}
        <div className="flex items-center space-x-3">
          {/* Upvote button */}
          <button 
            onClick={handleUpvote}
            className={`flex items-center ${
              userVoted === 'up' 
                ? 'text-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            aria-label="Upvote"
          >
            {userVoted === 'up' 
              ? <HandThumbUpIconSolid className="w-6 h-6" /> 
              : <HandThumbUpIcon className="w-6 h-6" />
            }
            {upvotes > 0 && (
              <span className="ml-1.5 text-sm font-medium">{upvotes}</span>
            )}
          </button>
          
          {/* Downvote button */}
          <button 
            onClick={handleDownvote}
            className={`flex items-center ${
              userVoted === 'down' 
                ? 'text-red-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            aria-label="Downvote"
          >
            {userVoted === 'down' 
              ? <HandThumbDownIconSolid className="w-6 h-6" /> 
              : <HandThumbDownIcon className="w-6 h-6" />
            }
            {downvotes > 0 && (
              <span className="ml-1.5 text-sm font-medium">{downvotes}</span>
            )}
          </button>
          
          {/* Reply button */}
          <button 
            onClick={handleReply}
            className="flex items-center text-gray-400 hover:text-blue-500 focus:outline-none focus:text-blue-500 active:text-blue-600 transition-colors duration-200"
            aria-label="Reply"
            type="button"
            data-testid="reply-button"
          >
            <ChatBubbleLeftIcon className="w-6 h-6" />
            {replyCount > 0 && (
              <span className="ml-1.5 text-sm font-medium">{replyCount}</span>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Smiley face reaction button */}
          <button 
            onClick={toggleReactionPicker}
            className="flex items-center text-gray-400 hover:text-gray-300"
            aria-label="Add reaction"
          >
            <FaceSmileIcon className="w-6 h-6" />
          </button>
          
          {/* More options button */}
          <button 
            className="flex items-center text-gray-400 hover:text-gray-300"
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Reaction picker popup */}
      {showReactionPicker && (
        <div 
          ref={reactionPickerRef}
          className="emoji-reaction-popup"
        >
          {Object.entries(emojiMap).map(([type, emoji]) => (
            <button
              key={type}
              onClick={(e) => handleReaction(e, type)}
              className="emoji-reaction-button"
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Add display name for memo component
CampusMessageCard.displayName = 'CampusMessageCard';

export default CampusMessageCard; 