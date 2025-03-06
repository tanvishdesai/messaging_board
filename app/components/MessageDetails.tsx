"use client";
import React, { useState, useEffect } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, FaceSmileIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface MessageDetailsProps {
  message: string;
  replies: {
    id: string;
    content: string;
    timestamp: string;
    userName?: string;
    userId?: string;
    isAnonymous: boolean;
    votes: number;
  }[];
  onVote: (value: number) => void;
  onReact: (reaction: string) => void;
  onReply: (text: string) => Promise<boolean>;
  userVote: number | null;
  voteCount: number;
  isLoading?: boolean;
}

const MessageDetails: React.FC<MessageDetailsProps> = ({
  message,
  replies,
  onVote,
  onReact,
  onReply,
  userVote,
  voteCount,
  isLoading
}) => {
  const [replyText, setReplyText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [sortedReplies, setSortedReplies] = useState([...replies]);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'votes'>('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize common reactions
  const commonReactions = React.useMemo(() => ['👍', '❤️', '😂', '😮', '😢', '👏', '��', '🔥'], []);
  
  // Update sorted replies when replies change
  useEffect(() => {
    if (!isLoading) {
      try {
        const sorted = [...replies];
        if (sortOption === 'newest') {
          sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else if (sortOption === 'oldest') {
          sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } else if (sortOption === 'votes') {
          sorted.sort((a, b) => b.votes - a.votes);
        }
        setSortedReplies(sorted);
      } catch (err) {
        console.error('Error sorting replies:', err);
        setError('Error sorting replies. Please try refreshing the page.');
      }
    }
  }, [replies, sortOption, isLoading]);
  
  // Reset error when message changes
  useEffect(() => {
    setError(null);
  }, [message]);
  
  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    try {
      setError(null);
      setIsSubmitting(true);
      console.log('Submitting reply:', { replyText: replyText.trim() });
      const success = await onReply(replyText);
      console.log('Reply submission result:', { success });
      
      if (success) {
        setReplyText('');
        setIsAnonymous(true);
      } else {
        setError('Failed to submit reply. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('An error occurred while submitting your reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = (isAnonymous: boolean, userId?: string) => {
    if (isAnonymous) return 'A';
    return userId ? userId.substring(0, 1).toUpperCase() : 'U';
  };

  // Get a consistent color for a user based on their ID
  const getUserColor = (userId?: string) => {
    if (!userId) return 'from-gray-500 to-gray-700';
    
    // Simple hash function to generate consistent colors
    const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorPairs = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-orange-600',
      'from-yellow-500 to-amber-600',
      'from-indigo-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-cyan-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
    ];
    
    return colorPairs[hash % colorPairs.length];
  };
  
  return (
    <div className="flex flex-col h-full relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">Loading replies...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Original message */}
      <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-6">{message}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onVote(1)}
              className={`p-1.5 rounded-full ${userVote === 1 ? 'text-primary bg-primary/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {userVote === 1 ? <HandThumbUpSolidIcon className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
            </button>
            <span className="text-gray-600 dark:text-gray-300 font-medium">{voteCount}</span>
            <button 
              onClick={() => onVote(-1)}
              className={`p-1.5 rounded-full ${userVote === -1 ? 'text-red-500 bg-red-500/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {userVote === -1 ? <HandThumbDownSolidIcon className="w-5 h-5" /> : <HandThumbDownIcon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
            
            {showReactions && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="flex space-x-1">
                  {commonReactions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowReactions(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          Replies ({replies.length})
        </h3>
        
        {/* Sort options for replies */}
        {replies.length > 1 && (
          <div className="relative inline-block text-left">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest' | 'votes')}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="votes">Most votes</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedReplies.length > 0 ? (
          sortedReplies.map(reply => (
            <div 
              key={reply.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getUserColor(reply.userId)} rounded-full flex items-center justify-center text-white font-bold`}>
                    {getUserInitials(reply.isAnonymous, reply.userId)}
                  </div>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                    {reply.isAnonymous ? 'Anonymous' : reply.userName || 'User'}
                  </span>
                </div>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(reply.timestamp)}
                </span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="text-xs">{reply.votes} votes</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No replies yet. Be the first to reply!
          </div>
        )}
      </div>
      
      {/* Reply input */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4">
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[60px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  className="sr-only peer"
                  disabled={isSubmitting}
                />
                <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Post anonymously
                </span>
              </label>
              <span className="text-xs text-gray-500">
                {replyText.length}/500 characters
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmitReply}
            disabled={!replyText.trim() || isSubmitting}
            className={`p-3 rounded-full ${
              !replyText.trim() || isSubmitting
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDetails; 