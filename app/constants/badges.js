// Badges for the "Nominate" tab — single source of truth, used by
// app/page.jsx (the nominate form) and app/components/Post.jsx (the feed).
//
// Each `image` path expects the file to live in /public/badges/, e.g.
// /public/badges/initiative.png. The images already include the seal
// shape and the label text baked in, so no separate text label is
// rendered alongside them in the UI.
export const BADGE_OPTIONS = [
  {
    id: "Initiative",
    label: "Initiative",
    image: "/badges/initiative.png",
    description: "Recognizes employees who take ownership, act proactively, and step up when needed.",
  },
  {
    id: "ProblemSolving",
    label: "Problem-Solving",
    image: "/badges/problem-solving.png",
    description: "Recognizes employees who approach challenges constructively and find practical solutions.",
  },
  {
    id: "Adaptability",
    label: "Adaptability",
    image: "/badges/adaptability.png",
    description: "Recognizes employees who embrace change, adjust to new situations, and remain effective in evolving circumstances.",
  },
  {
    id: "Teamwork",
    label: "Teamwork",
    image: "/badges/teamwork.png",
    description: "Recognizes employees who collaborate effectively, support their colleagues, and contribute to a strong team environment.",
  },
  {
    id: "Integrity",
    label: "Integrity",
    image: "/badges/integrity.png",
    description: "Recognizes employees who demonstrate honesty, accountability, fairness, and strong professional values.",
  },
];

export function getBadgeById(id) {
  return BADGE_OPTIONS.find((b) => b.id === id);
}