import { useEffect, useState } from "react";
import API from "../services/api";

function Traceability() {
  const [traceability, setTraceability] = useState([]);

  const [statistics, setStatistics] = useState({
    totalRequirements: 0,
    coveredRequirements: 0,
    uncoveredRequirements: 0,
    coveragePercentage: 0,
  });

  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTraceability();
  }, []);

  const loadTraceability = async () => {
    try {
      setLoading(true);
      setError("");

      // Get the project selected from the Projects page
      const selectedProjectId =
        localStorage.getItem("selectedProjectId");

      if (!selectedProjectId) {
        setError(
          "Please select a project first from the Projects page."
        );

        setTraceability([]);

        setStatistics({
          totalRequirements: 0,
          coveredRequirements: 0,
          uncoveredRequirements: 0,
          coveragePercentage: 0,
        });

        setLoading(false);
        return;
      }

      setProjectId(selectedProjectId);

      console.log(
        "Loading traceability for project:",
        selectedProjectId
      );

      // Load traceability for the selected project
      const response = await API.get(
        `/traceability?projectId=${selectedProjectId}`
      );

      console.log(
        "Traceability response:",
        response.data
      );

      setTraceability(
        response.data.traceability || []
      );

      setStatistics(
        response.data.statistics || {
          totalRequirements: 0,
          coveredRequirements: 0,
          uncoveredRequirements: 0,
          coveragePercentage: 0,
        }
      );
    } catch (error) {
      console.error(
        "Traceability loading error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load traceability data."
      );

      setTraceability([]);

      setStatistics({
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page traceability-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Traceability</h1>

          <p>
            Map software requirements to their
            corresponding test cases.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadTraceability}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="stats-grid">

        <div className="stat-card">
          <span>
            Total Requirements
          </span>

          <strong>
            {statistics.totalRequirements}
          </strong>
        </div>

        <div className="stat-card covered-stat">
          <span>
            Covered Requirements
          </span>

          <strong>
            {statistics.coveredRequirements}
          </strong>
        </div>

        <div className="stat-card uncovered-stat">
          <span>
            Uncovered Requirements
          </span>

          <strong>
            {statistics.uncoveredRequirements}
          </strong>
        </div>

        <div className="stat-card coverage-stat">
          <span>
            Requirement Coverage
          </span>

          <strong>
            {statistics.coveragePercentage}%
          </strong>
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="empty-state">
          Loading traceability data...
        </div>
      )}

      {/* TRACEABILITY TABLE */}
      {!loading &&
        traceability.length > 0 && (
          <div className="traceability-card">

            <div className="traceability-card-header">
              <div>
                <h3>
                  Requirements Traceability Matrix
                </h3>

                <p>
                  Each requirement is mapped to
                  its generated test cases.
                </p>
              </div>
            </div>

            <div className="traceability-table-wrapper">

              <table className="traceability-table">

                <thead>
                  <tr>
                    <th>Requirement</th>

                    <th>Title</th>

                    <th>Type</th>

                    <th>Test Cases</th>

                    <th>Coverage</th>
                  </tr>
                </thead>

                <tbody>

                  {traceability.map(
                    (item) => (
                      <tr
                        key={
                          item.requirementId
                        }
                      >

                        {/* REQUIREMENT ID */}
                        <td>
                          <span className="requirement-code">
                            {item.requirementId}
                          </span>
                        </td>

                        {/* TITLE + DESCRIPTION */}
                        <td>
                          <div className="requirement-title">
                            {item.title}
                          </div>

                          <div className="requirement-description">
                            {item.text}
                          </div>
                        </td>

                        {/* TYPE */}
                        <td>
                          <span
                            className={`type-badge ${
                              item.type ===
                              "Functional"
                                ? "functional"
                                : "non-functional"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        {/* TEST CASES */}
                        <td>
                          <div className="test-case-count-wrapper">

                            <span className="test-count">
                              {item.testCaseCount}
                            </span>

                            {item.testCaseCount > 0 && (
                              <span className="passed-count">
                                {item.passedTestCaseCount}
                                /
                                {item.testCaseCount}
                                {" "}
                                Passed
                              </span>
                            )}

                          </div>
                        </td>

                        {/* COVERAGE */}
                        <td>

                          {item.allTestCasesPassed ? (
                            <span className="coverage-badge covered">
                              ✓ Covered
                            </span>
                          ) : (
                            <span className="coverage-badge not-covered">
                              ✕ Not Covered
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        traceability.length === 0 && (
          <div className="empty-state">

            <h3>
              No Requirements Found
            </h3>

            <p>
              Upload and analyze an SRS document
              to create requirements.
            </p>

          </div>
        )}

    </div>
  );
}

export default Traceability;