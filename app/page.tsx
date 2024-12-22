"use client";
import React, { useState, useEffect, useRef } from "react";
import Typed from 'typed.js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="sticky top-0 bg-gray-900 rounded-t-lg border-b border-gray-700 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Full Message</h3>
          <button
            onClick={onClose}
            className="bg-gray-700 text-white hover:bg-red-600 transition-colors duration-200 rounded-lg w-8 h-8 flex items-center justify-center text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(80vh-4rem)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
interface MessageCardProps {
  content: string;  // Add this interface to type the content prop
}
const MessageCard = ({ content }: MessageCardProps  ) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLongMessage = content.length > 100;

  return (
    <>
      <div className="flex flex-col bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-105 duration-300">
        <div
          className="text-gray-200 text-lg line-clamp-4"
          style={{
            minHeight: "120px",
            maxHeight: "300px",
            overflowY: "hidden",
          }}
        >
          {content}
        </div>
        {isLongMessage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none"
          >
            Read More
          </button>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-gray-200 text-lg whitespace-pre-wrap">
          {content}
        </div>
      </Modal>
    </>
  );
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState<string[]>([]);
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['make films', 'travel', 'leave a legacy', 'write'],
      typeSpeed: 80,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Reverse the array to show newest posts first
          setPosts([...data].reverse());
        } else {
          console.error("Received data is not an array:", data);
        }
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const handlePost = () => {
    if (!inputValue.trim()) return;
    
    fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: inputValue }),
    })
      .then((res) => res.json())
      .then(() => {
        fetch("/api/posts")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              // Reverse the array to show newest posts first
              setPosts([...data].reverse());
            } else {
              console.error("Received data is not an array:", data);
            }
          });
        setInputValue("");
      })
      .catch((err) => console.error("Error posting content:", err));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container px-4 mx-auto">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-200 leading-tight">
              Share <span className="text-blue-500">Before I Die</span>,<br />
              I want to <span className="font-semibold text-blue-400"><span ref={el} /></span>
            </h1>
            
            {/* Input Section */}
            <div className="mt-12 w-full max-w-xl mx-auto lg:mx-0">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What do you want to do before you die?"
                className="w-full p-4 text-lg bg-gray-800/50 backdrop-blur-sm text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
                rows={3}
              />
              <button
                onClick={handlePost}
                className="w-full mt-4 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Share Your Dream
              </button>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <MessageCard key={index} content={post} />
              ))
            ) : (
              <div className="text-center text-xl text-gray-400 col-span-full">
                Be the first to share your dream
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}