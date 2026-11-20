import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaPlus,
  FaProjectDiagram,
  FaEllipsisV,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // GET LOGGED-IN USER
  // =========================================

  const getLoggedInUser = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      return user;
    } catch (error) {
      console.error("Failed to read user:", error);
      return null;
    }
  };

  // =========================================
  // LOAD PROJECTS
  // =========================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getLoggedInUser();

      if (!user || !user.id) {
        setError("User information not found.");
        setLoading(false);
        return;
      }

      const response = await API.get(
        `/projects?userId=${user.id}`
      );

      setProjects(
        response.data.projects || []
      );
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD PROJECTS ON PAGE LOAD
  // =========================================

  useEffect(() => {
    loadProjects();
  }, []);

  // =========================================
  // CREATE PROJECT
  // =========================================

  const handleCreateProject = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    try {
      setCreating(true);

      const user = getLoggedInUser();

      if (!user || !user.id) {
        setError("User information not found.");
        return;
      }

      const response = await API.post(
        "/projects",
        {
          name: projectName.trim(),
          description:
            projectDescription.trim(),
          createdBy: user.id,
        }
      );

      setSuccess(
        response.data.message ||
          "Project created successfully."
      );

      setProjectName("");
      setProjectDescription("");

      setShowCreateModal(false);

      await loadProjects();

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================
  // VIEW / SELECT PROJECT
  // =========================================

  const handleViewProject = (project) => {
    /*
      Save the selected project so that
      Requirements, Test Cases, Traceability,
      Coverage, Duplicate Detection and Reports
      can use the same project.
    */

    localStorage.setItem(
      "selectedProjectId",
      project.id || project._id
    );

    localStorage.setItem(
      "selectedProject",
      JSON.stringify(project)
    );

    navigate("/requirements");
  };

  // =========================================
  // CLOSE CREATE MODAL
  // =========================================

  const handleCloseModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setProjectName("");
    setProjectDescription("");

    setError("");
  };

  // =========================================
  // PAGE UI
  // =========================================

  return (
    <div className="projects-page">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="projects-header">

        <div>
          <h1>Projects</h1>

          <p>
            Create and manage your software
            testing projects.
          </p>
        </div>

        <button
          className="create-project-btn"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          <FaPlus />
          Create New Project
        </button>

      </div>

      {/* ===================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ===================================== */}

      {success && (
        <div className="project-success-message">
          {success}
        </div>
      )}

      {/* ===================================== */}
      {/* ERROR MESSAGE */}
      {/* ===================================== */}

      {error && !showCreateModal && (
        <div className="project-error-message">
          {error}
        </div>
      )}

      {/* ===================================== */}
      {/* LOADING */}
      {/* ===================================== */}

      {loading ? (

        <div className="projects-empty">

          <FaProjectDiagram />

          <h3>
            Loading projects...
          </h3>

          <p>
            Please wait while your projects
            are being loaded.
          </p>

        </div>

      ) : projects.length === 0 ? (

        /* =================================== */
        /* NO PROJECTS */
        /* =================================== */

        <div className="projects-empty">

          <FaProjectDiagram />

          <h3>
            No projects yet
          </h3>

          <p>
            Create your first project to start
            analyzing requirements and generating
            test cases.
          </p>

          <button
            className="create-project-btn"
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            <FaPlus />
            Create New Project
          </button>

        </div>

      ) : (

        /* =================================== */
        /* PROJECT CARDS */
        /* =================================== */

        <div className="projects-grid">

          {projects.map((project) => (

            <div
              className="project-card"
              key={
                project._id ||
                project.id
              }
            >

              {/* CARD HEADER */}

              <div className="project-card-header">

                <div className="project-icon">
                  <FaProjectDiagram />
                </div>

                <button
                  className="project-menu-btn"
                  title="Project options"
                >
                  <FaEllipsisV />
                </button>

              </div>

              {/* PROJECT NAME */}

              <h2>
                {project.name}
              </h2>

              {/* DESCRIPTION */}

              <p className="project-description">

                {project.description ||
                  "No project description available."}

              </p>

              {/* STATUS */}

              <div className="project-status-row">

                <span
                  className={`project-status ${
                    project.status
                      ?.toLowerCase() ===
                    "active"
                      ? "active"
                      : "draft"
                  }`}
                >
                  {project.status ||
                    "Draft"}
                </span>

                <span className="project-date">

                  {project.createdAt
                    ? new Date(
                        project.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "Recently created"}

                </span>

              </div>

              {/* PROJECT STATISTICS */}

              <div className="project-stats">

                <div>
                  <span>
                    Requirements
                  </span>

                  <strong>
                    {project.requirements ??
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Test Cases
                  </span>

                  <strong>
                    {project.testCases ??
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Coverage
                  </span>

                  <strong>
                    {project.coverage ??
                      0}
                    %
                  </strong>
                </div>

              </div>

              {/* VIEW PROJECT */}
<button
  className="view-project-btn"
  onClick={() => handleViewProject(project)}
>
  View Project
</button>

            </div>

          ))}

        </div>

      )}

      {/* ===================================== */}
      {/* CREATE PROJECT MODAL */}
      {/* ===================================== */}

      {showCreateModal && (

        <div className="project-modal-overlay">

          <div className="project-modal">

            {/* MODAL HEADER */}

            <div className="project-modal-header">

              <div>
                <h2>
                  Create New Project
                </h2>

                <p>
                  Add a new software testing
                  project.
                </p>
              </div>

              <button
                className="project-modal-close"
                onClick={
                  handleCloseModal
                }
                disabled={creating}
              >
                <FaTimes />
              </button>

            </div>

            {/* MODAL ERROR */}

            {error && (
              <div className="project-error-message">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                handleCreateProject
              }
            >

              {/* PROJECT NAME */}

              <div className="project-form-group">

                <label>
                  Project Name
                </label>

                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(
                      event.target.value
                    )
                  }
                  disabled={creating}
                />

              </div>

              {/* DESCRIPTION */}

              <div className="project-form-group">

                <label>
                  Description
                </label>

                <textarea
                  placeholder="Enter project description"
                  rows="4"
                  value={
                    projectDescription
                  }
                  onChange={(event) =>
                    setProjectDescription(
                      event.target.value
                    )
                  }
                  disabled={creating}
                />

              </div>

              {/* BUTTONS */}

              <div className="project-modal-actions">

                <button
                  type="button"
                  className="project-cancel-btn"
                  onClick={
                    handleCloseModal
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-project-btn"
                  disabled={creating}
                >
                  <FaPlus />

                  {creating
                    ? "Creating..."
                    : "Create Project"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Projects;