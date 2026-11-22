import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
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

    const rows = await Application.aggregate([
      { $match: { gig: { $in: gigs.map((g) => g._id) } } },
      { $group: { _id: { gig: "$gig", status: "$status" }, n: { $sum: 1 } } },
    ]);

    const counts = {};
    for (const r of rows) {
      const key = r._id.gig.toString();
      counts[key] = counts[key] || { total: 0, pending: 0 };
      counts[key].total += r.n;
      if (r._id.status === "pending") counts[key].pending += r.n;
    }

    const result = gigs.map((g) => ({
      ...g.toObject(),
      applicantsCount: counts[g._id.toString()]?.total || 0,
      pendingCount: counts[g._id.toString()]?.pending || 0,
    }));

    return NextResponse.json({ gigs: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}