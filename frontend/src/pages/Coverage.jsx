import { useEffect, useState } from "react";
import API from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Coverage() {
  const [summary, setSummary] = useState({
    totalRequirements: 0,
    coveredRequirements: 0,
    uncoveredRequirements: 0,
    coveragePercentage: 0,
    functionalRequirements: 0,
    nonFunctionalRequirements: 0,
    totalTestCases: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });

  const [uncoveredRequirements, setUncoveredRequirements] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCoverage();
  }, []);

  const loadCoverage = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        Get the project selected from the Projects page.

        Projects.jsx stores the selected project ID in:
        localStorage -> selectedProjectId
      */
      const selectedProjectId =
        localStorage.getItem("selectedProjectId");

      if (!selectedProjectId) {
        setError(
          "Please select a project first from the Projects page."
        );

        setSummary({
          totalRequirements: 0,
          coveredRequirements: 0,
          uncoveredRequirements: 0,
          coveragePercentage: 0,
          functionalRequirements: 0,
          nonFunctionalRequirements: 0,
          totalTestCases: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
        });

        setUncoveredRequirements([]);

        setLoading(false);
        return;
      }

      console.log(
        "Loading coverage for project:",
        selectedProjectId
      );

      /*
        Use the selected project's Traceability API.

        Coverage rule:

        Covered =
        at least one test case exists
        AND
        ALL associated test cases are Passed
      */
      const response = await API.get(
        `/traceability?projectId=${selectedProjectId}`
      );

      console.log(
        "Coverage / Traceability response:",
        response.data
      );

      const traceability =
        response.data.traceability || [];

      /*
        REQUIREMENT STATISTICS
      */

      const totalRequirements =
        traceability.length;

      const coveredRequirements =
        traceability.filter(
          (requirement) =>
            requirement.allTestCasesPassed === true
        ).length;

      const uncoveredRequirements =
        traceability.filter(
          (requirement) =>
            requirement.allTestCasesPassed !== true
        );

      const uncoveredCount =
        uncoveredRequirements.length;

      const coveragePercentage =
        totalRequirements > 0
          ? Math.round(
              (coveredRequirements /
                totalRequirements) *
                100
            )
          : 0;

      /*
        REQUIREMENT TYPE COUNTS
      */

      const functionalRequirements =
        traceability.filter(
          (requirement) =>
            requirement.type === "Functional"
        ).length;

      const nonFunctionalRequirements =
        traceability.filter(
          (requirement) =>
            requirement.type ===
            "Non-Functional"
        ).length;

      /*
        GET ALL TEST CASES

        Traceability API returns the test cases
        belonging to each requirement.
      */

      const allTestCases =
        traceability.flatMap(
          (requirement) =>
            requirement.testCases || []
        );

      /*
        TEST CASE COUNTS
      */

      const totalTestCases =
        allTestCases.length;

      const highPriority =
        allTestCases.filter(
          (testCase) =>
            testCase.priority === "High"
        ).length;

      const mediumPriority =
        allTestCases.filter(
          (testCase) =>
            testCase.priority === "Medium"
        ).length;

      const lowPriority =
        allTestCases.filter(
          (testCase) =>
            testCase.priority === "Low"
        ).length;

      /*
        UPDATE SUMMARY
      */

      setSummary({
        totalRequirements,

        coveredRequirements,

        uncoveredRequirements:
          uncoveredCount,

        coveragePercentage,

        functionalRequirements,

        nonFunctionalRequirements,

        totalTestCases,

        highPriority,

        mediumPriority,

        lowPriority,
      });

      /*
        UPDATE UNCOVERED REQUIREMENTS

        Includes requirements where:

        - No test cases exist
        OR
        - Some test cases are not Passed
        OR
        - One or more test cases Failed
        OR
        - Test cases are still Not Executed
      */

      setUncoveredRequirements(
        uncoveredRequirements
      );
    } catch (error) {
      console.error(
        "Coverage loading error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load coverage analysis."
      );

      setSummary({
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
        functionalRequirements: 0,
        nonFunctionalRequirements: 0,
        totalTestCases: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      });

      setUncoveredRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  /*
    COVERAGE CHART
  */

  const coverageData = [
    {
      name: "Covered",
      value: summary.coveredRequirements,
    },
    {
      name: "Not Covered",
      value: summary.uncoveredRequirements,
    },
  ];

  /*
    REQUIREMENT TYPE CHART
  */

  const requirementTypeData = [
    {
      name: "Functional",
      value: summary.functionalRequirements,
    },
    {
      name: "Non-Functional",
      value: summary.nonFunctionalRequirements,
    },
  ];

  /*
    PRIORITY DATA
  */

  const priorityData = [
    {
      name: "High",
      value: summary.highPriority,
    },
    {
      name: "Medium",
      value: summary.mediumPriority,
    },
    {
      name: "Low",
      value: summary.lowPriority,
    },
  ];

  return (
    <div className="dashboard-page coverage-page">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <h1>Coverage Analysis</h1>

          <p>
            Analyze requirement coverage and
            test case distribution.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadCoverage}
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

      {/* LOADING */}
      {loading ? (
        <div className="empty-state">
          Loading coverage analysis...
        </div>
      ) : (
        <>

          {/* MAIN STATISTICS */}
          <div className="stats-grid">

            <div className="stat-card">
              <span>
                Total Requirements
              </span>

              <strong>
                {summary.totalRequirements}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Covered Requirements
              </span>

              <strong className="green-number">
                {summary.coveredRequirements}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Uncovered Requirements
              </span>

              <strong className="red-number">
                {summary.uncoveredRequirements}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Requirement Coverage
              </span>

              <strong className="blue-number">
                {summary.coveragePercentage}%
              </strong>
            </div>

          </div>


          {/* CHARTS */}
          <div className="coverage-charts-grid">

            {/* COVERAGE CHART */}
            <div className="coverage-chart-card">

              <div className="chart-header">

                <h3>
                  Requirement Coverage
                </h3>

                <p>
                  Covered vs uncovered requirements
                </p>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <PieChart>

                    <Pie
                      data={coverageData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={3}
                    >

                      {coverageData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

                <div className="chart-center-value">

                  <strong>
                    {summary.coveragePercentage}%
                  </strong>

                  <span>
                    Covered
                  </span>

                </div>

              </div>

            </div>


            {/* REQUIREMENT TYPES */}
            <div className="coverage-chart-card">

              <div className="chart-header">

                <h3>
                  Requirement Types
                </h3>

                <p>
                  Functional and non-functional
                  requirements
                </p>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <PieChart>

                    <Pie
                      data={requirementTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={3}
                    >

                      {requirementTypeData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>


          {/* TEST CASE SUMMARY */}
          <div className="test-summary-card">

            <div className="chart-header">

              <h3>
                Test Case Summary
              </h3>

              <p>
                Generated test case distribution
              </p>

            </div>

            <div className="test-summary-grid">

              <div className="summary-item">

                <span>
                  Total Test Cases
                </span>

                <strong>
                  {summary.totalTestCases}
                </strong>

              </div>

              <div className="summary-item">

                <span>
                  High Priority
                </span>

                <strong>
                  {summary.highPriority}
                </strong>

              </div>

              <div className="summary-item">

                <span>
                  Medium Priority
                </span>

                <strong>
                  {summary.mediumPriority}
                </strong>

              </div>

              <div className="summary-item">

                <span>
                  Low Priority
                </span>

                <strong>
                  {summary.lowPriority}
                </strong>

              </div>

            </div>

          </div>


          {/* UNCOVERED REQUIREMENTS */}
          <div className="uncovered-card">

            <div className="chart-header">

              <h3>
                Uncovered Requirements
              </h3>

              <p>
                Requirements whose associated test
                cases are not all passed.
              </p>

            </div>


            {uncoveredRequirements.length ===
            0 ? (

              <div className="all-covered-message">

                ✓ All requirements are fully covered.
                Every associated test case has passed.

              </div>

            ) : (

              <div className="uncovered-list">

                {uncoveredRequirements.map(
                  (requirement) => (

                    <div
                      className="uncovered-item"
                      key={requirement._id}
                    >

                      <div>

                        <span className="requirement-code">
                          {requirement.requirementId}
                        </span>

                        <h4>
                          {requirement.title}
                        </h4>

                        <p>
                          {requirement.text}
                        </p>

                        {/* TEST CASE STATUS */}
                        <div className="coverage-test-details">

                          <span>
                            Test Cases:
                            {" "}
                            {requirement.testCaseCount}
                          </span>

                          <span>
                            Passed:
                            {" "}
                            {requirement.passedTestCaseCount}
                            /
                            {requirement.testCaseCount}
                          </span>

                        </div>

                      </div>

                      <span className="not-covered-badge">
                        Not Covered
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}

export default Coverage;