import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id)
      .populate("postedBy", "name clubName email")
      .populate("hiredStudent", "name email");

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    return NextResponse.json({ gig });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}