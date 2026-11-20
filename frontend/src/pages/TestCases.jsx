import { useEffect, useState } from "react";
import API from "../services/api";

function TestCases() {
  const [testCases, setTestCases] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateConfirmModal, setShowGenerateConfirmModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // EDIT TEST CASE STATES
  // ==========================================

  const [editingTestCase, setEditingTestCase] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    scenario: "",
    preconditions: "",
    steps: [],
    expectedResult: "",
    priority: "Medium",
    status: "Not Executed",
  });

  // ==========================================
  // CREATE MANUAL TEST CASE STATES
  // ==========================================

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    requirementId: "",
    title: "",
    scenario: "",
    preconditions: "",
    steps: [""],
    expectedResult: "",
    priority: "Medium",
    status: "Not Executed",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadProjectData();
  }, []);
const loadProjectData = async () => {
  try {
    setLoading(true);
    setError("");

    // Get the project selected from Projects page
    const selectedProjectId =
      localStorage.getItem("selectedProjectId");

    if (!selectedProjectId) {
      setError(
        "Please select a project first from the Projects page."
      );

      setLoading(false);
      return;
    }

    // Store selected project ID
    setProjectId(selectedProjectId);

    // Load requirements for selected project
    const requirementResponse =
      await API.get(
        `/requirements?projectId=${selectedProjectId}`
      );

    const projectRequirements =
      requirementResponse.data.requirements || [];

    setRequirements(projectRequirements);

    // Load test cases for selected project
    const testCaseResponse =
      await API.get(
        `/test-cases?projectId=${selectedProjectId}`
      );

    setTestCases(
      testCaseResponse.data.testCases || []
    );

  } catch (error) {
    console.error(
      "Failed to load test case data:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Failed to load test case data."
    );
  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // GENERATE TEST CASES
  // ==========================================
const handleGenerateTestCases = async () => {
  try {
    setError("");
    setSuccess("");

    if (!selectedRequirement) {
      setError("Please select a requirement first.");
      return;
    }

    const requirement = requirements.find(
      (item) =>
        (item._id || item.requirementId) === selectedRequirement
    );

    if (!requirement) {
      setError("Selected requirement could not be found.");
      return;
    }

    // Check whether AI-generated test cases already exist
    const existingAITestCases = testCases.filter(
      (testCase) =>
        testCase.requirementId === requirement.requirementId &&
        testCase.source === "AI Generated"
    );

    // If AI test cases already exist, show confirmation modal
    if (existingAITestCases.length > 0) {
      setShowGenerateConfirmModal(true);
      return;
    }

    // No existing AI test cases - generate directly
    await generateAdditionalTestCases();
  } catch (error) {
    console.error("Generate test cases error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to generate test cases."
    );
  }
};

const generateAdditionalTestCases = async () => {
  try {
    setGenerating(true);
    setError("");
    setSuccess("");

    const requirement = requirements.find(
      (item) =>
        (item._id || item.requirementId) === selectedRequirement
    );

    if (!requirement) {
      setError("Selected requirement could not be found.");
      return;
    }

    const response = await API.post(
      "/ai/generate-test-cases",
      {
        requirementId: requirement.requirementId,
        requirementText: requirement.text,
        projectId,
      }
    );

    const total = response.data.totalTestCases || 0;
    const removedDuplicates =
      response.data.removedDuplicates || 0;

    if (total === 0) {
      setSuccess(
        "No new unique test cases were generated."
      );
    } else if (removedDuplicates > 0) {
      setSuccess(
        `${total} new test case(s) generated successfully. ${removedDuplicates} duplicate case(s) were removed.`
      );
    } else {
      setSuccess(
        `${total} new test case(s) generated successfully.`
      );
    }

    const testCaseResponse = await API.get(
      `/test-cases?projectId=${projectId}`
    );

    setTestCases(
      testCaseResponse.data.testCases || []
    );

  } catch (error) {
    console.error(
      "Generate additional test cases error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Failed to generate additional test cases."
    );
  } finally {
    setGenerating(false);
  }
};
  // ==========================================
  // EDIT TEST CASE
  // ==========================================

  const handleEditClick = (testCase) => {
    setEditingTestCase(testCase);

    setEditForm({
      title: testCase.title || "",
      scenario: testCase.scenario || "",
      preconditions: testCase.preconditions || "",
      steps: testCase.steps || [],
      expectedResult: testCase.expectedResult || "",
      priority: testCase.priority || "Medium",
      status: testCase.status || "Not Executed",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStepChange = (index, value) => {
    setEditForm((previous) => {
      const updatedSteps = [...previous.steps];

      updatedSteps[index] = value;

      return {
        ...previous,
        steps: updatedSteps,
      };
    });
  };

  const handleAddStep = () => {
    setEditForm((previous) => ({
      ...previous,
      steps: [...previous.steps, ""],
    }));
  };

  const handleRemoveStep = (index) => {
    setEditForm((previous) => ({
      ...previous,
      steps: previous.steps.filter(
        (_, stepIndex) => stepIndex !== index
      ),
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setError("");
      setSuccess("");

      if (!editForm.title.trim()) {
        setError("Test case title is required.");
        return;
      }

      if (!editForm.scenario.trim()) {
        setError("Test case scenario is required.");
        return;
      }

      if (!editForm.expectedResult.trim()) {
        setError("Expected result is required.");
        return;
      }

      const response = await API.put(
        `/test-cases/${editingTestCase._id}`,
        editForm
      );

      setTestCases((previous) =>
        previous.map((testCase) =>
          testCase._id === editingTestCase._id
            ? response.data.testCase
            : testCase
        )
      );

      setSuccess("Test case updated successfully.");

      setEditingTestCase(null);
    } catch (error) {
      console.error(
        "Update test case error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update test case."
      );
    }
  };

  // ==========================================
  // CREATE MANUAL TEST CASE
  // ==========================================

  const handleOpenCreateModal = () => {
    setError("");
    setSuccess("");

    setCreateForm({
      requirementId:
        selectedRequirement || "",
      title: "",
      scenario: "",
      preconditions: "",
      steps: [""],
      expectedResult: "",
      priority: "Medium",
      status: "Not Executed",
    });

    setShowCreateModal(true);
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateStepChange = (index, value) => {
    setCreateForm((previous) => {
      const updatedSteps = [...previous.steps];

      updatedSteps[index] = value;

      return {
        ...previous,
        steps: updatedSteps,
      };
    });
  };

  const handleAddCreateStep = () => {
    setCreateForm((previous) => ({
      ...previous,
      steps: [...previous.steps, ""],
    }));
  };

  const handleRemoveCreateStep = (index) => {
    setCreateForm((previous) => ({
      ...previous,
      steps: previous.steps.filter(
        (_, stepIndex) => stepIndex !== index
      ),
    }));
  };

  const handleCreateTestCase = async () => {
    try {
      setError("");
      setSuccess("");

      if (!createForm.requirementId) {
        setError("Please select a requirement.");
        return;
      }

      if (!createForm.title.trim()) {
        setError("Test case title is required.");
        return;
      }

      if (!createForm.scenario.trim()) {
        setError("Test case scenario is required.");
        return;
      }

      if (!createForm.expectedResult.trim()) {
        setError("Expected result is required.");
        return;
      }

      const requirement = requirements.find(
        (item) =>
          item.requirementId ===
          createForm.requirementId
      );

      if (!requirement) {
        setError("Selected requirement not found.");
        return;
      }

      const cleanedSteps = createForm.steps.filter(
        (step) => step.trim() !== ""
      );

      const response = await API.post(
        "/test-cases",
        {
          requirementId:
            createForm.requirementId,

          projectId,

          title: createForm.title,

          scenario: createForm.scenario,

          preconditions:
            createForm.preconditions,

          steps: cleanedSteps,

          expectedResult:
            createForm.expectedResult,

          priority: createForm.priority,

          status: createForm.status,

          source: "Manual",
        }
      );

      setTestCases((previous) => [
        response.data.testCase,
        ...previous,
      ]);

      setSuccess(
        "Manual test case created successfully."
      );

      setShowCreateModal(false);
    } catch (error) {
      console.error(
        "Create test case error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create test case."
      );
    }
  };

  // ==========================================
  // DELETE TEST CASE
  // ==========================================

  const handleDeleteTestCase = async (testCase) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${testCase.testCaseId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await API.delete(
        `/test-cases/${testCase._id}`
      );

      setTestCases((previous) =>
        previous.filter(
          (item) => item._id !== testCase._id
        )
      );

      setSuccess(
        `${testCase.testCaseId} deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete test case error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete test case."
      );
    }
  };

  // ==========================================
  // FILTER TEST CASES
  // ==========================================

  const filteredTestCases =
    selectedRequirement === ""
      ? testCases
      : testCases.filter((testCase) => {
          const requirement = requirements.find(
            (item) =>
              (item._id || item.requirementId) ===
              selectedRequirement
          );

          return (
            requirement &&
            testCase.requirementId ===
              requirement.requirementId
          );
        });

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalTestCases =
    filteredTestCases.length;

  const highPriority =
    filteredTestCases.filter(
      (testCase) =>
        testCase.priority === "High"
    ).length;

  const mediumPriority =
    filteredTestCases.filter(
      (testCase) =>
        testCase.priority === "Medium"
    ).length;

  const lowPriority =
    filteredTestCases.filter(
      (testCase) =>
        testCase.priority === "Low"
    ).length;

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="dashboard-page test-cases-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Test Cases</h1>

          <p>
            Generate, create and manage software
            test cases.
          </p>
        </div>

        <button
          type="button"
          className="manual-test-case-btn"
          onClick={handleOpenCreateModal}
        >
          + Create Manual Test Case
        </button>
      </div>

      {/* GENERATE PANEL */}
      <div className="generate-test-panel">

        <div className="generate-test-content">

          <div>
            <h3>Generate Test Cases</h3>

            <p>
              Select a requirement and let TestGen AI
              generate test cases automatically.
            </p>
          </div>

          <div className="generate-controls">

            <select
              value={selectedRequirement}
              onChange={(event) =>
                setSelectedRequirement(
                  event.target.value
                )
              }
              disabled={
                generating ||
                requirements.length === 0
              }
            >

              <option value="">
                All Requirements
              </option>

              {requirements.map(
                (requirement) => (
                  <option
                    key={requirement._id}
                    value={requirement._id}
                  >
                    {requirement.requirementId}
                    {" - "}
                    {requirement.title}
                  </option>
                )
              )}

            </select>

            <button
              className="primary-btn"
              onClick={
                handleGenerateTestCases
              }
              disabled={
                generating ||
                !selectedRequirement
              }
            >
              {generating
                ? "Generating..."
                : "Generate Test Cases"}
            </button>

          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="success-message">
          ✓ {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Test Cases</span>
          <strong>{totalTestCases}</strong>
        </div>

        <div className="stat-card">
          <span>High Priority</span>
          <strong>{highPriority}</strong>
        </div>

        <div className="stat-card">
          <span>Medium Priority</span>
          <strong>{mediumPriority}</strong>
        </div>

        <div className="stat-card">
          <span>Low Priority</span>
          <strong>{lowPriority}</strong>
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="empty-state">
          Loading test cases...
        </div>
      )}

      {/* NO TEST CASES */}
      {!loading &&
        !error &&
        filteredTestCases.length === 0 && (
          <div className="empty-state">

            <h3>No Test Cases Found</h3>

            <p>
              Create a manual test case or select a
              requirement and generate test cases
              using AI.
            </p>

          </div>
        )}

      {/* TEST CASE LIST */}
      {!loading &&
        filteredTestCases.length > 0 && (
          <div className="test-cases-list">

            {filteredTestCases.map(
              (testCase) => (
                <div
                  className="test-case-card"
                  key={testCase._id}
                >

                  {/* TEST CASE HEADER */}
                  <div className="test-case-top">

                    <div>

                      <span className="test-case-id">
                        {testCase.testCaseId}
                      </span>

                      <h3>
                        {testCase.title}
                      </h3>

                    </div>

                    <div className="test-case-header-actions">

                      <span
                        className={`priority-badge ${
                          testCase.priority.toLowerCase()
                        }`}
                      >
                        {testCase.priority}
                      </span>

                      <button
                        type="button"
                        className="edit-test-case-btn"
                        onClick={() =>
                          handleEditClick(
                            testCase
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-test-case-btn"
                        onClick={() =>
                          handleDeleteTestCase(
                            testCase
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* REQUIREMENT */}
                  <div className="test-case-section">

                    <h4>Requirement</h4>

                    <p>
                      {testCase.requirementId}
                    </p>

                  </div>

                  {/* SCENARIO */}
                  <div className="test-case-section">

                    <h4>Scenario</h4>

                    <p>
                      {testCase.scenario}
                    </p>

                  </div>

                  {/* PRECONDITIONS */}
                  {testCase.preconditions && (
                    <div className="test-case-section">

                      <h4>Preconditions</h4>

                      <p>
                        {testCase.preconditions}
                      </p>

                    </div>
                  )}

                  {/* TEST STEPS */}
                  {testCase.steps &&
                    testCase.steps.length > 0 && (
                      <div className="test-case-section">

                        <h4>Test Steps</h4>

                        <ol className="test-steps">

                          {testCase.steps.map(
                            (step, index) => (
                              <li key={index}>
                                {step}
                              </li>
                            )
                          )}

                        </ol>

                      </div>
                    )}

                  {/* EXPECTED RESULT */}
                  <div className="test-case-section">

                    <h4>Expected Result</h4>

                    <p>
                      {testCase.expectedResult}
                    </p>

                  </div>

                  {/* FOOTER */}
                  <div className="test-case-footer">

                    <span>
                      Status:{" "}
                      <strong>
                        {testCase.status}
                      </strong>
                    </span>

                    <span>
                      Source:{" "}
                      <strong>
                        {testCase.source}
                      </strong>
                    </span>

                  </div>

                </div>
              )
            )}

          </div>
        )}



{/* ==========================================
    AI GENERATION CONFIRMATION MODAL
    ========================================== */}

{showGenerateConfirmModal && (
  <div className="edit-test-case-overlay">

    <div className="generate-confirm-modal">

      <div className="generate-confirm-icon">
        AI
      </div>

      <div className="generate-confirm-content">

        <h2>
          AI Test Cases Already Exist
        </h2>

        <p>
          AI test cases already exist for{" "}
          <strong>{requirements.find(
            (item) =>
              (item._id || item.requirementId) ===
              selectedRequirement
          )?.requirementId}</strong>.
        </p>

        <p>
          Do you want to generate additional test cases?
        </p>

      </div>

      <div className="generate-confirm-actions">

        <button
          type="button"
          className="generate-confirm-cancel"
          onClick={() =>
            setShowGenerateConfirmModal(false)
          }
          disabled={generating}
        >
          Cancel
        </button>

        <button
          type="button"
          className="generate-confirm-button"
          onClick={async () => {
            setShowGenerateConfirmModal(false);
            await generateAdditionalTestCases();
          }}
          disabled={generating}
        >
          {generating
            ? "Generating..."
            : "Generate Additional Test Cases"}
        </button>

      </div>

    </div>

  </div>
)}
      {/* ==========================================
          CREATE MANUAL TEST CASE MODAL
          ========================================== */}

      {showCreateModal && (
        <div className="edit-test-case-overlay">

          <div className="edit-test-case-modal">

            <div className="edit-modal-header">

              <div>
                <span className="edit-modal-label">
                  CREATE MANUAL TEST CASE
                </span>

                <h2>
                  New Test Case
                </h2>
              </div>

              <button
                type="button"
                className="close-edit-modal"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="edit-form">

              {/* REQUIREMENT */}
              <div className="edit-form-group">

                <label>
                  Requirement
                </label>

                <select
                  name="requirementId"
                  value={
                    createForm.requirementId
                  }
                  onChange={
                    handleCreateChange
                  }
                >

                  <option value="">
                    Select Requirement
                  </option>

                  {requirements.map(
                    (requirement) => (
                      <option
                        key={requirement._id}
                        value={
                          requirement.requirementId
                        }
                      >
                        {requirement.requirementId}
                        {" - "}
                        {requirement.title}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* TITLE */}
              <div className="edit-form-group">

                <label>
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={createForm.title}
                  onChange={
                    handleCreateChange
                  }
                  placeholder="Enter test case title"
                />

              </div>

              {/* SCENARIO */}
              <div className="edit-form-group">

                <label>
                  Scenario
                </label>

                <textarea
                  name="scenario"
                  value={createForm.scenario}
                  onChange={
                    handleCreateChange
                  }
                  rows="3"
                  placeholder="Enter test scenario"
                />

              </div>

              {/* PRECONDITIONS */}
              <div className="edit-form-group">

                <label>
                  Preconditions
                </label>

                <textarea
                  name="preconditions"
                  value={
                    createForm.preconditions
                  }
                  onChange={
                    handleCreateChange
                  }
                  rows="3"
                  placeholder="Enter required preconditions"
                />

              </div>

              {/* TEST STEPS */}
              <div className="edit-form-group">

                <label>
                  Test Steps
                </label>

                <div className="edit-steps-container">

                  {createForm.steps.map(
                    (step, index) => (
                      <div
                        className="edit-step-row"
                        key={index}
                      >

                        <span className="step-number">
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={step}
                          onChange={(event) =>
                            handleCreateStepChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Test step ${
                            index + 1
                          }`}
                        />

                        {createForm.steps.length >
                          1 && (
                          <button
                            type="button"
                            className="remove-step-btn"
                            onClick={() =>
                              handleRemoveCreateStep(
                                index
                              )
                            }
                          >
                            ×
                          </button>
                        )}

                      </div>
                    )
                  )}

                </div>

                <button
                  type="button"
                  className="add-step-btn"
                  onClick={
                    handleAddCreateStep
                  }
                >
                  + Add Step
                </button>

              </div>

              {/* EXPECTED RESULT */}
              <div className="edit-form-group">

                <label>
                  Expected Result
                </label>

                <textarea
                  name="expectedResult"
                  value={
                    createForm.expectedResult
                  }
                  onChange={
                    handleCreateChange
                  }
                  rows="3"
                  placeholder="Enter expected result"
                />

              </div>

              {/* PRIORITY + STATUS */}
              <div className="edit-form-row">

                <div className="edit-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      createForm.priority
                    }
                    onChange={
                      handleCreateChange
                    }
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>

                </div>

                <div className="edit-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      createForm.status
                    }
                    onChange={
                      handleCreateChange
                    }
                  >
                    <option value="Not Executed">
                      Not Executed
                    </option>

                    <option value="Passed">
                      Passed
                    </option>

                    <option value="Failed">
                      Failed
                    </option>

                    <option value="Blocked">
                      Blocked
                    </option>
                  </select>

                </div>

              </div>

              {/* BUTTONS */}
              <div className="edit-modal-actions">

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-edit-btn"
                  onClick={
                    handleCreateTestCase
                  }
                >
                  Create Test Case
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          EDIT TEST CASE MODAL
          ========================================== */}

      {editingTestCase && (
        <div className="edit-test-case-overlay">

          <div className="edit-test-case-modal">

            <div className="edit-modal-header">

              <div>

                <span className="edit-modal-label">
                  EDIT TEST CASE
                </span>

                <h2>
                  {editingTestCase.testCaseId}
                </h2>

              </div>

              <button
                type="button"
                className="close-edit-modal"
                onClick={() =>
                  setEditingTestCase(null)
                }
              >
                ×
              </button>

            </div>

            <div className="edit-form">

              {/* TITLE */}
              <div className="edit-form-group">

                <label>
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Enter test case title"
                />

              </div>

              {/* SCENARIO */}
              <div className="edit-form-group">

                <label>
                  Scenario
                </label>

                <textarea
                  name="scenario"
                  value={editForm.scenario}
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="Enter test scenario"
                />

              </div>

              {/* PRECONDITIONS */}
              <div className="edit-form-group">

                <label>
                  Preconditions
                </label>

                <textarea
                  name="preconditions"
                  value={
                    editForm.preconditions
                  }
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="Enter required preconditions"
                />

              </div>

              {/* TEST STEPS */}
              <div className="edit-form-group">

                <label>
                  Test Steps
                </label>

                <div className="edit-steps-container">

                  {editForm.steps.map(
                    (step, index) => (
                      <div
                        className="edit-step-row"
                        key={index}
                      >

                        <span className="step-number">
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={step}
                          onChange={(event) =>
                            handleStepChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Test step ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="remove-step-btn"
                          onClick={() =>
                            handleRemoveStep(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

                <button
                  type="button"
                  className="add-step-btn"
                  onClick={handleAddStep}
                >
                  + Add Step
                </button>

              </div>

              {/* EXPECTED RESULT */}
              <div className="edit-form-group">

                <label>
                  Expected Result
                </label>

                <textarea
                  name="expectedResult"
                  value={
                    editForm.expectedResult
                  }
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="Enter expected result"
                />

              </div>

              {/* PRIORITY + STATUS */}
              <div className="edit-form-row">

                <div className="edit-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      editForm.priority
                    }
                    onChange={handleEditChange}
                  >

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>

                <div className="edit-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editForm.status
                    }
                    onChange={handleEditChange}
                  >

                    <option value="Not Executed">
                      Not Executed
                    </option>

                    <option value="Passed">
                      Passed
                    </option>

                    <option value="Failed">
                      Failed
                    </option>

                    <option value="Blocked">
                      Blocked
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTONS */}
              <div className="edit-modal-actions">

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() =>
                    setEditingTestCase(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-edit-btn"
                  onClick={
                    handleSaveEdit
                  }
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default TestCases;