import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

// PATCH /api/applications/:id   body: { "status": "accepted" | "rejected" }
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    const { status } = await req.json();
    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be accepted or rejected" }, { status: 400 });
    }

    await connectDB();
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const gig = await Gig.findById(application.gig);
    if (!gig || gig.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your gig" }, { status: 403 });
    }
    if (application.status !== "pending") {
      return NextResponse.json({ error: "This application is already decided" }, { status: 400 });
    }

    if (status === "accepted") {
      if (gig.status !== "open") {
        return NextResponse.json({ error: "A student is already hired for this gig" }, { status: 400 });
      }
      gig.hiredStudent = application.student;
      gig.status = "in-progress";
      await gig.save();

      // Auto-reject everyone else who is still pending, and tell them
      const others = await Application.find({
        gig: gig._id,
        _id: { $ne: application._id },
        status: "pending",
      }).select("student");
      await Application.updateMany(
        { _id: { $in: others.map((o) => o._id) } },
        { status: "rejected" }
      );
      await Promise.all(
        others.map((o) =>
          notify(o.student, {
            type: "rejected",
            message: `"${gig.title}" went to another applicant`,
            link: `/gigs/${gig._id}`,
          })
        )
      );
    }

    application.status = status;
    await application.save();

    await notify(application.student, {
      type: status,
      message:
        status === "accepted"
          ? `You were selected for "${gig.title}"!`
          : `Your application for "${gig.title}" was not selected`,
      link: `/gigs/${gig._id}`,
    });

    return NextResponse.json({ application, gigStatus: gig.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/applications/:id  (student withdraws their own pending application)
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    await connectDB();
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (application.student.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not your application" }, { status: 403 });
    }
    if (application.status !== "pending") {
      return NextResponse.json({ error: "Only pending applications can be withdrawn" }, { status: 400 });
    }

    await application.deleteOne();
    return NextResponse.json({ message: "Application withdrawn" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}