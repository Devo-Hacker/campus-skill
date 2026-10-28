import { getCurrentUser } from "@/lib/auth";
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

// PATCH /api/gigs/:id   body: { "status": "completed" }  (owner club only)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    const { status } = await req.json();
    if (status !== "completed") {
      return NextResponse.json({ error: "Status must be completed" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    if (gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }
    if (gig.status !== "in-progress") {
      return NextResponse.json({ error: "Only in-progress gigs can be completed" }, { status: 400 });
    }

    gig.status = "completed";
    await gig.save();
    return NextResponse.json({ gig });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}