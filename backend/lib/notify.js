import Notification from "@/models/Notification";

// Never let a failed notification break the main action
export async function notify(userId, { type, message, link = "" }) {
  try {
    await Notification.create({ user: userId, type, message, link });
  } catch (err) {
    console.error("notify failed:", err);
  }
}