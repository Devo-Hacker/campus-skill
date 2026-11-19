export const CATEGORIES = [
  { value: "design", label: "Design" },
  { value: "video", label: "Video" },
  { value: "photography", label: "Photo" },
  { value: "coding", label: "Code" },
  { value: "writing", label: "Writing" },
  { value: "social-media", label: "Social" },
  { value: "other", label: "Other" },
];

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function budgetText(gig) {
  if (gig.budgetType === "paid") return `₹${gig.budgetAmount}`;
  if (gig.budgetType === "certificate") return "Certificate";
  return "Unpaid";
}

// Whole calendar days from today until the deadline (negative = passed)
export function daysLeft(deadline) {
  const d = new Date(deadline);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const t = new Date();
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((a - b) / 86400000);
}

export function deadlineLabel(deadline) {
  const n = daysLeft(deadline);
  if (n < 0) return "Closed";
  if (n === 0) return "Due today";
  if (n === 1) return "1 day left";
  return `${n} days left`;
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(date);
}

export function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?"
  );
}

const PALETTE = ["#ffc58f", "#9cc4ff", "#c8f169", "#ffb3d9", "#d3b8ff", "#ffe08a"];
export function avatarColor(str = "") {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}