import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import {
  FaRobot,
  FaTachometerAlt,
  FaProjectDiagram,
  FaClipboardList,
  FaVial,
  FaLink,
  FaChartBar,
  FaFileAlt,
  FaSearch,
  FaBell,
  FaQuestionCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaCopy
} from "react-icons/fa";

import "../styles/Dashboard.css";

const DashboardLayout = () => {
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: "User",
        email: "user@example.com",
      };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        {/* Brand */}

        <Link to="/dashboard" className="dashboard-brand">

          <div className="dashboard-brand-icon">
            <FaRobot />
          </div>

          <div>
            <strong>TestGen AI</strong>
            <span>AI Test Case Generator</span>
          </div>

        </Link>


        {/* Sidebar Navigation */}

        <nav className="sidebar-navigation">

          {/* Main */}

          <div className="sidebar-section">

            <div className="sidebar-section-title">
              MAIN
            </div>

            <Link
              to="/dashboard"
              className={`sidebar-link ${
                isActive("/dashboard") ? "active" : ""
              }`}
            >
              <FaTachometerAlt />
              <span>Dashboard</span>
            </Link>

          </div>


          {/* Testing */}

          <div className="sidebar-section">

            <div className="sidebar-section-title">
              TESTING
            </div>

            <Link
              to="/projects"
              className={`sidebar-link ${
                isActive("/projects") ? "active" : ""
              }`}
            >
              <FaProjectDiagram />
              <span>Projects</span>
            </Link>

            <Link
              to="/requirements"
              className={`sidebar-link ${
                isActive("/requirements") ? "active" : ""
              }`}
            >
              <FaClipboardList />
              <span>Requirements</span>
            </Link>

            <Link
              to="/test-cases"
              className={`sidebar-link ${
                isActive("/test-cases") ? "active" : ""
              }`}
            >
              <FaVial />
              <span>Test Cases</span>
            </Link>

            <Link
              to="/traceability"
              className={`sidebar-link ${
                isActive("/traceability") ? "active" : ""
              }`}
            >
              <FaLink />
              <span>Traceability</span>
            </Link>

            <Link
              to="/coverage"
              className={`sidebar-link ${
                isActive("/coverage") ? "active" : ""
              }`}
            >
              <FaChartBar />
              <span>Coverage Analysis</span>
            </Link>
 
                <Link
  to="/duplicates"
  className={`sidebar-link ${
    isActive("/duplicates") ? "active" : ""
  }`}
>
  <FaCopy />
  <span>Duplicate Detection</span>
</Link>
          </div>


          {/* Workspace */}

          <div className="sidebar-section">

            <div className="sidebar-section-title">
              WORKSPACE
            </div>

            <Link
              to="/reports"
              className={`sidebar-link ${
                isActive("/reports") ? "active" : ""
              }`}
            >
              <FaFileAlt />
              <span>Reports</span>
            </Link>

          </div>

        </nav>


        {/* Sidebar Footer */}

        <div className="sidebar-footer">

          <div className="sidebar-footer-text">
            <strong>TestGen AI</strong>
            <span>AI-powered software testing</span>
          </div>

        </div>

      </aside>


      {/* ================= MAIN AREA ================= */}

      <div className="dashboard-main">

        {/* ================= TOPBAR ================= */}

        <header className="dashboard-topbar">

          {/* Search */}

          <div className="topbar-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search projects, requirements..."
            />

          </div>


          {/* Topbar Right */}

          <div className="topbar-right">

            {/* Help */}

            <button
              className="topbar-icon-button"
              title="Help & Support"
            >
              <FaQuestionCircle />
            </button>


            {/* Notifications */}

            <button
              className="topbar-icon-button"
              title="Notifications"
            >
              <FaBell />

              <span className="notification-dot"></span>

            </button>


            {/* Profile */}

            <div className="profile-wrapper">

              <button
                className="topbar-profile"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
              >

                <div className="profile-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="profile-info">

                  <strong>{user.name}</strong>

                  <span>{user.email}</span>

                </div>

                <FaChevronDown
                  className={`profile-arrow ${
                    profileOpen ? "rotate" : ""
                  }`}
                />

              </button>


              {/* Profile Dropdown */}

              {profileOpen && (

                <div className="profile-dropdown">

                  {/* User Information */}

                  <div className="dropdown-user">

                    <div className="dropdown-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>

                      <strong>{user.name}</strong>

                      <span>{user.email}</span>

                    </div>

                  </div>


                  <div className="dropdown-divider"></div>


                  {/* Profile */}

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>


                  {/* Settings */}

                  <Link
                    to="/settings"
                    className="dropdown-item"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <FaCog />
                    <span>Account Settings</span>
                  </Link>


                  {/* Help */}

                  <Link
                    to="/help"
                    className="dropdown-item"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <FaQuestionCircle />
                    <span>Help & Support</span>
                  </Link>


                  <div className="dropdown-divider"></div>


                  {/* Logout */}

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>

                </div>

              )}

            </div>

          </div>

        </header>


        {/* ================= PAGE CONTENT ================= */}

        <main className="dashboard-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;