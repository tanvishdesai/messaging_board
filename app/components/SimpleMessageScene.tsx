"use client";
import React, { useEffect, useState, useRef, memo } from "react";

type VoteInfo = {
  total: number;
  userVote: number | null;
  docId?: string;
};

type ReactionEntry = {
  count: number;
  selected: boolean;
  docId?: string;
};

type SceneSettings = {
  layout: 'grid' | 'spiral' | 'floating';
  cardSize: number;
  spacing: number;
  rotationSpeed: number;
  bloomIntensity: number;
  backgroundColor: string;
  cameraDistance: number;
};

// ----------------------
// SceneControls Component
// ----------------------
export const SceneControls = memo(({
  sceneSettings,
  setSceneSettings,
}: {
  sceneSettings: SceneSettings;
  setSceneSettings: (settings: SceneSettings) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleLayoutChange = (layout: 'grid' | 'spiral' | 'floating') => {
    setSceneSettings({
      ...sceneSettings,
      layout
    });
  };
  
  const handleSliderChange = (
    property: keyof SceneSettings, 
    value: number
  ) => {
    setSceneSettings({
      ...sceneSettings,
      [property]: value
    });
  };
  
  return (
    <div className="fixed top-24 right-6 z-50">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center w-12 h-12"
        aria-label="3D settings"
      >
        {isExpanded ? "✖" : "🔮"}
      </button>
      
      {isExpanded && (
        <div className="absolute top-16 right-0 bg-black/80 backdrop-blur-md border border-indigo-500/30 p-5 rounded-lg w-80 animate-fadeIn shadow-xl overflow-y-auto max-h-[80vh]">
          <h4 className="text-white font-semibold mb-4 border-b border-indigo-500/30 pb-2 text-lg flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              3D Confessions Visualizer
            </span>
          </h4>
          
          <div className="space-y-6">
            {/* Layout Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-3">
                Layout Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleLayoutChange('grid')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                    sceneSettings.layout === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => handleLayoutChange('spiral')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                    sceneSettings.layout === 'spiral'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Spiral
                </button>
                <button
                  onClick={() => handleLayoutChange('floating')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                    sceneSettings.layout === 'floating'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Floating
                </button>
              </div>
            </div>
            
            {/* Rotation Speed */}
            <div>
              <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                <span>Rotation Speed</span>
                <span className="text-indigo-400">{sceneSettings.rotationSpeed.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="0.2" 
                step="0.01"
                value={sceneSettings.rotationSpeed} 
                onChange={(e) => handleSliderChange('rotationSpeed', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Static</span>
                <span>Fast</span>
              </div>
            </div>
            
            {/* Card Size */}
            <div>
              <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                <span>Card Size</span>
                <span className="text-indigo-400">{sceneSettings.cardSize}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="0.1"
                value={sceneSettings.cardSize} 
                onChange={(e) => handleSliderChange('cardSize', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>
            
            {/* Spacing */}
            <div>
              <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                <span>Spacing</span>
                <span className="text-indigo-400">{sceneSettings.spacing.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1"
                value={sceneSettings.spacing} 
                onChange={(e) => handleSliderChange('spacing', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Dense</span>
                <span>Sparse</span>
              </div>
            </div>
            
            {/* Bloom Intensity */}
            <div>
              <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                <span>Glow Effect</span>
                <span className="text-indigo-400">{sceneSettings.bloomIntensity.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={sceneSettings.bloomIntensity} 
                onChange={(e) => handleSliderChange('bloomIntensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>None</span>
                <span>Intense</span>
              </div>
            </div>
            
            {/* Camera Distance */}
            <div>
              <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                <span>Camera Distance</span>
                <span className="text-indigo-400">{sceneSettings.cameraDistance.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="1"
                value={sceneSettings.cameraDistance} 
                onChange={(e) => handleSliderChange('cameraDistance', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Close</span>
                <span>Far</span>
              </div>
            </div>
            
            {/* Reset Button */}
            <div className="pt-2 border-t border-indigo-500/30 flex space-x-2">
              <button
                onClick={() => setSceneSettings({
                  layout: 'grid',
                  cardSize: 3,
                  spacing: 1,
                  rotationSpeed: 0.01,
                  bloomIntensity: 0.7,
                  backgroundColor: '#000000',
                  cameraDistance: 15,
                })}
                className="flex-1 text-sm py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition"
              >
                Reset Defaults
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="py-2 px-4 bg-indigo-600 rounded hover:bg-indigo-700 text-white transition text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="text-xs text-gray-400 italic">
              Tip: You can drag to rotate, scroll to zoom, and click on a card to view details.
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
SceneControls.displayName = "SceneControls";

// ----------------------
// Simplified P5MessageScene Component
// ----------------------
export const P5MessageScene = memo(({
  posts,
  votes,
  reactions,
  onOpenMessage,
  sceneSettings,
}: {
  posts: { $id: string; message: string }[];
  votes: { [postId: string]: VoteInfo };
  reactions: { [postId: string]: { [reaction: string]: ReactionEntry } };
  onOpenMessage: (docId: string, content: string) => void;
  onVote: (docId: string, voteValue: number) => void;
  onReact: (docId: string, reaction: string) => void;
  sceneSettings: SceneSettings;
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Generate a hash code from a string (for consistent colors)
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Update rotation based on rotation speed
  useEffect(() => {
    if (sceneSettings.rotationSpeed > 0) {
      const interval = setInterval(() => {
        setRotationAngle(prev => (prev + sceneSettings.rotationSpeed) % 360);
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [sceneSettings.rotationSpeed]);
  
  // Calculate card styles based on layout
  const getCardStyle = (postId: string, index: number) => {
    const { layout, cardSize, spacing, bloomIntensity } = sceneSettings;
    
    // Generate unique color based on post ID
    const hue = Math.abs(hashCode(postId) % 360);
    const cardColor = `hsl(${hue}, 70%, 50%)`;
    
    // Base styles
    const baseStyle: React.CSSProperties = {
      backgroundColor: `${cardColor}cc`,
      borderColor: cardColor,
      boxShadow: hoveredCardId === postId 
        ? `0 0 ${15 * bloomIntensity}px ${5 * bloomIntensity}px ${cardColor}80` 
        : `0 0 ${5 * bloomIntensity}px 0 ${cardColor}40`,
      width: `${cardSize * 80}px`,
      height: `${cardSize * 120}px`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    };
    
    // Layout-specific styles
    if (layout === 'grid') {
      // No additional transform needed for grid layout
      return baseStyle;
    } 
    else if (layout === 'spiral') {
      const angle = index * 0.5 + rotationAngle;
      const radius = 100 + index * 15 * spacing;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        ...baseStyle,
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle * 30}deg)`,
        zIndex: 1000 - index,
      };
    } 
    else if (layout === 'floating') {
      // For floating layout, use a semi-random position that changes with rotation
      const seed = hashCode(postId);
      const offsetX = Math.sin(seed + rotationAngle * 0.1) * 30 * spacing;
      const offsetY = Math.cos(seed + rotationAngle * 0.2) * 20 * spacing;
      const rotate = Math.sin(seed + rotationAngle * 0.05) * 15;
      
      return {
        ...baseStyle,
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${offsetX}vw), calc(-50% + ${offsetY}vh)) rotate(${rotate}deg)`,
        zIndex: Math.floor(Math.sin(seed + rotationAngle * 0.1) * 100 + 1000),
      };
    }
    
    return baseStyle;
  };
  
  // Get container style based on layout
  const getContainerStyle = (): React.CSSProperties => {
    const { layout, backgroundColor } = sceneSettings;
    
    const baseStyle: React.CSSProperties = {
      backgroundColor: backgroundColor || '#000000',
      position: 'relative' as const,
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    };
    
    if (layout === 'grid') {
      return {
        ...baseStyle,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${sceneSettings.cardSize * 80}px, 1fr))`,
        gap: `${sceneSettings.spacing * 20}px`,
        padding: '100px',
        overflowY: 'auto',
      };
    }
    
    return baseStyle;
  };
  
  return (
    <div 
      className="message-scene-container"
      style={getContainerStyle()}
    >
      {posts.map((post, index) => (
        <div
          key={post.$id}
          className={`message-card rounded-lg p-4 flex flex-col ${
            hoveredCardId === post.$id ? 'ring-2 ring-white' : ''
          }`}
          style={getCardStyle(post.$id, index)}
          onClick={() => onOpenMessage(post.$id, post.message)}
          onMouseEnter={() => setHoveredCardId(post.$id)}
          onMouseLeave={() => setHoveredCardId(null)}
        >
          <div className="flex-1 overflow-hidden text-white text-center">
            {post.message.length > 100 
              ? post.message.substring(0, 97) + '...' 
              : post.message}
          </div>
          
          <div className="mt-auto pt-2 text-center">
            <div className="text-yellow-300 font-bold">
              {votes[post.$id]?.total || 0} votes
            </div>
            
            {/* Optional: Add reaction display here */}
            {reactions[post.$id] && Object.keys(reactions[post.$id]).length > 0 && (
              <div className="flex justify-center mt-1 space-x-1">
                {Object.entries(reactions[post.$id]).slice(0, 3).map(([emoji, data]) => (
                  <span key={emoji} className="text-xs bg-black/30 px-1 rounded">
                    {emoji} {data.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
P5MessageScene.displayName = "P5MessageScene"; 