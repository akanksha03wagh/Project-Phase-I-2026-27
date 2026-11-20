const express = require("express");
const axios = require("axios");

const Requirement = require("../models/Requirement");
const TestCase = require("../models/TestCase");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    // Get requirements from MongoDB
    const requirements = await Requirement.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    if (requirements.length < 2) {
      return res.status(200).json({
        message:
          "At least two requirements are required for duplicate detection.",
        totalRequirements: requirements.length,
        totalDuplicates: 0,
        duplicates: [],
      });
    }

    // Prepare requirements for Python AI service
    const requirementData = requirements.map(
      (requirement) => ({
        requirementId:
          requirement.requirementId,

        title:
          requirement.title,

        text:
          requirement.text,
      })
    );

    console.log(
      "Sending requirements to Python:",
      requirementData.length
    );

    // Send requirements to Python AI service
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/api/duplicates/requirements",
      {
        requirements: requirementData,

        // 75% similarity threshold
        threshold: 0.75,
      }
    );

    const duplicateData =
      aiResponse.data;

    console.log(
      "Duplicate requirements found:",
      duplicateData.totalDuplicates
    );

    res.status(200).json({
      message:
        "Duplicate requirement detection completed.",

      projectId,

      totalRequirements:
        duplicateData.totalRequirements,

      totalDuplicates:
        duplicateData.totalDuplicates,

      threshold:
        duplicateData.threshold,

      duplicates:
        duplicateData.duplicates,
    });

  } catch (error) {
    console.error(
      "Duplicate detection error:",
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      message:
        "Failed to detect duplicate requirements.",

      error:
        error.response?.data ||
        error.message,
    });
  }
});

// ==========================================================
// TEST CASE DUPLICATE DETECTION
// ==========================================================

router.get("/test-cases", async (req, res) => {
  try {
    const { projectId } = req.query;

    // ------------------------------------------
    // Validate project ID
    // ------------------------------------------

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    // ------------------------------------------
    // Get test cases for the selected project
    // ------------------------------------------

    const testCases = await TestCase.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    console.log(
      "Test cases found for duplicate detection:",
      testCases.length
    );

    // ------------------------------------------
    // At least two test cases are required
    // ------------------------------------------

    if (testCases.length < 2) {
      return res.status(200).json({
        message:
          "At least two test cases are required for duplicate detection.",

        totalTestCases: testCases.length,

        totalDuplicates: 0,

        threshold: 0.75,

        duplicates: [],
      });
    }

    // ------------------------------------------
    // Prepare test cases for Python AI service
    // ------------------------------------------

    const testCaseData = testCases.map((testCase) => ({
      testCaseId: testCase.testCaseId,

      requirementId: testCase.requirementId,

      title: testCase.title,

      scenario: testCase.scenario || "",

      expectedResult: testCase.expectedResult || "",

      priority: testCase.priority || "",

      status: testCase.status || "",
    }));

    console.log(
      "Sending test cases to Python:",
      testCaseData.length
    );

    // ------------------------------------------
    // Send test cases to Python AI service
    // ------------------------------------------

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/api/duplicates/test-cases",
      {
        testCases: testCaseData,

        // 75% similarity threshold
        threshold: 0.75,
      }
    );

    const duplicateData = aiResponse.data;

    console.log(
      "Duplicate test cases found:",
      duplicateData.totalDuplicates
    );

    // ------------------------------------------
    // Send AI result to frontend
    // ------------------------------------------

    res.status(200).json({
      message:
        "Duplicate test case detection completed.",

      projectId,

      totalTestCases:
        duplicateData.totalTestCases,

      totalDuplicates:
        duplicateData.totalDuplicates,

      threshold:
        duplicateData.threshold,

      duplicates:
        duplicateData.duplicates,
    });
  } catch (error) {
    console.error(
      "Test case duplicate detection error:",
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      message:
        "Failed to detect duplicate test cases.",

      error:
        error.response?.data ||
        error.message,
    });
  }
});

module.exports = router;