"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client, Account, Databases } from "appwrite";
import Typed from "typed.js";
import Navbar from "@/components/Navbar";

// Define an interface for the Appwrite user
interface AppwriteUser {
  name?: string;
  email: string;
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

    // Check if a user session exists
    account
      .get()
      .then((userData: AppwriteUser) => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        // If no session, redirect to the signup page
        router.push("/signup");
      });
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {/* Navbar appears when a user is logged in */}
      <Navbar username={user?.name || user?.email || "User"} />
      <ConfessionsPage />
    </>
  );
}

function ConfessionsPage() {
  // 1. Initialize Appwrite and environment variables
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  const databases = new Databases(client);

  if (
    !process.env.NEXT_PUBLIC_AW_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_AW_DATABASE_ID ||
    !process.env.NEXT_PUBLIC_AW_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_ENDPOINT
  ) {
    throw new Error("Required environment variables are not set");
  }

  const databaseId = process.env.NEXT_PUBLIC_AW_DATABASE_ID;
  const messagesCollectionId = process.env.NEXT_PUBLIC_AW_COLLECTION_ID;
  const repliesCollectionId = process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID;

  // 2. Modal Component
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }

  const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-2xl bg-white/10 border border-white/20 rounded-lg shadow-2xl backdrop-blur-md">
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

          {/* Modal Body */}
          <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    );
  };

  // 3. MessageCard Component
  interface MessageCardProps {
    docId: string;
    content: string;
    onOpen: (docId: string, content: string) => void;
  }

  const MessageCard = ({ docId, content, onOpen }: MessageCardProps) => {
    const isLongMessage = content.length > 100;

    return (
      <div className="flex flex-col bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md transition transform hover:scale-105 hover:shadow-xl">
        <div
          className="text-gray-100 text-base line-clamp-4"
          style={{ minHeight: "100px", overflowY: "hidden" }}
        >
          {content || "No content available"}
        </div>
        <button
          onClick={() => onOpen(docId, content)}
          className="mt-3 self-start text-sm font-medium text-pink-300 hover:text-pink-200 transition"
        >
          {isLongMessage ? "Read More" : "Open"}
        </button>
      </div>
    );
  };

  // 4. Main UI: Anonymous Confessions Page
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState<{ $id: string; message: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [selectedMessageContent, setSelectedMessageContent] = useState<string>("");
  const [replies, setReplies] = useState<
    { $id: string; messageId: string; reply: string }[]
  >([]);
  const [replyInput, setReplyInput] = useState("");

  // For the typed effect in the header
  const typedRef = useRef<HTMLParagraphElement>(null);

  // 4a. Typed.js effect
  useEffect(() => {
    const typed = new Typed(typedRef.current as Element, {
      strings: ["confess your love", "share your feelings", "open your heart"],
      typeSpeed: 80,
      loop: true,
    });
    return () => {
      typed.destroy();
    };
  }, []);

  // 4b. Fetch posts on load (with necessary dependencies)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await databases.listDocuments(databaseId, messagesCollectionId);
        const postsData = response.documents as unknown as { $id: string; message: string }[];
        setPosts(postsData.reverse());
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, [databaseId, messagesCollectionId, databases]);

  // 4c. Handle posting a new confession
  const handlePost = async () => {
    if (!inputValue.trim()) return;

    try {
      await databases.createDocument(databaseId, messagesCollectionId, "unique()", {
        message: inputValue,
      });

      // Refetch posts
      const response = await databases.listDocuments(databaseId, messagesCollectionId);
      const postsData = response.documents as unknown as { $id: string; message: string }[];
      setPosts(postsData.reverse());
      setInputValue("");
    } catch (err) {
      console.error("Error posting content:", err);
    }
  };

  // 4d. Open the modal for a specific message
  const handleOpenMessage = async (docId: string, content: string) => {
    setSelectedMessageId(docId);
    setSelectedMessageContent(content);
    setIsModalOpen(true);
    setReplyInput("");

    try {
      // Fetch replies for this message
      const res = await databases.listDocuments(databaseId, repliesCollectionId);
      const allReplies = (res.documents as unknown as { $id: string; messageId: string; reply: string }[])
        .filter((r) => r.messageId === docId);
      setReplies(allReplies);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  };

  // 4e. Post a reply
  const handleReply = async () => {
    if (!replyInput.trim()) return;

    try {
      await databases.createDocument(databaseId, repliesCollectionId, "unique()", {
        messageId: selectedMessageId,
        reply: replyInput,
      });

      // Refetch replies
      const res = await databases.listDocuments(databaseId, repliesCollectionId);
      const allReplies = (res.documents as unknown as { $id: string; messageId: string; reply: string }[])
        .filter((r) => r.messageId === selectedMessageId);

      setReplies(allReplies);
      setReplyInput("");
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  // 4f. Render the UI
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#1f1b2e] via-[#1a1822] to-black text-white">
      {/* Hero / Header */}
      <header className="relative w-full py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Anonymous Confessions
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Where your secrets are safe and hearts can speak freely
          </p>
          <p className="text-2xl font-bold text-pink-500" ref={typedRef}></p>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* New Confession Section */}
        <section
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 mx-auto mb-12 shadow-xl"
          style={{ maxWidth: "600px" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-pink-300">
            Share a New Confession
          </h2>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Confess your feelings anonymously..."
            className="w-full p-3 mb-4 bg-transparent border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            rows={4}
          />
          <button
            onClick={handlePost}
            className="w-full py-3 font-semibold rounded-md bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition"
          >
            Send Confession
          </button>
        </section>

        {/* Existing Confessions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-200 mb-6">
            Recent Confessions
          </h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <MessageCard
                  key={post.$id}
                  docId={post.$id}
                  content={post.message}
                  onOpen={handleOpenMessage}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-8">
              Be the first to confess anonymously...
            </div>
          )}
        </section>
      </div>

      {/* Modal for selected confession + replies */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-gray-100 text-base whitespace-pre-wrap mb-6">
          {selectedMessageContent}
        </div>

        {/* Replies list */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-pink-300">Replies</h4>
          {replies.length > 0 ? (
            replies.map((r) => (
              <div
                key={r.$id}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-md mb-2 text-gray-100"
              >
                {r.reply}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No replies yet. Be the first!</p>
          )}
        </div>

        {/* Reply input */}
        <textarea
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-3 bg-transparent border border-white/30 rounded-md mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          rows={2}
        />
        <button
          onClick={handleReply}
          className="w-full py-2 font-semibold rounded-md bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition"
        >
          Send Reply
        </button>
      </Modal>
    </main>
  );
}
