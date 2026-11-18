import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

// GET /api/notifications -> latest 30 + unread count
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

    await connectDB();
    const [notifications, unread] = await Promise.all([
      Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(30),
      Notification.countDocuments({ user: user._id, read: false }),
    ]);
    return NextResponse.json({ notifications, unread });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/notifications -> mark all as read
export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

    await connectDB();
    await Notification.updateMany({ user: user._id, read: false }, { read: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}