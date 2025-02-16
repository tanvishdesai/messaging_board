"use client";

import React, { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Client, Account, Databases } from "appwrite";
import Typed from "typed.js";

interface AppwriteUser {
  $id?: string;
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
    return <div>Loading...</div>;
  }

  return <ConfessionsPage user={user!} />;
}

interface ConfessionsPageProps {
  user: AppwriteUser;
}

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

// Memoized Modal Component
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-white/10 border border-white/20 rounded-lg shadow-2xl backdrop-blur-md flex flex-col max-h-[90vh]"
        >
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

// Memoized ReplyTextArea Component
const ReplyTextArea = memo(
  ({
    value,
    onChange,
    onSubmit,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
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
        <button
          onClick={onSubmit}
          className="w-full py-2 font-semibold rounded-md bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition"
        >
          Send Reply
        </button>
      </div>
    );
  }
);

ReplyTextArea.displayName = "ReplyTextArea";

// Memoized MessageCard Component
const MessageCard = memo(
  ({
    docId,
    content,
    onOpen,
    voteData,
    reactionData,
    onVote,
    onReact,
  }: {
    docId: string;
    content: string;
    onOpen: (docId: string, content: string) => void;
    voteData?: VoteInfo;
    reactionData?: { [reaction: string]: ReactionEntry };
    onVote: (docId: string, voteValue: number) => void;
    onReact: (docId: string, reaction: string) => void;
  }) => {
    const availableReactions = ["👍", "❤️", "😮"];

    return (
      <div className="flex flex-col bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md transition transform hover:scale-105 hover:shadow-xl">
        <div
          className="text-gray-100 text-base line-clamp-4"
          style={{ minHeight: "100px", overflowY: "hidden" }}
        >
          {content || "No content available"}
        </div>
        <button
          className="mt-3 self-start text-sm font-medium text-pink-300 hover:text-pink-200 transition"
          onClick={() => onOpen(docId, content)}
        >
          Read More
        </button>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onVote(docId, 1)}
              className={`px-2 py-1 rounded transition ${
                voteData?.userVote === 1
                  ? "bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Upvote
            </button>
            <button
              onClick={() => onVote(docId, -1)}
              className={`px-2 py-1 rounded transition ${
                voteData?.userVote === -1
                  ? "bg-red-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Downvote
            </button>
            <span className="text-sm">
              Score: {voteData?.total ? voteData.total : 0}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {availableReactions.map((emoji) => {
              const isSelected = reactionData?.[emoji]?.selected ?? false;
              const count = reactionData?.[emoji]?.count ?? 0;
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(docId, emoji)}
                  className={`flex items-center px-2 py-1 rounded transition ${
                    isSelected
                      ? "bg-blue-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  <span className="text-sm">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

MessageCard.displayName = "MessageCard";

function ConfessionsPage({ user }: ConfessionsPageProps) {
  const client = useMemo(() => {
    return new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  }, []);

  const databases = useMemo(() => new Databases(client), [client]);

  if (
    !process.env.NEXT_PUBLIC_AW_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_AW_DATABASE_ID ||
    !process.env.NEXT_PUBLIC_AW_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_VOTES_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID ||
    !process.env.NEXT_PUBLIC_AW_ENDPOINT
  ) {
    throw new Error("Required environment variables are not set");
  }

  const databaseId = process.env.NEXT_PUBLIC_AW_DATABASE_ID;
  const messagesCollectionId = process.env.NEXT_PUBLIC_AW_COLLECTION_ID;
  const repliesCollectionId = process.env.NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID;
  const votesCollectionId = process.env.NEXT_PUBLIC_AW_VOTES_COLLECTION_ID;
  const reactionsCollectionId =
    process.env.NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID;

  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState<{ $id: string; message: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [selectedMessageContent, setSelectedMessageContent] = useState<string>(
    ""
  );
  const [replies, setReplies] = useState<
    { $id: string; messageId: string; reply: string }[]
  >([]);
  const [replyInput, setReplyInput] = useState("");
  const [votes, setVotes] = useState<{ [postId: string]: VoteInfo }>({});
  const [reactions, setReactions] = useState<{
    [postId: string]: { [reaction: string]: ReactionEntry };
  }>({});

  // Sorting state
  const [sortOption, setSortOption] = useState<
    "recent" | "upvotes" | "reactions"
  >("recent");
  // Controls dropdown open/close
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const typedRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current as Element, {
      strings: [
        "confess your love",
        "share your feelings",
        "confess your heart",
      ],
      typeSpeed: 80,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      backDelay: 1000,
      startDelay: 300,
    });
    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await databases.listDocuments(
          databaseId,
          messagesCollectionId
        );
        const postsData = response.documents as unknown as {
          $id: string;
          message: string;
        }[];
        // Reverse to show the latest posts first
        setPosts(postsData.reverse());
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [databaseId, messagesCollectionId, databases]);

  const fetchVotes = useCallback(async () => {
    try {
      const response = await databases.listDocuments(databaseId, votesCollectionId);
      const votesData = response.documents as unknown as {
        $id: string;
        postId: string;
        vote: number;
        userId: string;
      }[];
      const votesMap: { [postId: string]: VoteInfo } = {};
      votesData.forEach((doc) => {
        const { postId, vote, userId, $id } = doc;
        if (!votesMap[postId]) {
          votesMap[postId] = { total: 0, userVote: null };
        }
        votesMap[postId].total += vote;
        if (userId === user.$id) {
          votesMap[postId].userVote = vote;
          votesMap[postId].docId = $id;
        }
      });
      setVotes(votesMap);
    } catch (err) {
      console.error("Error fetching votes:", err);
    }
  }, [databases, databaseId, votesCollectionId, user]);
  

  const fetchReactions = useCallback(async () => {
    try {
      const response = await databases.listDocuments(databaseId, reactionsCollectionId);
      const reactionsData = response.documents as unknown as {
        $id: string;
        postId: string;
        reaction: string;
        userId: string;
      }[];
      const reactionsMap: {
        [postId: string]: { [reaction: string]: ReactionEntry };
      } = {};
      reactionsData.forEach((doc) => {
        const { postId, reaction, userId, $id } = doc;
        if (!reactionsMap[postId]) reactionsMap[postId] = {};
        if (!reactionsMap[postId][reaction]) {
          reactionsMap[postId][reaction] = { count: 0, selected: false };
        }
        reactionsMap[postId][reaction].count++;
        if (userId === user.$id) {
          reactionsMap[postId][reaction].selected = true;
          reactionsMap[postId][reaction].docId = $id;
        }
      });
      setReactions(reactionsMap);
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  }, [databases, databaseId, reactionsCollectionId, user]);
  
  useEffect(() => {
    fetchVotes();
    fetchReactions();
  }, [posts]);

  const handlePost = async () => {
    if (!inputValue.trim()) return;
    try {
      await databases.createDocument(
        databaseId,
        messagesCollectionId,
        "unique()",
        { message: inputValue }
      );
      const response = await databases.listDocuments(
        databaseId,
        messagesCollectionId
      );
      const postsData = response.documents as unknown as {
        $id: string;
        message: string;
      }[];
      setPosts(postsData.reverse());
      setInputValue("");
    } catch (err) {
      console.error("Error posting content:", err);
    }
  };

  const handleOpenMessage = async (docId: string, content: string) => {
    setSelectedMessageId(docId);
    setSelectedMessageContent(content);
    setIsModalOpen(true);
    setReplyInput("");
    try {
      const res = await databases.listDocuments(databaseId, repliesCollectionId);
      const allReplies = (res.documents as unknown as {
        $id: string;
        messageId: string;
        reply: string;
      }[]).filter((r) => r.messageId === docId);
      setReplies(allReplies);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  };

  const handleReply = useCallback(async () => {
    if (!replyInput.trim()) return;
    try {
      await databases.createDocument(
        databaseId,
        repliesCollectionId,
        "unique()",
        {
          messageId: selectedMessageId,
          reply: replyInput,
        }
      );
      const res = await databases.listDocuments(databaseId, repliesCollectionId);
      const allReplies = (res.documents as unknown as {
        $id: string;
        messageId: string;
        reply: string;
      }[]).filter((r) => r.messageId === selectedMessageId);
      setReplies(allReplies);
      setReplyInput("");
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  }, [databases, databaseId, repliesCollectionId, replyInput, selectedMessageId]);
  
  const handleVote = async (postId: string, newVoteValue: number) => {
    // Suppose 'votes[postId]' is an object like:
    // { total: number; userVote: number; docId: string }
    const voteData = votes[postId];
  
    // If the user has never voted on this post (no docId)
    if (!voteData || !voteData.docId) {
      // Create a new doc with the chosen vote
      try {
        await databases.createDocument(
          databaseId,
          votesCollectionId,
          "unique()",
          {
            postId,
            userId: user.$id,
            vote: newVoteValue,
          }
        );
        fetchVotes(); // refresh local state
      } catch (err) {
        console.error("Error creating vote doc:", err);
      }
      return;
    }
  
    // If user is clicking the same vote again, toggle it off (set to 0)
    if (voteData.userVote === newVoteValue) {
      // That means they want to remove their vote
      try {
        await databases.updateDocument(
          databaseId,
          votesCollectionId,
          voteData.docId,
          { vote: 0 }
        );
        fetchVotes();
      } catch (err) {
        console.error("Error removing vote:", err);
      }
      return;
    }
  
    // Otherwise, user is switching from +1 to -1 or from -1 to +1
    // Update the existing doc to the new vote
    try {
      await databases.updateDocument(
        databaseId,
        votesCollectionId,
        voteData.docId,
        { vote: newVoteValue }
      );
      fetchVotes();
    } catch (err) {
      console.error("Error updating vote:", err);
    }
  };
  

  const handleReaction = async (postId: string, reaction: string) => {
    const reactionEntry = reactions[postId]?.[reaction];
    try {
      if (reactionEntry && reactionEntry.selected && reactionEntry.docId) {
        await databases.deleteDocument(
          databaseId,
          reactionsCollectionId,
          reactionEntry.docId
        );
      } else {
        await databases.createDocument(databaseId, reactionsCollectionId, "unique()", {
          postId,
          reaction,
          userId: user.$id,
        });
      }
      fetchReactions();
    } catch (err) {
      console.error("Error posting reaction:", err);
    }
  };

  // Compute sorted posts based on the selected filter
  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    if (sortOption === "recent") {
      return postsCopy;
    } else if (sortOption === "upvotes") {
      return postsCopy.sort((a, b) => {
        const aVotes = votes[a.$id]?.total || 0;
        const bVotes = votes[b.$id]?.total || 0;
        return bVotes - aVotes;
      });
    } else if (sortOption === "reactions") {
      return postsCopy.sort((a, b) => {
        const aReactions = Object.values(reactions[a.$id] || {}).reduce(
          (sum, { count }) => sum + count,
          0
        );
        const bReactions = Object.values(reactions[b.$id] || {}).reduce(
          (sum, { count }) => sum + count,
          0
        );
        return bReactions - aReactions;
      });
    }
    return postsCopy;
  }, [posts, sortOption, votes, reactions]);

  const renderModalContent = useMemo(
    () => (
      <>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-gray-100 text-base whitespace-pre-wrap mb-6">
            {selectedMessageContent}
          </div>
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-pink-300">
              Replies
            </h4>
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
        </div>
        <ReplyTextArea
          value={replyInput}
          onChange={setReplyInput}
          onSubmit={handleReply}
        />
      </>
    ),
    [selectedMessageContent, replies, replyInput, handleReply]
  );
  

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#1f1b2e] via-[#1a1822] to-black text-white">
      <header className="relative w-full py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Anonymous Confessions
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Where your secrets are safe and hearts can speak freely
          </p>
          <div className="flex items-center justify-center">
            <p
              className="text-2xl font-bold text-pink-500 leading-none h-8"
              ref={typedRef}
            ></p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
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

        {/* Single "Sort By" button with dropdown */}
        <section className="mb-8 flex justify-center">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500"
            >
              {/* Label changes based on the current sort option */}
              Sort By:{" "}
              {sortOption === "recent"
                ? "Recent Confessions"
                : sortOption === "upvotes"
                ? "Highest Upvotes"
                : "Most Reactions"}
              <span className="ml-2">▼</span>
            </button>
            {isSortMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white/10 border border-white/20 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortOption("recent");
                      setIsSortMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-pink-600 ${
                      sortOption === "recent" ? "bg-pink-600" : ""
                    }`}
                  >
                    Recent Confessions
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("upvotes");
                      setIsSortMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-pink-600 ${
                      sortOption === "upvotes" ? "bg-pink-600" : ""
                    }`}
                  >
                    Highest Upvotes
                  </button>
                  <button
                    onClick={() => {
                      setSortOption("reactions");
                      setIsSortMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-pink-600 ${
                      sortOption === "reactions" ? "bg-pink-600" : ""
                    }`}
                  >
                    Most Reactions
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-200 mb-6">
            {/* Display a heading that matches the chosen sort option */}
            {sortOption === "recent"
              ? "Recent Confessions"
              : sortOption === "upvotes"
              ? "Confessions with Highest Upvotes"
              : "Confessions with Most Reactions"}
          </h2>
          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map((post) => (
                <MessageCard
                  key={post.$id}
                  docId={post.$id}
                  content={post.message}
                  onOpen={handleOpenMessage}
                  voteData={votes[post.$id]}
                  reactionData={reactions[post.$id]}
                  onVote={handleVote}
                  onReact={handleReaction}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderModalContent}
      </Modal>
    </main>
  );
}
