const express = require("express");

const Requirement = require("../models/Requirement");
const TestCase = require("../models/TestCase");

const router = express.Router();

/*
  GET /api/coverage?projectId=PROJECT_ID

  Calculates:

  - Total requirements
  - Covered requirements
  - Uncovered requirements
  - Coverage percentage
  - Functional requirements
  - Non-functional requirements
  - Total test cases
  - Priority distribution
  - Requirement-wise coverage

  COVERAGE RULE:

  A requirement is considered COVERED only when:

  1. At least one test case exists
  2. ALL test cases for that requirement have
     status "Passed"

  Otherwise, the requirement is NOT COVERED.
*/

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }

    // Get project requirements
    const requirements = await Requirement.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    // Get project test cases
    const testCases = await TestCase.find({
      projectId,
    }).sort({
      createdAt: 1,
    });

    // =====================================================
    // BASIC REQUIREMENT STATISTICS
    // =====================================================

    const totalRequirements =
      requirements.length;

    const functionalRequirements =
      requirements.filter(
        (requirement) =>
          requirement.type === "Functional"
      ).length;

    const nonFunctionalRequirements =
      requirements.filter(
        (requirement) =>
          requirement.type === "Non-Functional"
      ).length;

    // =====================================================
    // REQUIREMENT-WISE COVERAGE
    // =====================================================

    const requirementCoverage =
      requirements.map((requirement) => {
        // Find all test cases belonging to this requirement
        const relatedTestCases =
          testCases.filter(
            (testCase) =>
              testCase.requirementId ===
              requirement.requirementId
          );

        // Total test cases
        const testCaseCount =
          relatedTestCases.length;

        // Passed test cases
        const passedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Passed"
          ).length;

        // Failed test cases
        const failedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Failed"
          ).length;

        // Not executed test cases
        const notExecutedTestCaseCount =
          relatedTestCases.filter(
            (testCase) =>
              testCase.status === "Not Executed"
          ).length;

        /*
          COVERAGE RULE

          Covered only when:

          - At least one test case exists
          - ALL test cases have Passed status
        */

        const allTestCasesPassed =
          testCaseCount > 0 &&
          passedTestCaseCount === testCaseCount;

        return {
          _id: requirement._id,

          requirementId:
            requirement.requirementId,

          title:
            requirement.title,

          text:
            requirement.text,

          type:
            requirement.type,

          testCaseCount,

          passedTestCaseCount,

          failedTestCaseCount,

          notExecutedTestCaseCount,

          allTestCasesPassed,

          covered:
            allTestCasesPassed,

          coverage:
            allTestCasesPassed
              ? "Covered"
              : "Not Covered",
        };
      });

    // =====================================================
    // COVERED REQUIREMENTS
    // =====================================================

    const coveredRequirements =
      requirementCoverage.filter(
        (requirement) =>
          requirement.allTestCasesPassed === true
      );

    // =====================================================
    // UNCOVERED REQUIREMENTS
    // =====================================================

    const uncoveredRequirements =
      requirementCoverage.filter(
        (requirement) =>
          requirement.allTestCasesPassed !== true
      );

    const coveredCount =
      coveredRequirements.length;

    const uncoveredCount =
      uncoveredRequirements.length;

    // =====================================================
    // COVERAGE PERCENTAGE
    // =====================================================

    const coveragePercentage =
      totalRequirements > 0
        ? Math.round(
            (coveredCount /
              totalRequirements) *
              100
          )
        : 0;

    // =====================================================
    // TEST CASE PRIORITY STATISTICS
    // =====================================================

    const highPriority =
      testCases.filter(
        (testCase) =>
          testCase.priority === "High"
      ).length;

    const mediumPriority =
      testCases.filter(
        (testCase) =>
          testCase.priority === "Medium"
      ).length;

    const lowPriority =
      testCases.filter(
        (testCase) =>
          testCase.priority === "Low"
      ).length;

    // =====================================================
    // RESPONSE
    // =====================================================

    res.status(200).json({
      message:
        "Coverage analysis generated successfully.",

      summary: {
        totalRequirements,

        coveredRequirements:
          coveredCount,

        uncoveredRequirements:
          uncoveredCount,

        coveragePercentage,

        functionalRequirements,

        nonFunctionalRequirements,

        totalTestCases:
          testCases.length,

        highPriority,

        mediumPriority,

        lowPriority,
      },

      /*
        Requirements that are not fully covered.

        Each item contains:
        - requirementId
        - title
        - text
        - testCaseCount
        - passedTestCaseCount
        - failedTestCaseCount
        - notExecutedTestCaseCount
      */
      uncoveredRequirements,

      /*
        Complete requirement-wise coverage data.
      */
      requirementCoverage,
    });

  } catch (error) {
    console.error(
      "Coverage analysis error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate coverage analysis.",
    });
  }
});

module.exports = router;