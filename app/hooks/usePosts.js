"use client";
import { useState, useEffect } from "react";
import { subscribeToPostsFeed } from "@/app/services/posts";

// Live-subscribes to the posts feed. `enabled` lets callers wait until
// auth has resolved before starting the subscription.
export function usePostsFeed(enabled) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToPostsFeed(
      (list) => {
        setPosts(list);
        setLoadingPosts(false);
      },
      (err) => {
        console.error("Error listening to posts feed:", err);
        setLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, [enabled]);

  return { posts, loadingPosts };
}