import mongoose from "mongoose";

const commandStatsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      index: true,
    },
    totalCommands: {
      type: Number,
      default: 0,
    },
    commandUsage: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("CommandStats", commandStatsSchema);
