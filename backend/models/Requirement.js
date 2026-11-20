const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    requirementId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Functional", "Non-Functional"],
      default: "Functional",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    sourceFile: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Requirement = mongoose.model(
  "Requirement",
  requirementSchema
);

module.exports = Requirement;