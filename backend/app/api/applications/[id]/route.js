import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/applications/:id   body: { "status": "accepted" | "rejected" }
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    const { status } = await req.json();
    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be accepted or rejected" }, { status: 400 });
    }

    await connectDB();
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const gig = await Gig.findById(application.gig);
    if (!gig || gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }

    if (status === "accepted") {
      if (gig.status !== "open") {
        return NextResponse.json({ error: "A student is already hired for this gig" }, { status: 400 });
      }
      gig.hiredStudent = application.student;
      gig.status = "in-progress";
      await gig.save();

      // Reject all other pending applicants automatically
      await Application.updateMany(
        { gig: gig._id, _id: { $ne: application._id }, status: "pending" },
        { status: "rejected" }
      );
    }

    application.status = status;
    await application.save();

    return NextResponse.json({ application, gigStatus: gig.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}