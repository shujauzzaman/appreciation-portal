import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Live subscription to the posts feed, newest first.
// Returns the unsubscribe function — caller is responsible for cleanup.
export function subscribeToPostsFeed(onData, onError) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// Fetch a single post by id (used by the /post/[id] detail page)
export async function fetchPostById(postId) {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Create a new "recognize" (appreciate) post
export async function createRecognizePost({ sender, recipient, level, message }) {
  return addDoc(collection(db, "posts"), {
    type: "recognize",
    senderId: sender.uid,
    senderName: sender.name,
    senderPhotoURL: sender.photoURL || null,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientDepartment: recipient.department || "",
    level,
    message,
    likedBy: [],
    clapedBy: [],
    shareCount: 0,
    createdAt: serverTimestamp(),
  });
}

// Toggle the current user's uid in/out of a post's likedBy array
export async function toggleLike(postId, uid, alreadyLiked) {
  await updateDoc(doc(db, "posts", postId), {
    likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

// Toggle the current user's uid in/out of a post's clapedBy array
export async function toggleClap(postId, uid, alreadyClapped) {
  await updateDoc(doc(db, "posts", postId), {
    clapedBy: alreadyClapped ? arrayRemove(uid) : arrayUnion(uid),
  });
}

// Bump a post's share counter by 1
export async function incrementShareCount(postId) {
  await updateDoc(doc(db, "posts", postId), { shareCount: increment(1) });
}