const express = require("express");

const Requirement = require("../models/Requirement");
const TestCase = require("../models/TestCase");

const router = express.Router();


// ==========================================================
// GET PROJECT REPORT
// ==========================================================

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    // ------------------------------------------------------
    // Validate project ID
    // ------------------------------------------------------

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required.",
      });
    }


    // ======================================================
    // FETCH REQUIREMENTS
    // ======================================================

    const requirements = await Requirement.find({
      projectId,
    }).sort({
      createdAt: 1,
    });


    // ======================================================
    // FETCH TEST CASES
    // ======================================================

    const testCases = await TestCase.find({
      projectId,
    }).sort({
      createdAt: 1,
    });


    // ======================================================
    // REQUIREMENT STATISTICS
    // ======================================================

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


    // ======================================================
    // TEST CASE STATISTICS
    // ======================================================

    const totalTestCases =
      testCases.length;


    const passedTestCases =
      testCases.filter(
        (testCase) =>
          testCase.status === "Passed"
      ).length;


    const failedTestCases =
      testCases.filter(
        (testCase) =>
          testCase.status === "Failed"
      ).length;


    const notExecutedTestCases =
      testCases.filter(
        (testCase) =>
          testCase.status === "Not Executed"
      ).length;


    // ======================================================
    // REQUIREMENT COVERAGE
    //
    // A requirement is considered COVERED only when:
    //
    // 1. At least one test case exists
    // 2. ALL associated test cases are Passed
    // ======================================================

    const requirementCoverage =
      requirements.map(
        (requirement) => {

          const relatedTestCases =
            testCases.filter(
              (testCase) =>
                testCase.requirementId ===
                requirement.requirementId
            );


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
                testCase.status ===
                "Not Executed"
            ).length;


          const covered =
            testCaseCount > 0 &&
            passedTestCaseCount ===
              testCaseCount;


          return {
            requirementId:
              requirement.requirementId,

            title:
              requirement.title,

            type:
              requirement.type,

            testCaseCount,

            passedTestCaseCount,

            failedTestCaseCount,

            notExecutedTestCaseCount,

            covered,
          };
        }
      );


    // ======================================================
    // COVERAGE SUMMARY
    // ======================================================

    const coveredRequirements =
      requirementCoverage.filter(
        (requirement) =>
          requirement.covered
      ).length;


    const uncoveredRequirements =
      requirementCoverage.filter(
        (requirement) =>
          !requirement.covered
      ).length;


    const coveragePercentage =
      totalRequirements > 0
        ? Math.round(
            (coveredRequirements /
              totalRequirements) *
              100
          )
        : 0;


    // ======================================================
    // TEST CASE STATUS PERCENTAGES
    // ======================================================

    const testCaseExecutionPercentage =
      totalTestCases > 0
        ? Math.round(
            ((passedTestCases +
              failedTestCases) /
              totalTestCases) *
              100
          )
        : 0;


    const passPercentage =
      totalTestCases > 0
        ? Math.round(
            (passedTestCases /
              totalTestCases) *
              100
          )
        : 0;


    // ======================================================
    // REQUIREMENT TYPE DISTRIBUTION
    // ======================================================

    const requirementTypeDistribution = [
      {
        name: "Functional",
        value: functionalRequirements,
      },
      {
        name: "Non-Functional",
        value: nonFunctionalRequirements,
      },
    ];


    // ======================================================
    // TEST CASE STATUS DISTRIBUTION
    // ======================================================

    const testCaseStatusDistribution = [
      {
        name: "Passed",
        value: passedTestCases,
      },
      {
        name: "Failed",
        value: failedTestCases,
      },
      {
        name: "Not Executed",
        value: notExecutedTestCases,
      },
    ];


    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(200).json({

      message:
        "Project report generated successfully.",


      projectId,


      summary: {

        totalRequirements,

        functionalRequirements,

        nonFunctionalRequirements,

        totalTestCases,

        passedTestCases,

        failedTestCases,

        notExecutedTestCases,

      },


      coverage: {

        coveredRequirements,

        uncoveredRequirements,

        coveragePercentage,

      },


      execution: {

        testCaseExecutionPercentage,

        passPercentage,

      },


      requirementTypeDistribution,


      testCaseStatusDistribution,


      requirementCoverage,

    });

  } catch (error) {

    console.error(
      "Reports error:",
      error
    );


    res.status(500).json({

      message:
        "Failed to generate project report.",

      error:
        error.message,

    });
  }
});


module.exports = router;