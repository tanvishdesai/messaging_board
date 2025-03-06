"use client";
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import CampusMessageCard from './CampusMessageCard';
import { ReactionType } from './CampusMessageCard';

export interface Reply {
  id: string;
  content: string;
  timestamp: Date | string;
  userName?: string;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  reactions: ReactionType[];
}

export interface MessageDetails {
  id: string;
  content: string;
  timestamp: Date | string;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  reactions: ReactionType[];
  category?: string;
  isAnonymous: boolean;
  userName?: string;
  replyCount: number;
}

export interface CampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  message?: MessageDetails | null;
  replies?: Reply[];
  onUpvote?: (id: string) => void;
  onDownvote?: (id: string) => void;
  onReaction?: (id: string, reaction: string) => void;
  onSubmitReply?: (messageId: string, content: string, isAnonymous: boolean) => Promise<void>;
  onReplyUpvote?: (replyId: string) => void;
  onReplyDownvote?: (replyId: string) => void;
  onReplyReaction?: (replyId: string, reaction: string) => void;
}

const CampusModal = ({
  isOpen,
  onClose,
  title = "Message Details",
  children,
  message,
  replies = [],
  onUpvote = () => {},
  onDownvote = () => {},
  onReaction = () => {},
  onSubmitReply = async () => {},
  onReplyUpvote = () => {},
  onReplyDownvote = () => {},
  onReplyReaction = () => {}
}: CampusModalProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Sort replies based on current selection
  const sortedReplies = [...replies].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      return scoreB - scoreA;
    }
  });
  
  // Adjust textarea height as content changes
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };
  
  // Handle reply input changes
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
    adjustTextareaHeight(e.target);
  };
  
  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!message || !replyContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmitReply(message.id, replyContent.trim(), isAnonymous);
      setReplyContent('');
      
      // Reset textarea height
      if (replyInputRef.current) {
        replyInputRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      // Could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close modal when clicking outside
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Trap focus inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Focus reply input when modal opens
  useEffect(() => {
    if (isOpen && replyInputRef.current) {
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`; // Prevent layout shift
      html.style.overflow = 'hidden'; // Also prevent html scrolling
    } else {
      body.style.overflow = '';
      body.style.paddingRight = '';
      html.style.overflow = '';
    }
    
    return () => {
      body.style.overflow = '';
      body.style.paddingRight = '';
      html.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {message ? (
            <>
              {/* Original Message */}
              <div className="mb-6">
                <CampusMessageCard
                  id={message.id}
                  content={message.content}
                  timestamp={message.timestamp}
                  upvotes={message.upvotes}
                  downvotes={message.downvotes}
                  userVoted={message.userVoted}
                  replyCount={message.replyCount}
                  reactions={message.reactions}
                  category={message.category}
                  isAnonymous={message.isAnonymous}
                  userName={message.userName}
                  onUpvote={onUpvote}
                  onDownvote={onDownvote}
                  onReaction={onReaction}
                  onReply={() => replyInputRef.current?.focus()}
                  className="border border-gray-100 dark:border-gray-700"
                />
              </div>
              
              {/* Reply Section */}
              <div>
                {/* Reply Header with Sort Controls */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Replies ({replies.length})
                  </h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
                    <div className="relative inline-block text-left">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'votes')}
                        className="block w-full py-1.5 pl-3 pr-8 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="recent">Recent</option>
                        <option value="votes">Top Votes</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Reply List */}
                <div className="space-y-4 mb-4">
                  {sortedReplies.length > 0 ? (
                    sortedReplies.map((reply) => (
                      <CampusMessageCard
                        key={reply.id}
                        id={reply.id}
                        content={reply.content}
                        timestamp={reply.timestamp}
                        upvotes={reply.upvotes}
                        downvotes={reply.downvotes}
                        userVoted={reply.userVoted}
                        replyCount={0}
                        reactions={reply.reactions}
                        isAnonymous={reply.isAnonymous}
                        userName={reply.userName}
                        onUpvote={onReplyUpvote}
                        onDownvote={onReplyDownvote}
                        onReaction={onReplyReaction}
                        onReply={() => {}}
                        className="border border-gray-100 dark:border-gray-700"
                        compact={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No replies yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            children
          )}
        </div>
        
        {message && (
          // Only show the reply form if we're displaying a message
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <textarea
                  ref={replyInputRef}
                  value={replyContent}
                  onChange={handleReplyChange}
                  placeholder="Write your reply..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[60px] max-h-[150px]"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ms-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Post anonymously
                      </span>
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {replyContent.length}/500 characters
                  </span>
                </div>
              </div>
              <button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isSubmitting}
                className={`p-3 rounded-full ${
                  !replyContent.trim() || isSubmitting
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
                aria-label="Send reply"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusModal; 