const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Store uploaded files inside backend/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Allow only PDF, DOCX and TXT
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".pdf",
    ".docx",
    ".txt",
  ];

  const extension = path.extname(
    file.originalname
  ).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOCX and TXT files are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Upload SRS document
router.post("/srs", upload.single("srsFile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an SRS file.",
      });
    }

    res.status(201).json({
      message: "SRS uploaded successfully.",
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("SRS upload error:", error);

    res.status(500).json({
      message: "Failed to upload SRS file.",
    });
  }
});

module.exports = router;