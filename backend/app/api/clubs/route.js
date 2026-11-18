import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Gig from "@/models/Gig";
import { startOfToday } from "@/lib/dates";

export async function GET() {
  try {
    await connectDB();
    const today = startOfToday();

    const [clubs, rows] = await Promise.all([
      User.find({ role: "club" }).select("name clubName bio"),
      Gig.aggregate([
        {
          $group: {
            _id: "$postedBy",
            totalGigs: { $sum: 1 },
            openGigs: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$status", "open"] }, { $gte: ["$deadline", today] }] },
                  1,
                  0,
                ],
              },
            },
            completedGigs: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const byId = Object.fromEntries(rows.map((r) => [r._id.toString(), r]));
    const result = clubs
      .map((c) => {
        const r = byId[c._id.toString()] || {};
        return {
          id: c._id,
          name: c.clubName || c.name,
          bio: c.bio || "",
          openGigs: r.openGigs || 0,
          completedGigs: r.completedGigs || 0,
          totalGigs: r.totalGigs || 0,
        };
      })
      .sort((a, b) => b.openGigs - a.openGigs || b.completedGigs - a.completedGigs);

    return NextResponse.json({ clubs: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}