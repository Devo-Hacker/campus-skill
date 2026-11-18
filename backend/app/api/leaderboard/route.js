import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getTopTalent } from "@/lib/talent";

export async function GET() {
  try {
    await connectDB();
    const talent = await getTopTalent(20);
    return NextResponse.json({ talent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}