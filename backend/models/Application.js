import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    portfolioLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A student can apply to the same gig only once
ApplicationSchema.index({ gig: 1, student: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);