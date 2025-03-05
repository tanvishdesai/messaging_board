"use client";
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PaperAirplaneIcon, LockClosedIcon, FaceSmileIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

type Category = 'general' | 'academics' | 'social' | 'housing' | 'food' | 'sports' | 'events';

interface ComposerProps {
  onSubmit: (message: string, isAnonymous: boolean, category: Category) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isModalVersion?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
}

const CampusComposer: React.FC<ComposerProps> = ({
  onSubmit,
  onCancel,
  placeholder = "What's on your mind?",
  isModalVersion = false,
  isMinimized = false,
  onToggleMinimize,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<Category>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Categories with colors to choose from
  const categories: {id: Category; name: string; color: string}[] = [
    { id: 'general', name: 'General', color: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' },
    { id: 'academics', name: 'Academics', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' },
    { id: 'social', name: 'Social Life', color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100' },
    { id: 'housing', name: 'Housing', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' },
    { id: 'food', name: 'Food & Dining', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' },
    { id: 'sports', name: 'Sports', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' },
    { id: 'events', name: 'Events', color: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100' },
  ];
  
  // Common emoji sets for campus life
  const emojiSets = [
    ['😀', '😂', '😊', '🤔', '😍', '🙄', '😴', '😭', '🤯', '😱'],
    ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤟', '🤘', '👊', '✊'],
    ['💯', '🔥', '⭐', '💫', '💥', '✨', '🎉', '🎊', '🎓', '📚'],
    ['❤️', '💔', '💕', '💘', '💖', '💙', '💜', '🖤', '💪', '🧠']
  ];
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharCount(message.length);
  }, [message]);
  
  // Focus textarea when component mounts (for modal version)
  useEffect(() => {
    if (isModalVersion && textareaRef.current && !isMinimized) {
      textareaRef.current.focus();
    }
  }, [isModalVersion, isMinimized]);
  
  // Handle message submission
  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim(), isAnonymous, category);
      setMessage('');
      setIsSubmitting(false);
      
      // Auto-minimize on submit if in floating mode
      if (!isModalVersion && onToggleMinimize) {
        onToggleMinimize();
      }
    } catch (error) {
      console.error('Error submitting message:', error);
      setIsSubmitting(false);
      // Could add error toast notification here
    }
  };
  
  // Add emoji to message
  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Get the selected category
  const selectedCategory = categories.find(c => c.id === category) || categories[0];
  
  // If minimized, show just the minimized version
  if (isMinimized && !isModalVersion) {
    return (
      <div 
        className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-full shadow-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-40 animate-pulse-glow ${className}`}
        onClick={onToggleMinimize}
      >
        <PaperAirplaneIcon className="w-6 h-6 text-primary transform rotate-45" />
      </div>
    );
  }
  
  const composerContent = (
    <>
      {/* Header - only for modal version */}
      {isModalVersion && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Campus Whisper</h3>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Content area */}
      <div className="p-4 sm:p-6">
        {/* Anonymous toggle */}
        <div className="mb-4 flex items-center">
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isAnonymous 
                ? 'bg-secondary/10 text-secondary border border-secondary/30' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
            }`}
          >
            <LockClosedIcon className="w-4 h-4" />
            {isAnonymous ? 'Anonymous' : 'Public'}
          </button>
          
          {/* Category selector */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowCategorySelector(!showCategorySelector)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedCategory.color} border`}
            >
              <HashtagIcon className="w-4 h-4" />
              {selectedCategory.name}
            </button>
            
            {showCategorySelector && (
              <div className="absolute top-full left-0 mt-2 z-10 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up-fade">
                <div className="py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setShowCategorySelector(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${
                        category === cat.id
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${cat.color.split(' ')[0]}`}></span>
                      <span className={cat.color.split(' ').slice(2).join(' ')}>
                        {cat.name}
                      </span>
                      {category === cat.id && (
                        <CheckCircleIcon className="w-4 h-4 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Textarea */}
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="campus-textarea w-full min-h-[120px] text-base"
            maxLength={1000}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Be respectful of others</span>
            <span className={charCount > 800 ? (charCount > 900 ? 'text-red-500' : 'text-yellow-500') : ''}>
              {charCount}/1000
            </span>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {/* Emoji picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="Add emoji"
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10 animate-slide-up-fade">
                  <div className="w-64 max-h-48 overflow-y-auto">
                    {emojiSets.map((set, index) => (
                      <div key={index} className="flex flex-wrap mb-2">
                        {set.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <span className="text-lg">{emoji}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload image - would be implemented with actual upload */}
            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Upload image"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>
            
            {/* AI suggestions - would be implemented with actual AI functionality */}
            <button
              className="p-2 rounded-full text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light hover:bg-primary/5 transition"
              title="Get AI writing suggestions"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {onCancel && !isModalVersion && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            )}
            
            {!isModalVersion && onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Minimize
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className={`campus-button-primary ${!isModalVersion ? 'py-2' : ''} ${
                !message.trim() || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                <span className="flex items-center">
                  <PaperAirplaneIcon className="w-5 h-5 mr-1 transform rotate-45" />
                  Post
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
  
  // Render differently based on modal vs floating
  if (isModalVersion) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden ${className}`}>
        {composerContent}
      </div>
    );
  }
  
  // Floating composer
  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 animate-slide-up-fade ${className}`}>
      {composerContent}
    </div>
  );
};

export default CampusComposer; 