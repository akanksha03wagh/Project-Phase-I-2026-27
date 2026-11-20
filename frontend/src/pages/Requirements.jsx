import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaClipboardList,
  FaUpload,
  FaFileAlt,
  FaRobot,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";

const Requirements = () => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadSuccess, setUploadSuccess] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  const [requirements, setRequirements] =
    useState([]);

  const [projectId, setProjectId] =
    useState("");

  const [projectName, setProjectName] =
    useState("");

  const [loadingRequirements, setLoadingRequirements] =
    useState(true);

  // =========================================
  // GET SELECTED PROJECT
  // =========================================

  const getSelectedProject = () => {
    try {
      const storedProject =
        localStorage.getItem(
          "selectedProject"
        );

      const storedProjectId =
        localStorage.getItem(
          "selectedProjectId"
        );

      let project = null;

      if (storedProject) {
        project = JSON.parse(
          storedProject
        );
      }

      const id =
        storedProjectId ||
        project?.id ||
        project?._id ||
        "";

      const name =
        project?.name ||
        "Selected Project";

      return {
        id,
        name,
      };
    } catch (error) {
      console.error(
        "Failed to get selected project:",
        error
      );

      return {
        id: "",
        name: "",
      };
    }
  };

  // =========================================
  // LOAD REQUIREMENTS
  // =========================================

  const loadRequirements = async () => {
    try {
      setLoadingRequirements(true);
      setUploadError("");

      const selectedProject =
        getSelectedProject();

      if (!selectedProject.id) {
        setProjectId("");
        setProjectName("");

        setRequirements([]);

        setUploadError(
          "Please select a project first from the Projects page."
        );

        setLoadingRequirements(false);
        return;
      }

      setProjectId(
        selectedProject.id
      );

      setProjectName(
        selectedProject.name
      );

      const response =
        await API.get(
          `/requirements?projectId=${selectedProject.id}`
        );

      setRequirements(
        response.data.requirements ||
          []
      );

    } catch (error) {
      console.error(
        "Failed to load requirements:",
        error
      );

      setUploadError(
        error.response?.data?.message ||
          "Failed to load requirements."
      );
    } finally {
      setLoadingRequirements(false);
    }
  };

  // =========================================
  // LOAD DATA WHEN PAGE OPENS
  // =========================================

  useEffect(() => {
    loadRequirements();
  }, []);

  // =========================================
  // CHOOSE FILE
  // =========================================

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // =========================================
  // FILE VALIDATION
  // =========================================

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files[0];

    setUploadSuccess("");
    setUploadError("");

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
    ];

    const fileName =
      file.name.toLowerCase();

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(
            extension
          )
      );

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !hasValidExtension
    ) {
      setUploadError(
        "Invalid file type. Please select a PDF, DOCX or TXT file."
      );

      setSelectedFile(null);

      event.target.value = "";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setUploadError(
        "File size must be less than 10 MB."
      );

      setSelectedFile(null);

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
  };

  // =========================================
  // UPLOAD / ANALYZE SRS
  // =========================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError(
        "Please select an SRS file first."
      );

      return;
    }

    if (!projectId) {
      setUploadError(
        "Please select a project first from the Projects page."
      );

      return;
    }

    setUploading(true);
    setUploadSuccess("");
    setUploadError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "srsFile",
        selectedFile
      );

      /*
        IMPORTANT:
        Send the selected project ID
        along with the SRS file.
      */

      formData.append(
        "projectId",
        projectId
      );

      const response = await API.post(
  "/ai/analyze-srs",
  formData
);

      console.log(
        "AI analysis response:",
        response.data
      );

      const analyzedRequirements =
        response.data.requirements ||
        [];

      /*
        Instead of only showing the
        returned requirements, reload
        them from the selected project.
      */

      await loadRequirements();

      setUploadSuccess(
        `SRS analyzed successfully! ${analyzedRequirements.length} requirements found.`
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

    } catch (error) {
      console.error(
        "SRS analysis error:",
        error
      );

      setUploadError(
        error.response?.data?.message ||
          "Failed to analyze SRS file. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // REMOVE FILE
  // =========================================

  const handleRemoveFile = () => {
    setSelectedFile(null);

    setUploadSuccess("");
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // =========================================
  // SUMMARY COUNTS
  // =========================================

  const totalRequirements =
    requirements.length;

  const functionalRequirements =
    requirements.filter(
      (requirement) =>
        requirement.type ===
        "Functional"
    ).length;

  const nonFunctionalRequirements =
    requirements.filter(
      (requirement) =>
        requirement.type ===
        "Non-Functional"
    ).length;

  // =========================================
  // PAGE UI
  // =========================================

  return (
    <div className="requirements-page">

      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div className="requirements-header">

        <div>

          <h1>
            Requirements
          </h1>

          <p>
            Upload and analyze software
            requirements using
            AI-powered NLP.
          </p>

          {projectId && (
            <div className="selected-project-info">
              <strong>
                Project:
              </strong>{" "}
              {projectName}
            </div>
          )}

        </div>

        <button
          className="upload-requirement-btn"
          onClick={
            handleChooseFile
          }
          disabled={
            !projectId ||
            uploading
          }
        >
          <FaUpload />

          Upload SRS

        </button>

      </div>

      {/* =================================== */}
      {/* HIDDEN FILE INPUT */}
      {/* =================================== */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{
          display: "none",
        }}
        onChange={
          handleFileChange
        }
      />

      {/* =================================== */}
      {/* SUMMARY CARDS */}
      {/* =================================== */}

      <div className="requirements-summary">

        {/* TOTAL */}

        <div className="requirement-summary-card">

          <div className="requirement-summary-icon blue">
            <FaClipboardList />
          </div>

          <div>

            <span>
              Total Requirements
            </span>

            <strong>
              {totalRequirements}
            </strong>

          </div>

        </div>

        {/* FUNCTIONAL */}

        <div className="requirement-summary-card">

          <div className="requirement-summary-icon green">
            <FaFileAlt />
          </div>

          <div>

            <span>
              Functional
            </span>

            <strong>
              {functionalRequirements}
            </strong>

          </div>

        </div>

        {/* AI ANALYZED */}

        <div className="requirement-summary-card">

          <div className="requirement-summary-icon purple">
            <FaRobot />
          </div>

          <div>

            <span>
              AI Analyzed
            </span>

            <strong>
              {totalRequirements}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================== */}
      {/* UPLOAD CARD */}
      {/* =================================== */}

      <div className="requirements-upload-card">

        <div className="requirements-upload-icon">
          <FaUpload />
        </div>

        <h2>
          Upload Software Requirements
        </h2>

        <p>
          Upload your SRS document and
          let TestGen AI extract and
          analyze the requirements
          automatically.
        </p>

        <button
          className="requirements-upload-main-btn"
          onClick={
            handleChooseFile
          }
          disabled={!projectId}
        >
          <FaUpload />

          Choose SRS Document

        </button>

        <span>
          Supported formats: PDF, DOCX, TXT
        </span>

      </div>

      {/* =================================== */}
      {/* SELECTED FILE */}
      {/* =================================== */}

      {selectedFile && (

        <div className="selected-srs-file">

          <div className="selected-srs-file-info">

            <div className="selected-srs-file-icon">
              <FaFileAlt />
            </div>

            <div>

              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </span>

            </div>

          </div>

          <button
            className="remove-srs-file-btn"
            onClick={
              handleRemoveFile
            }
            title="Remove file"
          >
            <FaTimes />
          </button>

        </div>

      )}

      {/* =================================== */}
      {/* ANALYZE BUTTON */}
      {/* =================================== */}

      {selectedFile && (

        <div className="srs-upload-action">

          <button
            className="srs-upload-submit-btn"
            onClick={
              handleUpload
            }
            disabled={
              uploading ||
              !projectId
            }
          >

            <FaUpload />

            {uploading
              ? "Analyzing SRS..."
              : "Analyze SRS File"}

          </button>

        </div>

      )}

      {/* =================================== */}
      {/* SUCCESS MESSAGE */}
      {/* =================================== */}

      {uploadSuccess && (

        <div className="srs-upload-success">

          <FaCheckCircle />

          <span>
            {uploadSuccess}
          </span>

        </div>

      )}

      {/* =================================== */}
      {/* ERROR MESSAGE */}
      {/* =================================== */}

      {uploadError && (

        <div className="srs-upload-error">

          <FaTimes />

          <span>
            {uploadError}
          </span>

        </div>

      )}

      {/* =================================== */}
      {/* EXTRACTED REQUIREMENTS */}
      {/* =================================== */}

      <div className="requirements-section">

        <div className="requirements-section-header">

          <div>

            <h2>
              Extracted Requirements
            </h2>

            <p>
              Requirements extracted from
              your uploaded software
              specification.
            </p>

          </div>

        </div>

        {loadingRequirements ? (

          <div className="requirements-empty">

            <FaClipboardList />

            <h3>
              Loading requirements...
            </h3>

            <p>
              Please wait while the
              requirements are being loaded.
            </p>

          </div>

        ) : requirements.length === 0 ? (

          <div className="requirements-empty">

            <FaClipboardList />

            <h3>
              No requirements available
            </h3>

            <p>
              Upload an SRS document to
              extract software
              requirements.
            </p>

          </div>

        ) : (

          <div className="requirements-list">

            {requirements.map(
              (requirement) => (

                <div
                  className="requirement-item"
                  key={
                    requirement._id ||
                    requirement.requirementId
                  }
                >

                  <div className="requirement-item-top">

                    <span className="requirement-id">

                      {requirement.requirementId ||
                        requirement.id}

                    </span>

                    <span
                      className={`requirement-type ${
                        requirement.type ===
                        "Functional"
                          ? "functional"
                          : "non-functional"
                      }`}
                    >

                      {requirement.type}

                    </span>

                  </div>

                  <h4 className="requirement-title">

                    {requirement.title ||
                      "Requirement"}

                  </h4>

                  <p>
                    {requirement.text}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default Requirements;