import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await connectDB();
    const student = await User.findOne({ _id: id, role: "student" }).select(
      "name skills bio portfolio createdAt"
    );
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const reviews = await Review.find({ student: id })
      .populate("reviewer", "name clubName")
      .populate("gig", "title")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : null;

    return NextResponse.json({ student, reviews, averageRating, totalReviews: reviews.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}