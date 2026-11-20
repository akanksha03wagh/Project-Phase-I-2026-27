const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const aiRoutes = require("./routes/aiRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const traceabilityRoutes = require("./routes/traceabilityRoutes");
const coverageRoutes = require("./routes/coverageRoutes");
const duplicateRoutes = require("./routes/duplicateRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

dotenv.config();

connectDB();

const app = express();

// Allow React frontend to communicate with backend
app.use(cors());

// Read JSON request bodies
app.use(express.json());

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "TestGen AI backend is running successfully!",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/test-cases", testCaseRoutes);
app.use("/api/traceability", traceabilityRoutes);
app.use("/api/coverage", coverageRoutes);
app.use("/api/duplicates", duplicateRoutes);
app.use("/api/reports", reportsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TestGen AI backend running on port ${PORT}`);
});