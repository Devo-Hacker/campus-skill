import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";
import { startOfToday } from "@/lib/dates";

const SORTS = {
  newest: { createdAt: -1 },
  deadline: { deadline: 1 },
  budget: { budgetAmount: -1, createdAt: -1 },
};

// GET /api/gigs?category=&budgetType=&search=&club=&status=&sort=&page=&limit=
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const budgetType = searchParams.get("budgetType");
    const search = searchParams.get("search");
    const club = searchParams.get("club");
    const status = searchParams.get("status") || "open";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 24));

    const filter = {};
    if (category) filter.category = category;
    if (budgetType) filter.budgetType = budgetType;
    if (club && mongoose.Types.ObjectId.isValid(club)) filter.postedBy = club;
    if (status !== "all") filter.status = status;
    // Open gigs whose deadline has passed drop out of the feed
    if (status === "open") filter.deadline = { $gte: startOfToday() };
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = { $regex: safe, $options: "i" };
      filter.$or = [{ title: rx }, { skillsRequired: rx }];
    }

    const [gigs, total] = await Promise.all([
      Gig.find(filter)
        .populate("postedBy", "name clubName")
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Gig.countDocuments(filter),
    ]);

    // How many students applied to each gig
    const counts = await Application.aggregate([
      { $match: { gig: { $in: gigs.map((g) => g._id) } } },
      { $group: { _id: "$gig", n: { $sum: 1 } } },
    ]);
    const countById = Object.fromEntries(counts.map((c) => [c._id.toString(), c.n]));

    const result = gigs.map((g) => ({
      ...g.toObject(),
      applicantsCount: countById[g._id.toString()] || 0,
    }));

    return NextResponse.json({ gigs: result, total, page, hasMore: page * limit < total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/gigs  (clubs only)
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
    if (user.role !== "club") {
      return NextResponse.json({ error: "Only clubs can post gigs" }, { status: 403 });
    }

    const { title, description, category, skillsRequired, budgetType, budgetAmount, deadline } =
      await req.json();

    if (!title || !description || !category || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const dl = new Date(deadline);
    if (isNaN(dl.getTime()) || dl < startOfToday()) {
      return NextResponse.json({ error: "Deadline cannot be in the past" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.create({
      title,
      description,
      category,
      skillsRequired: skillsRequired || [],
      budgetType,
      budgetAmount: budgetType === "paid" ? budgetAmount || 0 : 0,
      deadline: dl,
      postedBy: user._id,
    });

    return NextResponse.json({ gig }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}