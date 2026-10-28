import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    await connectDB();
    const gigs = await Gig.find({ postedBy: user._id })
      .populate("hiredStudent", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ gigs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}