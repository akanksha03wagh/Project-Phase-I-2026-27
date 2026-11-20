const express = require("express");
const Requirement = require("../models/Requirement");

const router = express.Router();

// Get requirements for a project
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    const requirements = await Requirement.find({
      projectId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      requirements,
    });
  } catch (error) {
    console.error(
      "Get requirements error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch requirements.",
    });
  }
});


// Save analyzed requirements
router.post("/save", async (req, res) => {
  try {
    const {
      projectId,
      sourceFile,
      requirements,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    if (
      !requirements ||
      !Array.isArray(requirements)
    ) {
      return res.status(400).json({
        message: "Requirements data is required.",
      });
    }

    // Remove old requirements for this project
    await Requirement.deleteMany({
      projectId,
    });

    // Prepare requirements for MongoDB
    const requirementDocuments =
      requirements.map((requirement) => ({
        requirementId: requirement.id,
        text: requirement.text,
        type: requirement.type,
        projectId,
        sourceFile: sourceFile || "",
      }));

    const savedRequirements =
      await Requirement.insertMany(
        requirementDocuments
      );

    res.status(201).json({
      message:
        "Requirements saved successfully.",
      totalRequirements:
        savedRequirements.length,
      requirements: savedRequirements,
    });
  } catch (error) {
    console.error(
      "Save requirements error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to save requirements.",
    });
  }
});

module.exports = router;