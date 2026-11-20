const express = require("express");
const TestCase = require("../models/TestCase");

const router = express.Router();


// ==========================================
// Get test cases for a project
// ==========================================

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    const testCases = await TestCase.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      testCases,
    });

  } catch (error) {

    console.error(
      "Get test cases error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch test cases.",
    });
  }
});


// ==========================================
// Create a test case manually
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      requirementId,
      projectId,
      title,
      scenario,
      preconditions,
      steps,
      expectedResult,
      priority,
      status,
      source,
    } = req.body;

    // Validate required fields
    if (
      !requirementId ||
      !projectId ||
      !title ||
      !scenario ||
      !expectedResult
    ) {
      return res.status(400).json({
        message:
          "Requirement ID, project ID, title, scenario and expected result are required.",
      });
    }

    // Count existing test cases for this requirement
    const existingCount = await TestCase.countDocuments({
      projectId,
      requirementId,
    });

    // Automatically generate Test Case ID
    const testCaseId = `${requirementId}-TC-${String(
      existingCount + 1
    ).padStart(3, "0")}`;

    const newTestCase = await TestCase.create({
      testCaseId,
      requirementId,
      projectId,
      title,
      scenario,
      preconditions: preconditions || "",
      steps: steps || [],
      expectedResult,
      priority: priority || "Medium",
      status: status || "Not Executed",
      source: source || "Manual",
    });

    res.status(201).json({
      message: "Test case created successfully.",
      testCase: newTestCase,
    });
  } catch (error) {
    console.error("Create test case error:", error);

    res.status(500).json({
      message: "Failed to create test case.",
    });
  }
});

//===================
// Update a test case
//=====================
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      scenario,
      preconditions,
      steps,
      expectedResult,
      priority,
      status,
    } = req.body;

    const updatedTestCase = await TestCase.findByIdAndUpdate(
      req.params.id,
      {
        title,
        scenario,
        preconditions,
        steps,
        expectedResult,
        priority,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTestCase) {
      return res.status(404).json({
        message: "Test case not found.",
      });
    }

    res.status(200).json({
      message: "Test case updated successfully.",
      testCase: updatedTestCase,
    });
  } catch (error) {
    console.error("Update test case error:", error);

    res.status(500).json({
      message: "Failed to update test case.",
    });
  }
});

// ==========================================
// Delete test case
// ==========================================

router.delete("/:id", async (req, res) => {
  try {

    const testCase = await TestCase.findByIdAndDelete(
      req.params.id
    );

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found.",
      });
    }

    res.status(200).json({
      message: "Test case deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete test case error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete test case.",
    });
  }
});


module.exports = router;