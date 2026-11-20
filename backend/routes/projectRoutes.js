const express = require("express");
const Project = require("../models/Project");

const router = express.Router();

// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;

    // Validate project name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required.",
      });
    }

    // Validate user
    if (!createdBy) {
      return res.status(400).json({
        message: "User information is required.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || "",
      status: "Draft",
      requirements: 0,
      testCases: 0,
      coverage: 0,
      createdBy,
    });

    res.status(201).json({
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Failed to create project.",
      error: error.message,
    });
  }
});

// Get projects for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const projects = await Project.find({
      createdBy: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Failed to fetch projects.",
      error: error.message,
    });
  }
});

module.exports = router;