import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

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
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    const user = await getCurrentUser(); // may be null (public page)
    let myApplication = null;
    if (user && user.role === "student") {
      myApplication = await Application.findOne({ gig: id, student: user._id }).select(
        "status createdAt"
      );
    }
    const applicantsCount = await Application.countDocuments({ gig: id });

    return NextResponse.json({ gig, applicantsCount, myApplication });
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
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    const { status } = await req.json();
    if (status !== "completed") {
      return NextResponse.json({ error: "Status must be completed" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id);
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    if (gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }
    if (gig.status !== "in-progress") {
      return NextResponse.json({ error: "Only in-progress gigs can be completed" }, { status: 400 });
    }

    gig.status = "completed";
    await gig.save();

    if (gig.hiredStudent) {
      await notify(gig.hiredStudent, {
        type: "completed",
        message: `"${gig.title}" was marked as completed`,
        link: `/gigs/${gig._id}`,
      });
    }
    return NextResponse.json({ gig });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/gigs/:id  (owner club, only while the gig is still open)
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gig id" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.findById(id);
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    if (gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }
    if (gig.status !== "open") {
      return NextResponse.json({ error: "Only open gigs can be deleted" }, { status: 400 });
    }

    const pending = await Application.find({ gig: id, status: "pending" }).select("student");
    await Promise.all(
      pending.map((a) =>
        notify(a.student, {
          type: "cancelled",
          message: `"${gig.title}" was cancelled by the club`,
          link: "/dashboard",
        })
      )
    );
    await Application.deleteMany({ gig: id });
    await gig.deleteOne();

    return NextResponse.json({ message: "Gig deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}