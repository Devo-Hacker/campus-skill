import User from "@/models/User";
import Review from "@/models/Review";

// Ranks students by a weighted score so one lucky 5-star review
// doesn't outrank someone with many good reviews.
export async function getTopTalent(limit = 10) {
  const rows = await Review.aggregate([
    { $group: { _id: "$student", sum: { $sum: "$rating" }, count: { $sum: 1 } } },
    {
      $addFields: {
        avg: { $divide: ["$sum", "$count"] },
        score: { $divide: [{ $add: ["$sum", 12] }, { $add: ["$count", 3] }] },
      },
    },
    { $sort: { score: -1, count: -1 } },
    { $limit: limit },
  ]);

  const users = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select("name skills");
  const byId = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return rows
    .filter((r) => byId[r._id.toString()])
    .map((r) => {
      const u = byId[r._id.toString()];
      return {
        id: r._id,
        name: u.name,
        skills: (u.skills || []).slice(0, 2),
        rating: Number(r.avg.toFixed(1)),
        reviews: r.count,
      };
    });
}