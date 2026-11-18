import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken, cookieOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Optional: which "door" the person used (student or club)
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `This is a ${user.role} account. Please use the ${user.role} login.` },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set("token", signToken(user), cookieOptions);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}