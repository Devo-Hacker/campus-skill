import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Gig from "@/models/Gig";
import { getCurrentUser } from "@/lib/auth";

// GET /api/gigs?category=design&budgetType=paid&search=poster&status=open
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const filter = {};
    const category = searchParams.get("category");
    const budgetType = searchParams.get("budgetType");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "open";

    if (category) filter.category = category;
    if (budgetType) filter.budgetType = budgetType;
    if (status !== "all") filter.status = status;
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: safe, $options: "i" };
    }

    const gigs = await Gig.find(filter)
      .populate("postedBy", "name clubName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ gigs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/gigs  (clubs only)
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (user.role !== "club") {
      return NextResponse.json({ error: "Only clubs can post gigs" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, skillsRequired, budgetType, budgetAmount, deadline } = body;

    if (!title || !description || !category || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const gig = await Gig.create({
      title,
      description,
      category,
      skillsRequired: skillsRequired || [],
      budgetType,
      budgetAmount: budgetType === "paid" ? budgetAmount || 0 : 0,
      deadline,
      postedBy: user._id,
    });

    return NextResponse.json({ gig }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}