import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/me/profile   body: { name?, bio?, skills?, portfolio?, clubName? }
export async function PUT(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    if (typeof body.name === "string" && body.name.trim()) user.name = body.name.trim();
    if (typeof body.bio === "string") user.bio = body.bio;

    if (user.role === "student") {
      if (Array.isArray(body.skills)) user.skills = body.skills.map(String);
      if (Array.isArray(body.portfolio)) user.portfolio = body.portfolio.map(String);
    }
    if (user.role === "club" && typeof body.clubName === "string") {
      user.clubName = body.clubName;
    }

    await user.save();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        portfolio: user.portfolio,
        clubName: user.clubName,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}