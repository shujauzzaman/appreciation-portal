"use client";
import React, { useState } from 'react';
import { Heart, Repeat2 } from 'lucide-react';
import { toggleLike, toggleClap, incrementShareCount } from "@/app/services/posts";

const SHARE_OPTIONS = ["Copy Link", "Team Chat", "Email"];

export default function Post({ post, currentUserUid }) {
  const [comment, setComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const liked = post.likedBy?.includes(currentUserUid) || false;
  const clapped = post.clapedBy?.includes(currentUserUid) || false;
  const likeCount = post.likedBy?.length || 0;
  const clapCount = post.clapedBy?.length || 0;

  const handleLikeClick = async () => {
    if (!currentUserUid) return;
    try {
      await toggleLike(post.id, currentUserUid, liked);
      if (!liked) setComment('❤️ Liked this post');
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  const handleClapClick = async () => {
    if (!currentUserUid) return;
    try {
      await toggleClap(post.id, currentUserUid, clapped);
      if (!clapped) setComment('👏 Clapped for this');
    } catch (err) {
      console.error("Error updating clap:", err);
    }
  };

  const handleShareOptionClick = async (optionLabel) => {
    try {
      await incrementShareCount(post.id);

      if (optionLabel === 'Copy Link') {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        try {
          await navigator.clipboard.writeText(shareUrl);
          setComment('🔗 Link copied to clipboard!');
        } catch {
          setComment(shareUrl);
        }
      } else {
        // TODO: Team Chat and Email are not wired up to real functionality yet
        setComment(`🔁 Shared via ${optionLabel}`);
      }
      setShowShareMenu(false);
    } catch (err) {
      console.error("Error updating share count:", err);
    }
  };

  return (
    <div className=" mt-10 bg-white border-4 border-[#001c7f] rounded-lg relative shadow-sm flex flex-col justify-between">
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-20 h-20 rounded-full border-4 border-[#001c7f] overflow-hidden bg-sky-200 relative shadow-md">
          {post.recipientPhotoURL ? (
            <img src={post.recipientPhotoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-sky-300"></div>
              <div className="absolute bottom-0 w-full h-10 bg-green-500 rounded-t-full"></div>
            </>
          )}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="text-center mt-12">
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

        <div className="bg-[#001c7f]/5 rounded-lg p-6 mt-6 border border-[#001c7f]/10 flex flex-col items-center justify-center flex-grow">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-[#001c7f]/20 py-4 px-6 bg-white rounded-b-md relative">
        <div className="flex items-center gap-6 text-[#001c7f] font-black text-sm">
          <button
            type="button"
            onClick={handleLikeClick}
            className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-150"
          >
            <Heart className={`w-5 h-5 text-[#001c7f] transition-all duration-150 ${liked ? 'fill-[#001c7f]' : 'fill-white'}`} />
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={handleClapClick}
            className={`flex items-center gap-1.5 hover:scale-105 transition-transform duration-150 ${clapped ? 'opacity-100' : 'opacity-70'}`}
          >
            <span className="text-xl">👏</span>
            <span>{clapCount}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShareMenu((prev) => !prev)}
              className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-150"
            >
              <Repeat2 className="w-5 h-5 text-[#001c7f]" />
              <span>{post.shareCount || 0}</span>
            </button>

            {showShareMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border-2 border-[#001c7f] rounded-lg shadow-lg z-30 overflow-hidden">
                {SHARE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleShareOptionClick(option)}
                    className="w-full text-left px-4 py-2.5 text-xs font-black uppercase text-[#001c7f] hover:bg-blue-50 transition-colors duration-150 border-b border-[#001c7f]/10 last:border-b-0"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 w-full">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="COMMENT"
            className="w-full border-2 border-[#001c7f] rounded-md py-2 px-4 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none bg-[#f8fafc]"
          />
        </div>
      </div>
    </div>
  );
}