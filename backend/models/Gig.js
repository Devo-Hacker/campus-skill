import mongoose from "mongoose";

const GigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["design", "video", "photography", "coding", "writing", "social-media", "other"],
      required: true,
    },
    skillsRequired: [String],
    budgetType: { type: String, enum: ["paid", "unpaid", "certificate"], default: "unpaid" },
    budgetAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["open", "in-progress", "completed"], default: "open" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hiredStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Gig || mongoose.model("Gig", GigSchema);