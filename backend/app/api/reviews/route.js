import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Review from "@/models/Review";
import { getCurrentUser } from "@/lib/auth";

// POST /api/reviews   body: { gigId, rating, comment }  (club reviews hired student)
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { gigId, rating, comment } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: "Rating must be 1 to 5" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    if (gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }
    if (gig.status !== "completed" || !gig.hiredStudent) {
      return NextResponse.json({ error: "Gig must be completed first" }, { status: 400 });
    }

    const review = await Review.create({
      gig: gigId,
      reviewer: user._id,
      student: gig.hiredStudent,
      rating: r,
      comment: comment || "",
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}