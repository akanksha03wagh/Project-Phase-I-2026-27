const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    testCaseId: {
      type: String,
      required: true,
    },

    requirementId: {
      type: String,
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    scenario: {
      type: String,
      required: true,
      trim: true,
    },

    preconditions: {
      type: String,
      default: "",
      trim: true,
    },

    steps: {
      type: [String],
      default: [],
    },

    expectedResult: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Not Executed", "Passed", "Failed", "Blocked"],
      default: "Not Executed",
    },

    source: {
      type: String,
      enum: ["AI Generated", "Manual"],
      default: "AI Generated",
    },
  },
  {
    timestamps: true,
  }
);

const TestCase = mongoose.model("TestCase", testCaseSchema);

module.exports = TestCase;