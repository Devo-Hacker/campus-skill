import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Gig from "@/models/Gig";
import Review from "@/models/Review";
import { getTopTalent } from "@/lib/talent";
import { startOfToday } from "@/lib/dates";

export async function GET() {
  try {
    await connectDB();
    const openFilter = { status: "open", deadline: { $gte: startOfToday() } };

    const [students, completed, openGigs, rating, hiringClubs, clubRows, recent, topTalent] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Gig.countDocuments({ status: "completed" }),
        Gig.countDocuments(openFilter),
        Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } }]),
        Gig.distinct("postedBy", openFilter),
        Gig.aggregate([
          { $match: openFilter },
          { $group: { _id: "$postedBy", openGigs: { $sum: 1 }, category: { $first: "$category" } } },
          { $sort: { openGigs: -1 } },
          { $limit: 3 },
        ]),
        Gig.find({})
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate("postedBy", "name clubName")
          .populate("hiredStudent", "name"),
        getTopTalent(4),
      ]);

    const clubUsers = await User.find({ _id: { $in: clubRows.map((c) => c._id) } }).select(
      "name clubName"
    );
    const clubById = Object.fromEntries(clubUsers.map((u) => [u._id.toString(), u]));
    const clubs = clubRows
      .filter((c) => clubById[c._id.toString()])
      .map((c) => {
        const u = clubById[c._id.toString()];
        return { id: c._id, name: u.clubName || u.name, openGigs: c.openGigs, category: c.category };
      });

    const activity = recent.map((g) => {
      const club = g.postedBy?.clubName || g.postedBy?.name || "A club";
      let text;
      if (g.status === "completed") text = `${club} completed "${g.title}"`;
      else if (g.status === "in-progress")
        text = `${club} hired ${g.hiredStudent?.name || "a student"} for "${g.title}"`;
      else text = `${club} posted "${g.title}"`;
      return { id: g._id, text, status: g.status, at: g.updatedAt };
    });

    return NextResponse.json({
      stats: {
        students,
        completed,
        openGigs,
        clubsHiring: hiringClubs.length,
        avgRating: rating[0] ? Number(rating[0].avg.toFixed(1)) : null,
        totalReviews: rating[0]?.n || 0,
      },
      topTalent,
      clubs,
      activity,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}