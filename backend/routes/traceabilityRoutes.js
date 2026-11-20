const express = require("express");

const Requirement = require("../models/Requirement");
const TestCase = require("../models/TestCase");

const router = express.Router();

/*
  GET /api/traceability?projectId=PROJECT_ID

  Returns:

  Requirement
       ↓
  Related Test Cases
       ↓
  Test Case Execution Status
       ↓
  Coverage Status

  Coverage Rule:

  A requirement is considered COVERED only when:
  1. It has at least one test case
  2. ALL related test cases have status "Passed"

  Otherwise, it is NOT COVERED.
*/

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    // Get all requirements for the project
    const requirements = await Requirement.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    // Get all test cases for the project
    const testCases = await TestCase.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    // Create traceability mapping
    const traceability = requirements.map(
      (requirement) => {
        // Find test cases belonging to this requirement
        const relatedTestCases =
          testCases.filter(
            (testCase) =>
              testCase.requirementId ===
              requirement.requirementId
          );

        // Count test case statuses
        const testCaseCount =
          relatedTestCases.length;

        const passedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Passed"
          ).length;

        const failedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Failed"
          ).length;

        const notExecutedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Not Executed"
          ).length;

        /*
          Requirement is covered ONLY when:

          - At least one test case exists
          - Every test case has Passed status
        */
        const allTestCasesPassed =
          testCaseCount > 0 &&
          passedTestCaseCount === testCaseCount;

        return {
          requirementId:
            requirement.requirementId,

          title:
            requirement.title,

          text:
            requirement.text,

          type:
            requirement.type,

          testCases:
            relatedTestCases,

          testCaseCount,

          passedTestCaseCount,

          failedTestCaseCount,

          notExecutedTestCaseCount,

          allTestCasesPassed,

          coverage:
            allTestCasesPassed
              ? "Covered"
              : "Not Covered",
        };
      }
    );

    // Overall statistics
    const totalRequirements =
      traceability.length;

    /*
      A requirement counts as covered
      ONLY when ALL of its test cases passed.
    */
    const coveredRequirements =
      traceability.filter(
        (item) =>
          item.allTestCasesPassed
      ).length;

    const uncoveredRequirements =
      traceability.filter(
        (item) =>
          !item.allTestCasesPassed
      ).length;

    const coveragePercentage =
      totalRequirements > 0
        ? Math.round(
            (coveredRequirements /
              totalRequirements) *
              100
          )
        : 0;

    res.status(200).json({
      message:
        "Traceability data fetched successfully.",

      statistics: {
        totalRequirements,

        coveredRequirements,

        uncoveredRequirements,

        coveragePercentage,
      },

      traceability,
    });
  } catch (error) {
    console.error(
      "Traceability error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch traceability data.",
    });
  }
});

module.exports = router;