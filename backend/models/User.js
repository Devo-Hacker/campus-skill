import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "club"], required: true },

    // student fields
    skills: [String],
    bio: { type: String, default: "" },
    portfolio: [String],

    // club fields
    clubName: { type: String, default: "" },
  },
  { timestamps: true }
);

// The "|| " part prevents re-compiling the model on hot reload
export default mongoose.models.User || mongoose.model("User", UserSchema);