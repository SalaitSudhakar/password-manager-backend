import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    siteName: {
      type: String,
      required: true,
    },
    siteUrl: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    notes: {
      type: String,
    },
    category: {
      type: String,
      enum: ['personal', 'social', 'banking', 'work', 'entertainment', 'shopping', 'others'],
      default: 'others'
    },
    tags: {
      type: [String],
    }
  },
  { timestamps: true }
);

// Create a compound index on userId and siteUrl to ensure one password per site per user
passwordSchema.index({ userId: 1, siteUrl: 1 }, { unique: true });

const Password = mongoose.model("Password", passwordSchema);

export default Password;
