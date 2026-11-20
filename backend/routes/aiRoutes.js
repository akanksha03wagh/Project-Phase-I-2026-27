const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const Requirement = require("../models/Requirement");
const TestCase = require("../models/TestCase");

const router = express.Router();

// ======================================================
// Multer configuration
// ======================================================

const upload = multer({
  dest: "temp/",
});

// ======================================================
// ANALYZE SRS AND SAVE REQUIREMENTS
// ======================================================

router.post(
  "/analyze-srs",
  upload.single("srsFile"),
  async (req, res) => {
    let uploadedFilePath = null;

    try {
      // --------------------------------------------------
      // 1. Get project ID from React
      // --------------------------------------------------

      const { projectId } = req.body;

      console.log("==========================================");
      console.log("SRS ANALYSIS REQUEST");
      console.log("Project ID:", projectId);
      console.log("File:", req.file?.originalname);
      console.log("==========================================");

      // --------------------------------------------------
      // 2. Validate project ID
      // --------------------------------------------------

      if (!projectId) {
        return res.status(400).json({
          message:
            "Project ID is required. Please select a project first.",
        });
      }

      // --------------------------------------------------
      // 3. Validate uploaded file
      // --------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          message:
            "SRS file is required. Please upload a PDF, DOCX or TXT file.",
        });
      }

      uploadedFilePath = req.file.path;

      // --------------------------------------------------
      // 4. Validate file extension
      // --------------------------------------------------

      const allowedExtensions = [".pdf", ".docx", ".txt"];

      const extension = require("path")
        .extname(req.file.originalname)
        .toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        return res.status(400).json({
          message:
            "Only PDF, DOCX and TXT files are supported.",
        });
      }

      // --------------------------------------------------
      // 5. Read uploaded file
      // --------------------------------------------------

      const fileBuffer = fs.readFileSync(
        uploadedFilePath
      );

      // --------------------------------------------------
      // 6. Prepare multipart form for Python AI service
      // --------------------------------------------------

      const formData = new FormData();

      formData.append(
        "file",
        fileBuffer,
        {
          filename: req.file.originalname,
          contentType:
            req.file.mimetype ||
            "application/octet-stream",
        }
      );

      // --------------------------------------------------
      // 7. Send SRS file to Python AI service
      // --------------------------------------------------

      console.log(
        "Sending SRS file to Python AI service..."
      );

      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/api/extraction/analyze",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000,
        }
      );

      // --------------------------------------------------
      // 8. Get analyzed requirements
      // --------------------------------------------------

      const analyzedRequirements =
        aiResponse.data.requirements || [];

      console.log(
        "Requirements received from Python:",
        analyzedRequirements.length
      );

      // --------------------------------------------------
      // 9. Check whether requirements were generated
      // --------------------------------------------------

      if (analyzedRequirements.length === 0) {
        return res.status(400).json({
          message:
            "No requirements could be identified from the SRS file.",
        });
      }

      // --------------------------------------------------
      // 10. Remove old requirements for THIS project
      // --------------------------------------------------
      // IMPORTANT:
      // We only remove requirements belonging to the
      // selected project.
      //
      // Requirements of other projects are NOT touched.
      // --------------------------------------------------

      const deletedRequirements =
        await Requirement.deleteMany({
          projectId: projectId,
        });

      console.log(
        "Old requirements removed from selected project:",
        deletedRequirements.deletedCount
      );

      // --------------------------------------------------
      // 11. Prepare requirements for MongoDB
      // --------------------------------------------------

      const requirementDocuments =
        analyzedRequirements.map(
          (requirement, index) => {

            return {
              requirementId:
                requirement.requirementId ||
                `FR-${String(index + 1).padStart(
                  3,
                  "0"
                )}`,

              title:
                requirement.title ||
                "Untitled Requirement",

              text:
                requirement.text ||
                requirement.description ||
                "",

              type:
                requirement.type ===
                "Non-Functional"
                  ? "Non-Functional"
                  : "Functional",

              projectId: projectId,

              sourceFile:
                req.file.originalname,
            };
          }
        );

      // --------------------------------------------------
      // 12. Validate requirements
      // --------------------------------------------------

      const invalidRequirement =
        requirementDocuments.find(
          (requirement) =>
            !requirement.requirementId ||
            !requirement.title ||
            !requirement.text ||
            !requirement.projectId
        );

      if (invalidRequirement) {
        console.error(
          "Invalid requirement received:",
          invalidRequirement
        );

        return res.status(400).json({
          message:
            "AI generated an incomplete requirement.",
        });
      }

      // --------------------------------------------------
      // 13. Save requirements
      // --------------------------------------------------

      const savedRequirements =
        await Requirement.insertMany(
          requirementDocuments
        );

      console.log(
        "Requirements saved successfully:",
        savedRequirements.length
      );

      // --------------------------------------------------
      // 14. Update project requirement count
      // --------------------------------------------------

      const Project = require("../models/Project");

      await Project.findByIdAndUpdate(
        projectId,
        {
          requirements:
            savedRequirements.length,
        }
      );

      // --------------------------------------------------
      // 15. Send response to React
      // --------------------------------------------------

      res.status(200).json({
        message:
          "SRS analyzed and requirements saved successfully.",

        projectId,

        filename:
          req.file.originalname,

        totalRequirements:
          savedRequirements.length,

        requirements:
          savedRequirements,
      });

    } catch (error) {

      console.error(
        "=========================================="
      );

      console.error(
        "SRS ANALYSIS ERROR"
      );

      console.error(
        error.response?.data ||
        error.message
      );

      console.error(
        "=========================================="
      );

      // --------------------------------------------------
      // Send useful error message to React
      // --------------------------------------------------

      res.status(500).json({
        message:
          "Failed to analyze SRS file.",

        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message,
      });

    } finally {

      // --------------------------------------------------
      // Delete temporary uploaded file
      // --------------------------------------------------

      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        try {
          fs.unlinkSync(
            uploadedFilePath
          );
        } catch (deleteError) {
          console.error(
            "Could not delete temporary file:",
            deleteError.message
          );
        }
      }
    }
  }
);


