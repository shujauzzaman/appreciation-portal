"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { Heart, ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Auth guard — same pattern as Home
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login-form');
        return;
      }
      setCurrentUser(user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch the specific post once auth resolves
  useEffect(() => {
    if (!currentUser || !postId) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setNotFound(true);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [currentUser, postId]);

  const isLikedByMe = post?.likedBy?.includes(currentUser?.uid);
  const likeCount = post?.likedBy?.length || 0;

  const handleLikeClick = async () => {
    if (!currentUser || !post) return;
    const alreadyLiked = isLikedByMe;
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likedBy: alreadyLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      });
      // Reflect the change locally without needing a refetch
      setPost((prev) => ({
        ...prev,
        likedBy: alreadyLiked
          ? prev.likedBy.filter((uid) => uid !== currentUser.uid)
          : [...(prev.likedBy || []), currentUser.uid],
      }));
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  if (checkingAuth || loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#001c7f] font-black uppercase tracking-wider text-sm">
          Loading...
        </p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 my-10">
        <p className="text-gray-500 font-bold text-sm">This post doesn't exist or may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto my-10">

        <div className="bg-white border-4 border-[#001c7f] rounded-lg relative shadow-sm">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-20 h-20 rounded-full border-4 border-[#001c7f] overflow-hidden bg-sky-200 relative shadow-md">
              {post.senderPhotoURL ? (
                <img src={post.senderPhotoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-sky-300"></div>
                  <div className="absolute bottom-0 w-full h-10 bg-green-500 rounded-t-full"></div>
                </>
              )}
            </div>
          </div>

          <div className="p-6 pt-16">
            <div className="text-center">
              <h4 className="text-base font-black text-[#001c7f] uppercase tracking-wide">
                {post.recipientName} <span className="text-gray-700 font-bold">WAS APPRECIATED BY</span>
              </h4>
              <h4 className="text-base font-black text-[#001c7f] uppercase tracking-wide mt-1.5">
                {post.senderName}
              </h4>
              {post.recipientDepartment && (
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{post.recipientDepartment}</p>
              )}
            </div>

            <div className="bg-[#001c7f]/5 rounded-lg p-6 mt-6 border border-[#001c7f]/10 flex flex-col items-center justify-center">
              <h1 className="text-[#001c7f] font-black text-3xl md:text-4xl tracking-widest text-center uppercase">
                {post.level || "CHEERS!!!"}
              </h1>
              {post.message && (
                <p className="text-gray-700 font-semibold text-sm text-center mt-4 max-w-lg">
                  {post.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 border-t-2 border-[#001c7f]/20 py-4 px-6">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-150 text-[#001c7f] font-black text-sm"
            >
              <Heart
                className={`w-5 h-5 text-[#001c7f] transition-all duration-150 ${
                  isLikedByMe ? 'fill-[#001c7f]' : 'fill-white'
                }`}
              />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}