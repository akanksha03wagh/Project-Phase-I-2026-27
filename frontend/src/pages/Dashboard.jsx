import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaProjectDiagram,
  FaClipboardList,
  FaVial,
  FaChartPie,
  FaArrowRight,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

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

import API from "../services/api";
import "../styles/Dashboard.css";
import "../styles/DashboardPage.css";


const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRequirements: 0,
    totalTestCases: 0,
    coverage: 0,
  });

  const [testCaseStatusData, setTestCaseStatusData] = useState([]);

  const [projectCoverageData, setProjectCoverageData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------
         GET LOGGED-IN USER
      ------------------------------------------------ */

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User information not found. Please login again.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user.id) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }


      /* -----------------------------------------------
         GET USER PROJECTS
      ------------------------------------------------ */

      const projectResponse = await API.get(
        `/projects?userId=${user.id}`
      );

      const userProjects = projectResponse.data.projects || [];

      setProjects(userProjects);


      /* -----------------------------------------------
         IF NO PROJECTS
      ------------------------------------------------ */

      if (userProjects.length === 0) {
        setStats({
          totalProjects: 0,
          totalRequirements: 0,
          totalTestCases: 0,
          coverage: 0,
        });

        setTestCaseStatusData([]);

        setProjectCoverageData([]);

        setLoading(false);

        return;
      }


      /* -----------------------------------------------
         LOAD REQUIREMENTS AND TEST CASES
         FOR EVERY PROJECT
      ------------------------------------------------ */

      let allRequirements = [];
      let allTestCases = [];

      const projectData = [];


      for (const project of userProjects) {

        try {

          /* GET REQUIREMENTS */

          const requirementResponse = await API.get(
            `/requirements?projectId=${project._id}`
          );

          const requirements =
            requirementResponse.data.requirements || [];


          /* GET TEST CASES */

          const testCaseResponse = await API.get(
            `/test-cases?projectId=${project._id}`
          );

          const testCases =
            testCaseResponse.data.testCases || [];


          allRequirements = [
            ...allRequirements,
            ...requirements,
          ];

          allTestCases = [
            ...allTestCases,
            ...testCases,
          ];


          /* -------------------------------------------
             CALCULATE PROJECT COVERAGE

             Requirement is covered only when:
             - At least one test case exists
             - ALL related test cases are Passed
          ------------------------------------------- */

          let coveredRequirements = 0;

          requirements.forEach((requirement) => {

            const relatedTestCases = testCases.filter(
              (testCase) =>
                testCase.requirementId ===
                  requirement.requirementId ||
                testCase.requirementId ===
                  requirement._id
            );


            const allPassed =
              relatedTestCases.length > 0 &&
              relatedTestCases.every(
                (testCase) =>
                  testCase.status === "Passed"
              );


            if (allPassed) {
              coveredRequirements++;
            }
          });


          const projectCoverage =
            requirements.length > 0
              ? Math.round(
                  (coveredRequirements /
                    requirements.length) *
                    100
                )
              : 0;


          projectData.push({
            name: project.name,
            coverage: projectCoverage,
          });

        } catch (projectError) {

          console.error(
            `Error loading project ${project.name}:`,
            projectError
          );

          projectData.push({
            name: project.name,
            coverage: 0,
          });
        }
      }


      /* -----------------------------------------------
         TOTAL COVERAGE
      ------------------------------------------------ */

      let totalCoveredRequirements = 0;


      allRequirements.forEach((requirement) => {

        const relatedTestCases =
          allTestCases.filter(
            (testCase) =>
              testCase.requirementId ===
                requirement.requirementId ||
              testCase.requirementId ===
                requirement._id
          );


        const allPassed =
          relatedTestCases.length > 0 &&
          relatedTestCases.every(
            (testCase) =>
              testCase.status === "Passed"
          );


        if (allPassed) {
          totalCoveredRequirements++;
        }
      });


      const overallCoverage =
        allRequirements.length > 0
          ? Math.round(
              (totalCoveredRequirements /
                allRequirements.length) *
                100
            )
          : 0;


      /* -----------------------------------------------
         TEST CASE STATUS
      ------------------------------------------------ */

      const passedCount = allTestCases.filter(
        (testCase) =>
          testCase.status === "Passed"
      ).length;


      const failedCount = allTestCases.filter(
        (testCase) =>
          testCase.status === "Failed"
      ).length;


      const notExecutedCount = allTestCases.filter(
        (testCase) =>
          testCase.status === "Not Executed"
      ).length;


      const statusData = [];


      if (passedCount > 0) {
        statusData.push({
          name: "Passed",
          value: passedCount,
        });
      }


      if (failedCount > 0) {
        statusData.push({
          name: "Failed",
          value: failedCount,
        });
      }


      if (notExecutedCount > 0) {
        statusData.push({
          name: "Not Executed",
          value: notExecutedCount,
        });
      }


      /* -----------------------------------------------
         UPDATE STATE
      ------------------------------------------------ */

      setStats({
        totalProjects: userProjects.length,

        totalRequirements:
          allRequirements.length,

        totalTestCases:
          allTestCases.length,

        coverage: overallCoverage,
      });


      setTestCaseStatusData(statusData);

      setProjectCoverageData(projectData);

      setLoading(false);

    } catch (err) {

      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
      );

      setLoading(false);
    }
  };


  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <div className="tg-dashboard-page">

        <div className="tg-dashboard-loading">

          <div className="tg-dashboard-spinner"></div>

          <h3>Loading Dashboard</h3>

          <p>
            Fetching your projects and testing data...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="tg-dashboard-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="tg-dashboard-header">

        <div>

          <p className="tg-dashboard-label">
            TESTGEN AI
          </p>

          <h1>
            Dashboard
          </h1>

          <p className="tg-dashboard-subtitle">
            Overview of your software testing projects,
            requirements and test cases.
          </p>

        </div>


        <Link
          to="/projects"
          className="tg-dashboard-create-btn"
        >
          <FaPlus />
          Create Project
        </Link>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="tg-dashboard-error">
          {error}
        </div>
      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="tg-dashboard-stats">

        {/* Projects */}

        <div className="tg-stat-card">

          <div className="tg-stat-icon blue">
            <FaProjectDiagram />
          </div>

          <div className="tg-stat-content">

            <span>
              Total Projects
            </span>

            <h2>
              {stats.totalProjects}
            </h2>

            <small>
              Your active projects
            </small>

          </div>

        </div>


        {/* Requirements */}

        <div className="tg-stat-card">

          <div className="tg-stat-icon purple">
            <FaClipboardList />
          </div>

          <div className="tg-stat-content">

            <span>
              Requirements
            </span>

            <h2>
              {stats.totalRequirements}
            </h2>

            <small>
              Extracted requirements
            </small>

          </div>

        </div>


        {/* Test Cases */}

        <div className="tg-stat-card">

          <div className="tg-stat-icon orange">
            <FaVial />
          </div>

          <div className="tg-stat-content">

            <span>
              Test Cases
            </span>

            <h2>
              {stats.totalTestCases}
            </h2>

            <small>
              Generated test cases
            </small>

          </div>

        </div>


        {/* Coverage */}

        <div className="tg-stat-card">

          <div className="tg-stat-icon green">
            <FaChartPie />
          </div>

          <div className="tg-stat-content">

            <span>
              Requirement Coverage
            </span>

            <h2>
              {stats.coverage}%
            </h2>

            <small>
              Fully passed requirements
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="tg-dashboard-charts">


        {/* ---------------------------------------------
            TEST CASE STATUS
        --------------------------------------------- */}

        <div className="tg-chart-card">

          <div className="tg-chart-header">

            <div>

              <h2>
                Test Case Status
              </h2>

              <p>
                Current execution status
              </p>

            </div>

          </div>


          <div className="tg-chart-container">

            {testCaseStatusData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={testCaseStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {testCaseStatusData.map(
                      (entry, index) => {

                        const colors = [
                          "#22c55e",
                          "#ef4444",
                          "#f59e0b",
                        ];

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              colors[index %
                                colors.length]
                            }
                          />
                        );

                      }
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="tg-no-data">

                <FaVial />

                <span>
                  No test case data available
                </span>

              </div>

            )}

          </div>

        </div>


        {/* ---------------------------------------------
            PROJECT COVERAGE
        --------------------------------------------- */}

        <div className="tg-chart-card">

          <div className="tg-chart-header">

            <div>

              <h2>
                Project Coverage
              </h2>

              <p>
                Requirement coverage by project
              </p>

            </div>

          </div>


          <div className="tg-chart-container">

            {projectCoverageData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={projectCoverageData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 30,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 9,
                    }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="coverage"
                    fill="#0d6efd"
                    radius={[5, 5, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="tg-no-data">

                <FaChartPie />

                <span>
                  No project data available
                </span>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          RECENT PROJECTS
      ================================================= */}

      <div className="tg-dashboard-section">

        <div className="tg-section-header">

          <div>

            <h2>
              Recent Projects
            </h2>

            <p>
              Your latest software testing projects
            </p>

          </div>


          <Link
            to="/projects"
            className="tg-view-all"
          >
            View All
            <FaArrowRight />
          </Link>

        </div>


        {projects.length > 0 ? (

          <div className="tg-project-grid">

            {projects
              .slice(0, 6)
              .map((project) => {

                const projectChart =
                  projectCoverageData.find(
                    (item) =>
                      item.name ===
                      project.name
                  );

                const coverage =
                  projectChart?.coverage || 0;


                return (

                  <div
                    className="tg-project-card"
                    key={project._id}
                  >

                    <div className="tg-project-top">

                      <div className="tg-project-icon">
                        <FaProjectDiagram />
                      </div>

                      <span
                        className={`tg-project-status ${
                          project.status ===
                          "Active"
                            ? "active"
                            : "draft"
                        }`}
                      >
                        {project.status ||
                          "Draft"}
                      </span>

                    </div>


                    <h3>
                      {project.name}
                    </h3>


                    <p>
                      {project.description ||
                        "No project description available."}
                    </p>


                    <div className="tg-project-metrics">

                      <div>

                        <span>
                          Requirements
                        </span>

                        <strong>
                          {project.requirements ||
                            0}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Test Cases
                        </span>

                        <strong>
                          {project.testCases ||
                            0}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Coverage
                        </span>

                        <strong>
                          {coverage}%
                        </strong>

                      </div>

                    </div>


                    <div className="tg-project-progress">

                      <div className="tg-progress-header">

                        <span>
                          Coverage
                        </span>

                        <strong>
                          {coverage}%
                        </strong>

                      </div>


                      <div className="tg-progress-track">

                        <div
                          className="tg-progress-fill"
                          style={{
                            width: `${coverage}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>

                );

              })}

          </div>

        ) : (

          <div className="tg-empty-projects">

            <FaProjectDiagram />

            <h3>
              No Projects Yet
            </h3>

            <p>
              Create your first project to start
              analyzing requirements and generating
              test cases with TestGen AI.
            </p>

            <Link
              to="/projects"
              className="create-project-btn"
            >
              <FaPlus />
              Create Project
            </Link>

          </div>

        )}

      </div>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="tg-dashboard-section">

        <div className="tg-section-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Quickly access your testing workflow
            </p>

          </div>

        </div>


        <div className="tg-actions-grid">


          {/* Projects */}

          <Link
            to="/projects"
            className="tg-action-card"
          >

            <div className="tg-action-icon blue">
              <FaProjectDiagram />
            </div>

            <div>

              <h3>
                Manage Projects
              </h3>

              <p>
                Create and manage your projects
              </p>

            </div>

            <FaArrowRight />

          </Link>


          {/* Requirements */}

          <Link
            to="/requirements"
            className="tg-action-card"
          >

            <div className="tg-action-icon purple">
              <FaClipboardList />
            </div>

            <div>

              <h3>
                Analyze Requirements
              </h3>

              <p>
                Upload and analyze SRS documents
              </p>

            </div>

            <FaArrowRight />

          </Link>


          {/* Test Cases */}

          <Link
            to="/test-cases"
            className="tg-action-card"
          >

            <div className="tg-action-icon orange">
              <FaVial />
            </div>

            <div>

              <h3>
                View Test Cases
              </h3>

              <p>
                Review generated test cases
              </p>

            </div>

            <FaArrowRight />

          </Link>


          {/* Reports */}

          <Link
            to="/reports"
            className="tg-action-card"
          >

            <div className="tg-action-icon green">
              <FaChartPie />
            </div>

            <div>

              <h3>
                View Reports
              </h3>

              <p>
                Analyze coverage and testing reports
              </p>

            </div>

            <FaArrowRight />

          </Link>

        </div>

      </div>

    </div>
  );
};


export default Dashboard;