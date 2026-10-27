import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";

// POST /api/gigs/:id/apply  (students only)
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (user.role !== "student") {
      return NextResponse.json({ error: "Only students can apply" }, { status: 403 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    const { message, portfolioLink } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    if (gig.status !== "open") {
      return NextResponse.json({ error: "This gig is no longer open" }, { status: 400 });
    }

    const application = await Application.create({
      gig: id,
      student: user._id,
      message,
      portfolioLink: portfolioLink || "",
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    // Duplicate key error = already applied
    if (err.code === 11000) {
      return NextResponse.json({ error: "You already applied to this gig" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/gigs/:id/apply  (the club that owns the gig sees applicants)
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    if (gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }

    const applications = await Application.find({ gig: id })
      .populate("student", "name email skills bio portfolio")
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}