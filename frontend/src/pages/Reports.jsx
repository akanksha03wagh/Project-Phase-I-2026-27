import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import API from "../services/api";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =======================================================
  // GET SELECTED PROJECT ID
  // =======================================================

  const getProjectId = () => {

    const storedProject =
      localStorage.getItem("selectedProject");

    if (storedProject) {
      try {

        const project = JSON.parse(storedProject);

        if (project?._id) {
          return project._id;
        }

        if (project?.id) {
          return project.id;
        }

      } catch (error) {

        console.log(
          "Could not read selectedProject:",
          error
        );

      }
    }


    const selectedProjectId =
      localStorage.getItem("selectedProjectId");

    if (selectedProjectId) {
      return selectedProjectId;
    }


    const projectId =
      localStorage.getItem("projectId");

    if (projectId) {
      return projectId;
    }


    return null;
  };


  // =======================================================
  // GET LOGGED-IN USER ID
  // =======================================================

  const getUserId = () => {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {

      const user = JSON.parse(storedUser);

      return (
        user?._id ||
        user?.id ||
        user?.userId ||
        null
      );

    } catch (error) {

      console.log(
        "Could not read logged-in user:",
        error
      );

      return null;
    }
  };


  // =======================================================
  // FETCH REPORT
  // =======================================================

  const fetchReport = async () => {

    try {

      setLoading(true);
      setError("");
      setReport(null);


      let projectId = getProjectId();


      // ---------------------------------------------------
      // Get project if one is not already selected
      // ---------------------------------------------------

      if (!projectId) {

        const userId = getUserId();

        if (!userId) {

          setError(
            "Logged-in user information was not found. Please login again."
          );

          setLoading(false);

          return;
        }


        const projectsResponse =
          await API.get(
            `/projects?userId=${userId}`
          );


        let projects =
          projectsResponse.data?.projects ||
          projectsResponse.data;


        if (!Array.isArray(projects)) {
          projects = [];
        }


        if (projects.length > 0) {

          projectId =
            projects[0]._id ||
            projects[0].id;


          localStorage.setItem(
            "selectedProject",
            JSON.stringify(projects[0])
          );

        }

      }


      // ---------------------------------------------------
      // No project available
      // ---------------------------------------------------

      if (!projectId) {

        setError(
          "No project is available. Please create a project first."
        );

        setLoading(false);

        return;
      }


      // ---------------------------------------------------
      // Get report
      // ---------------------------------------------------

      const response =
        await API.get(
          `/reports?projectId=${projectId}`
        );


      setReport(response.data);

    } catch (err) {

      console.error(
        "Report loading error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Unable to load report data."
      );

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // LOAD REPORT
  // =======================================================

  useEffect(() => {

    fetchReport();

  }, []);


  // =======================================================
  // EXPORT PDF
  // =======================================================

  const handleExportPDF = () => {

    if (!report) {
      return;
    }


    const {
      summary,
      coverage,
      execution,
      requirementCoverage,
    } = report;


    const doc = new jsPDF();


    // -----------------------------------------------------
    // Title
    // -----------------------------------------------------

    doc.setFontSize(20);

    doc.setFont("helvetica", "bold");

    doc.text(
      "TestGen AI",
      14,
      18
    );


    doc.setFontSize(14);

    doc.setFont("helvetica", "normal");

    doc.text(
      "Software Testing Analytics Report",
      14,
      27
    );


    // -----------------------------------------------------
    // Date
    // -----------------------------------------------------

    const generatedDate =
      new Date().toLocaleString();


    doc.setFontSize(9);

    doc.text(
      `Generated on: ${generatedDate}`,
      14,
      35
    );


    // -----------------------------------------------------
    // Horizontal line
    // -----------------------------------------------------

    doc.line(
      14,
      40,
      196,
      40
    );


    // -----------------------------------------------------
    // Summary heading
    // -----------------------------------------------------

    doc.setFontSize(14);

    doc.setFont("helvetica", "bold");

    doc.text(
      "Project Summary",
      14,
      51
    );


    // -----------------------------------------------------
    // Summary table
    // -----------------------------------------------------

    autoTable(doc, {

      startY: 57,

      head: [
        [
          "Metric",
          "Value",
        ],
      ],

      body: [

        [
          "Total Requirements",
          summary.totalRequirements,
        ],

        [
          "Functional Requirements",
          summary.functionalRequirements,
        ],

        [
          "Non-Functional Requirements",
          summary.nonFunctionalRequirements,
        ],

        [
          "Total Test Cases",
          summary.totalTestCases,
        ],

        [
          "Passed Test Cases",
          summary.passedTestCases,
        ],

        [
          "Failed Test Cases",
          summary.failedTestCases,
        ],

        [
          "Not Executed Test Cases",
          summary.notExecutedTestCases,
        ],

        [
          "Requirement Coverage",
          `${coverage.coveragePercentage}%`,
        ],

        [
          "Covered Requirements",
          coverage.coveredRequirements,
        ],

        [
          "Uncovered Requirements",
          coverage.uncoveredRequirements,
        ],

        [
          "Test Case Execution",
          `${execution.testCaseExecutionPercentage}%`,
        ],

      ],

      theme: "grid",

      styles: {
        fontSize: 9,
      },

      headStyles: {
        fontStyle: "bold",
      },

    });


    // -----------------------------------------------------
    // Coverage section
    // -----------------------------------------------------

    let currentY =
      doc.lastAutoTable.finalY + 12;


    doc.setFontSize(14);

    doc.setFont("helvetica", "bold");

    doc.text(
      "Requirement Coverage Details",
      14,
      currentY
    );


    // -----------------------------------------------------
    // Requirement table
    // -----------------------------------------------------

    const tableRows =
      requirementCoverage.map(
        (requirement) => [

          requirement.requirementId,

          requirement.title,

          requirement.type,

          requirement.testCaseCount,

          requirement.passedTestCaseCount,

          requirement.failedTestCaseCount,

          requirement.notExecutedTestCaseCount,

          requirement.covered
            ? "Covered"
            : "Not Covered",

        ]
      );


    autoTable(doc, {

      startY: currentY + 6,

      head: [

        [
          "Requirement ID",
          "Requirement",
          "Type",
          "Test Cases",
          "Passed",
          "Failed",
          "Not Executed",
          "Status",
        ],

      ],

      body: tableRows,

      theme: "grid",

      styles: {
        fontSize: 7,
        cellPadding: 2,
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {

        0: {
          cellWidth: 22,
        },

        1: {
          cellWidth: 48,
        },

        2: {
          cellWidth: 24,
        },

      },

    });


    // -----------------------------------------------------
    // Footer
    // -----------------------------------------------------

    const pageCount =
      doc.internal.getNumberOfPages();


    for (
      let i = 1;
      i <= pageCount;
      i++
    ) {

      doc.setPage(i);

      doc.setFontSize(8);

      doc.setFont("helvetica", "normal");

      doc.text(
        `TestGen AI - Page ${i} of ${pageCount}`,
        14,
        290
      );

    }


    // -----------------------------------------------------
    // Download
    // -----------------------------------------------------

    doc.save(
      "TestGen_AI_Testing_Report.pdf"
    );

  };


  // =======================================================
  // EXPORT EXCEL
  // =======================================================

  const handleExportExcel = () => {

    if (!report) {
      return;
    }


    const {
      summary,
      coverage,
      execution,
      requirementCoverage,
      requirementTypeDistribution,
      testCaseStatusDistribution,
    } = report;


    // -----------------------------------------------------
    // SUMMARY SHEET
    // -----------------------------------------------------

    const summaryData = [

      {
        Metric: "Total Requirements",
        Value: summary.totalRequirements,
      },

      {
        Metric: "Functional Requirements",
        Value: summary.functionalRequirements,
      },

      {
        Metric: "Non-Functional Requirements",
        Value: summary.nonFunctionalRequirements,
      },

      {
        Metric: "Total Test Cases",
        Value: summary.totalTestCases,
      },

      {
        Metric: "Passed Test Cases",
        Value: summary.passedTestCases,
      },

      {
        Metric: "Failed Test Cases",
        Value: summary.failedTestCases,
      },

      {
        Metric: "Not Executed Test Cases",
        Value: summary.notExecutedTestCases,
      },

      {
        Metric: "Requirement Coverage",
        Value: `${coverage.coveragePercentage}%`,
      },

      {
        Metric: "Covered Requirements",
        Value: coverage.coveredRequirements,
      },

      {
        Metric: "Uncovered Requirements",
        Value: coverage.uncoveredRequirements,
      },

      {
        Metric: "Test Case Execution",
        Value: `${execution.testCaseExecutionPercentage}%`,
      },

    ];


    // -----------------------------------------------------
    // REQUIREMENT COVERAGE SHEET
    // -----------------------------------------------------

    const requirementData =
      requirementCoverage.map(
        (requirement) => ({

          "Requirement ID":
            requirement.requirementId,

          "Requirement":
            requirement.title,

          "Type":
            requirement.type,

          "Test Cases":
            requirement.testCaseCount,

          "Passed":
            requirement.passedTestCaseCount,

          "Failed":
            requirement.failedTestCaseCount,

          "Not Executed":
            requirement.notExecutedTestCaseCount,

          "Status":
            requirement.covered
              ? "Covered"
              : "Not Covered",

        })
      );


    // -----------------------------------------------------
    // TEST CASE EXECUTION SHEET
    // -----------------------------------------------------

    const executionData =
      testCaseStatusDistribution.map(
        (item) => ({

          "Status":
            item.name,

          "Test Cases":
            item.value,

        })
      );


    // -----------------------------------------------------
    // REQUIREMENT TYPE SHEET
    // -----------------------------------------------------

    const requirementTypeData =
      requirementTypeDistribution.map(
        (item) => ({

          "Requirement Type":
            item.name,

          "Count":
            item.value,

        })
      );


    // -----------------------------------------------------
    // CREATE WORKBOOK
    // -----------------------------------------------------

    const workbook =
      XLSX.utils.book_new();


    // -----------------------------------------------------
    // Create Summary worksheet
    // -----------------------------------------------------

    const summaryWorksheet =
      XLSX.utils.json_to_sheet(
        summaryData
      );


    XLSX.utils.book_append_sheet(
      workbook,
      summaryWorksheet,
      "Summary"
    );


    // -----------------------------------------------------
    // Create Requirement Coverage worksheet
    // -----------------------------------------------------

    const requirementWorksheet =
      XLSX.utils.json_to_sheet(
        requirementData
      );


    XLSX.utils.book_append_sheet(
      workbook,
      requirementWorksheet,
      "Requirement Coverage"
    );


    // -----------------------------------------------------
    // Create Test Execution worksheet
    // -----------------------------------------------------

    const executionWorksheet =
      XLSX.utils.json_to_sheet(
        executionData
      );


    XLSX.utils.book_append_sheet(
      workbook,
      executionWorksheet,
      "Test Execution"
    );


    // -----------------------------------------------------
    // Create Requirement Types worksheet
    // -----------------------------------------------------

    const requirementTypeWorksheet =
      XLSX.utils.json_to_sheet(
        requirementTypeData
      );


    XLSX.utils.book_append_sheet(
      workbook,
      requirementTypeWorksheet,
      "Requirement Types"
    );


    // -----------------------------------------------------
    // Set column widths
    // -----------------------------------------------------

    summaryWorksheet["!cols"] = [
      {
        wch: 32,
      },

      {
        wch: 18,
      },
    ];


    requirementWorksheet["!cols"] = [

      {
        wch: 18,
      },

      {
        wch: 55,
      },

      {
        wch: 22,
      },

      {
        wch: 14,
      },

      {
        wch: 12,
      },

      {
        wch: 12,
      },

      {
        wch: 16,
      },

      {
        wch: 18,
      },

    ];


    executionWorksheet["!cols"] = [

      {
        wch: 20,
      },

      {
        wch: 18,
      },

    ];


    requirementTypeWorksheet["!cols"] = [

      {
        wch: 25,
      },

      {
        wch: 15,
      },

    ];


    // -----------------------------------------------------
    // Download Excel file
    // -----------------------------------------------------

    XLSX.writeFile(
      workbook,
      "TestGen_AI_Testing_Report.xlsx"
    );

  };


  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading) {

    return (
      <div className="reports-page">

        <div className="reports-loading">

          <div className="reports-spinner"></div>

          <p>
            Generating project report...
          </p>

        </div>

      </div>
    );

  }


  // =======================================================
  // ERROR SCREEN
  // =======================================================

  if (error) {

    return (
      <div className="reports-page">

        <div className="reports-header">

          <div>

            <h1>
              Reports
            </h1>

            <p>
              Analyze project requirements, test cases
              and testing coverage.
            </p>

          </div>

        </div>


        <div className="reports-error">

          <div className="error-icon">
            !
          </div>

          <h3>
            Unable to Load Report
          </h3>

          <p>
            {error}
          </p>

          <button
            className="report-refresh-btn"
            onClick={fetchReport}
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }


  // =======================================================
  // NO REPORT
  // =======================================================

  if (!report) {
    return null;
  }


  // =======================================================
  // REPORT DATA
  // =======================================================

  const {
    summary,
    coverage,
    execution,
    requirementTypeDistribution,
    testCaseStatusDistribution,
    requirementCoverage,
  } = report;


  // =======================================================
  // COVERAGE CHART DATA
  // =======================================================

  const coverageChartData = [

    {
      name: "Covered",
      value: coverage.coveredRequirements,
    },

    {
      name: "Not Covered",
      value: coverage.uncoveredRequirements,
    },

  ];


  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="reports-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div>

          <div className="reports-title-row">

            <div className="reports-title-icon">
              📊
            </div>

            <div>

              <h1>
                Reports & Analytics
              </h1>

              <p>
                Analyze your project's requirements,
                test execution and coverage.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            REPORT ACTION BUTTONS
        ================================================= */}

        <div className="report-action-buttons">

          <button
            className="report-export-btn pdf-export-btn"
            onClick={handleExportPDF}
          >
            📄 &nbsp; Export PDF
          </button>


          <button
            className="report-export-btn excel-export-btn"
            onClick={handleExportExcel}
          >
            📊 &nbsp; Export Excel
          </button>


          <button
            className="report-refresh-btn"
            onClick={fetchReport}
          >
            ↻ &nbsp; Refresh Report
          </button>

        </div>

      </div>



      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="report-summary-grid">


        {/* TOTAL REQUIREMENTS */}

        <div className="report-stat-card">

          <div className="report-stat-icon requirements-icon">
            📋
          </div>

          <div>

            <span>
              Total Requirements
            </span>

            <h2>
              {summary.totalRequirements}
            </h2>

            <small>
              {summary.functionalRequirements}
              {" Functional · "}
              {summary.nonFunctionalRequirements}
              {" Non-Functional"}
            </small>

          </div>

        </div>



        {/* TOTAL TEST CASES */}

        <div className="report-stat-card">

          <div className="report-stat-icon testcases-icon">
            🧪
          </div>

          <div>

            <span>
              Total Test Cases
            </span>

            <h2>
              {summary.totalTestCases}
            </h2>

            <small>
              Generated test cases
            </small>

          </div>

        </div>



        {/* PASSED */}

        <div className="report-stat-card">

          <div className="report-stat-icon passed-icon">
            ✓
          </div>

          <div>

            <span>
              Passed
            </span>

            <h2>
              {summary.passedTestCases}
            </h2>

            <small>
              {execution.passPercentage}%
              {" of all test cases"}
            </small>

          </div>

        </div>



        {/* FAILED */}

        <div className="report-stat-card">

          <div className="report-stat-icon failed-icon">
            ✕
          </div>

          <div>

            <span>
              Failed
            </span>

            <h2>
              {summary.failedTestCases}
            </h2>

            <small>
              Test cases requiring attention
            </small>

          </div>

        </div>



        {/* NOT EXECUTED */}

        <div className="report-stat-card">

          <div className="report-stat-icon pending-icon">
            ◷
          </div>

          <div>

            <span>
              Not Executed
            </span>

            <h2>
              {summary.notExecutedTestCases}
            </h2>

            <small>
              Waiting for execution
            </small>

          </div>

        </div>



        {/* COVERAGE */}

        <div className="report-stat-card">

          <div className="report-stat-icon coverage-icon">
            %
          </div>

          <div>

            <span>
              Requirement Coverage
            </span>

            <h2>
              {coverage.coveragePercentage}%
            </h2>

            <small>
              {coverage.coveredRequirements}
              {" of "}
              {summary.totalRequirements}
              {" covered"}
            </small>

          </div>

        </div>

      </div>



      {/* =================================================
          CHART SECTION
      ================================================= */}

      <div className="reports-chart-grid">


        {/* REQUIREMENT DISTRIBUTION */}

        <div className="report-chart-card">

          <div className="report-card-header">

            <div>

              <h3>
                Requirement Distribution
              </h3>

              <p>
                Functional vs non-functional requirements
              </p>

            </div>

          </div>


          <div className="report-chart-container">

            {summary.totalRequirements > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <PieChart>

                  <Pie
                    data={requirementTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={4}
                  >

                    {requirementTypeDistribution.map(
                      (entry, index) => (

                        <Cell
                          key={`requirement-${index}`}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="no-chart-data">
                No requirement data available.
              </div>

            )}

          </div>

        </div>



        {/* TEST CASE EXECUTION */}

        <div className="report-chart-card">

          <div className="report-card-header">

            <div>

              <h3>
                Test Case Execution
              </h3>

              <p>
                Current execution status of test cases
              </p>

            </div>

          </div>


          <div className="report-chart-container">

            {summary.totalTestCases > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={testCaseStatusDistribution}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="no-chart-data">
                No test case data available.
              </div>

            )}

          </div>

        </div>



        {/* REQUIREMENT COVERAGE */}

        <div className="report-chart-card">

          <div className="report-card-header">

            <div>

              <h3>
                Requirement Coverage
              </h3>

              <p>
                Requirements fully covered by passed
                test cases
              </p>

            </div>

          </div>


          <div className="report-chart-container">

            {summary.totalRequirements > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <PieChart>

                  <Pie
                    data={coverageChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={4}
                  >

                    {coverageChartData.map(
                      (entry, index) => (

                        <Cell
                          key={`coverage-${index}`}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="no-chart-data">
                No coverage data available.
              </div>

            )}

          </div>

        </div>



        {/* EXECUTION OVERVIEW */}

        <div className="report-chart-card execution-overview-card">

          <div className="report-card-header">

            <div>

              <h3>
                Execution Overview
              </h3>

              <p>
                Overall testing progress
              </p>

            </div>

          </div>


          <div className="execution-overview">


            <div className="execution-progress-wrapper">

              <div
                className="execution-progress-circle"
                style={{
                  "--progress":
                    `${execution.testCaseExecutionPercentage}%`,
                }}
              >

                <div className="execution-progress-inner">

                  <strong>
                    {execution.testCaseExecutionPercentage}%
                  </strong>

                  <span>
                    Executed
                  </span>

                </div>

              </div>

            </div>


            <div className="execution-details">


              <div className="execution-detail-row">

                <span>

                  <i className="legend-dot passed-dot"></i>

                  Passed

                </span>

                <strong>
                  {summary.passedTestCases}
                </strong>

              </div>


              <div className="execution-detail-row">

                <span>

                  <i className="legend-dot failed-dot"></i>

                  Failed

                </span>

                <strong>
                  {summary.failedTestCases}
                </strong>

              </div>


              <div className="execution-detail-row">

                <span>

                  <i className="legend-dot pending-dot"></i>

                  Not Executed

                </span>

                <strong>
                  {summary.notExecutedTestCases}
                </strong>

              </div>


            </div>

          </div>

        </div>

      </div>



      {/* =================================================
          REQUIREMENT COVERAGE TABLE
      ================================================= */}

      <div className="report-table-card">


        <div className="report-table-header">

          <div>

            <h3>
              Requirement Coverage Details
            </h3>

            <p>
              Requirement-level test coverage and
              execution status.
            </p>

          </div>


          <div className="coverage-summary-badge">

            {coverage.coveredRequirements}
            {" / "}
            {summary.totalRequirements}
            {" Covered"}

          </div>

        </div>



        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>

              <tr>

                <th>
                  Requirement ID
                </th>

                <th>
                  Requirement
                </th>

                <th>
                  Type
                </th>

                <th>
                  Test Cases
                </th>

                <th>
                  Passed
                </th>

                <th>
                  Failed
                </th>

                <th>
                  Not Executed
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {requirementCoverage.length > 0 ? (

                requirementCoverage.map(
                  (requirement) => (

                    <tr
                      key={
                        requirement.requirementId
                      }
                    >

                      <td>

                        <span className="requirement-id">

                          {requirement.requirementId}

                        </span>

                      </td>


                      <td className="requirement-title-cell">

                        {requirement.title}

                      </td>


                      <td>

                        <span
                          className={`type-badge ${
                            requirement.type ===
                            "Functional"
                              ? "functional-badge"
                              : "nonfunctional-badge"
                          }`}
                        >

                          {requirement.type}

                        </span>

                      </td>


                      <td>
                        {requirement.testCaseCount}
                      </td>


                      <td>

                        <span className="table-number passed-number">

                          {requirement.passedTestCaseCount}

                        </span>

                      </td>


                      <td>

                        <span className="table-number failed-number">

                          {requirement.failedTestCaseCount}

                        </span>

                      </td>


                      <td>

                        <span className="table-number pending-number">

                          {
                            requirement.notExecutedTestCaseCount
                          }

                        </span>

                      </td>


                      <td>

                        {requirement.covered ? (

                          <span className="coverage-status covered">

                            ✓ Covered

                          </span>

                        ) : (

                          <span className="coverage-status not-covered">

                            ! Not Covered

                          </span>

                        )}

                      </td>


                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="empty-table"
                  >

                    No requirements found for
                    this project.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>



      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="reports-footer">

        <span>
          TestGen AI · Automated Testing Analytics
        </span>

        <span>
          Report generated from current project data
        </span>

      </div>


    </div>
  );
};


export default Reports;