// ======================================================
// GENERATE ADDITIONAL TEST CASES USING PYTHON AI
// Existing test cases will NOT be deleted
// ======================================================

router.post(
  "/generate-test-cases",
  async (req, res) => {
    try {

      const {
        requirementId,
        requirementText,
        projectId,
      } = req.body;

      // ------------------------------------------
      // 1. Validate input
      // ------------------------------------------

      if (
        !requirementId ||
        !requirementText ||
        !projectId
      ) {
        return res.status(400).json({
          message:
            "Requirement ID, requirement text and project ID are required.",
        });
      }

      console.log(
        "Generating additional test cases for:",
        requirementId
      );

      // ------------------------------------------
      // 2. Get ALL existing test cases
      //    for this requirement
      // ------------------------------------------

      const existingTestCases =
        await TestCase.find({
          projectId,
          requirementId,
        }).sort({
          createdAt: 1,
        });

      console.log(
        "Existing test cases:",
        existingTestCases.length
      );

      // ------------------------------------------
      // 3. Prepare existing cases for AI
      // ------------------------------------------

      const existingCasesForAI =
        existingTestCases.map((testCase) => ({
          testCaseId:
            testCase.testCaseId,

          title:
            testCase.title,

          scenario:
            testCase.scenario,

          preconditions:
            testCase.preconditions,

          steps:
            testCase.steps,

          expectedResult:
            testCase.expectedResult,

          priority:
            testCase.priority,

          source:
            testCase.source,
        }));

      // ------------------------------------------
      // 4. Send requirement + existing cases
      //    to Python AI service
      // ------------------------------------------

      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/api/test-cases/generate",
        {
          requirementId,
          requirementText,
          existingTestCases:
            existingCasesForAI,
        }
      );

      const generatedTestCases =
        aiResponse.data.testCases || [];

      console.log(
        "Additional test cases received from Python:",
        generatedTestCases.length
      );

      // ------------------------------------------
      // 5. Check whether AI generated anything
      // ------------------------------------------

      if (generatedTestCases.length === 0) {
        return res.status(400).json({
          message:
            "AI could not generate any additional unique test cases for this requirement.",
        });
      }

      // ------------------------------------------
      // 6. Find next available test case number
      // ------------------------------------------

      let nextNumber = 1;

      existingTestCases.forEach(
        (testCase) => {

          const match =
            testCase.testCaseId?.match(
              /-TC-(\d+)$/
            );

          if (match) {

            const number =
              parseInt(
                match[1],
                10
              );

            if (
              number >= nextNumber
            ) {
              nextNumber =
                number + 1;
            }
          }
        }
      );

      // ------------------------------------------
      // 7. Prepare NEW test cases
      // ------------------------------------------

      const testCaseDocuments =
        generatedTestCases.map(
          (testCase) => {

            const generatedId =
              `${requirementId}-TC-${String(
                nextNumber
              ).padStart(3, "0")}`;

            nextNumber++;

            return {

              testCaseId:
                generatedId,

              requirementId:
                requirementId,

              projectId:
                projectId,

              title:
                testCase.title ||
                "AI Generated Test Case",

              scenario:
                testCase.scenario ||
                "",

              preconditions:
                testCase.preconditions ||
                "",

              steps:
                Array.isArray(
                  testCase.steps
                )
                  ? testCase.steps
                  : [],

              expectedResult:
                testCase.expectedResult ||
                "",

              priority:
                [
                  "High",
                  "Medium",
                  "Low",
                ].includes(
                  testCase.priority
                )
                  ? testCase.priority
                  : "Medium",

              status:
                "Not Executed",

              source:
                "AI Generated",
            };
          }
        );

      // ------------------------------------------
      // 8. Validate generated test cases
      // ------------------------------------------

      const invalidTestCase =
        testCaseDocuments.find(
          (testCase) =>
            !testCase.testCaseId ||
            !testCase.requirementId ||
            !testCase.projectId ||
            !testCase.title ||
            !testCase.scenario ||
            !testCase.expectedResult
        );

      if (invalidTestCase) {

        console.error(
          "Invalid generated test case:",
          invalidTestCase
        );

        return res.status(400).json({
          message:
            "AI generated an incomplete test case.",
        });
      }

      // ------------------------------------------
      // 9. Save NEW test cases
      //    Existing cases remain untouched
      // ------------------------------------------

      const savedTestCases =
        await TestCase.insertMany(
          testCaseDocuments
        );

      console.log(
        "Additional test cases saved successfully:",
        savedTestCases.length
      );

      // ------------------------------------------
      // 10. Send response to React
      // ------------------------------------------

      res.status(201).json({

        message:
          "Additional test cases generated and saved successfully.",

        requirementId,

        projectId,

        existingTestCases:
          existingTestCases.length,

        newTestCases:
          savedTestCases.length,

        totalTestCases:
          existingTestCases.length +
          savedTestCases.length,

        testCases:
          savedTestCases,
      });

    } catch (error) {

      console.error(
        "Test case generation error:"
      );

      console.error(
        error.response?.data ||
        error.message
      );

      res.status(500).json({

        message:
          "Failed to generate additional test cases.",

        error:
          error.response?.data ||
          error.message,
      });
    }
  }
);


module.exports = router;