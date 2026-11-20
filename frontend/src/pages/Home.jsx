import Navbar from "../components/Navbar";
import {
  FaRobot,
  FaFileAlt,
  FaBrain,
  FaLink,
  FaChartBar,
  FaDownload,
  FaHistory,
  FaArrowRight,
  FaUpload
} from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  const features = [
    {
      icon: <FaBrain />,
      title: "AI Test Generation",
      text: "Generate structured functional test cases from software requirements."
    },
    {
      icon: <FaLink />,
      title: "Requirement Traceability",
      text: "Connect every generated test case with its source requirement."
    },
    {
      icon: <FaChartBar />,
      title: "Coverage Analysis",
      text: "Identify requirements that are missing or insufficiently tested."
    },
    {
      icon: <FaFileAlt />,
      title: "SRS Analysis",
      text: "Extract and classify requirements from PDF, DOCX and TXT files."
    },
    {
      icon: <FaDownload />,
      title: "Reports & Export",
      text: "Export your reviewed test cases and analysis reports."
    },
    {
      icon: <FaHistory />,
      title: "Project History",
      text: "Keep your previous SRS analysis and generated test cases organized."
    }
  ];

  return (
    <div className="home-page">

      <Navbar />

      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            <FaRobot />
            Intelligent Software Testing
          </div>

          <h1>
            Turn Software Requirements
            <br />
            Into <span>Test Cases with AI</span>
          </h1>

          <p>
            Upload your Software Requirements Specification and let
            TestGen AI analyze requirements, generate functional test
            cases, and maintain requirement traceability.
          </p>

          <div className="hero-buttons">

            <a href="/register" className="primary-button">
              <FaUpload />
              Get Started
            </a>

            <a href="#how-it-works" className="secondary-button">
              How It Works
              <FaArrowRight />
            </a>

          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Powered Analysis</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Requirement Traceability</span>
            </div>

            <div>
              <strong>PDF</strong>
              <span>DOCX & TXT Support</span>
            </div>
          </div>

        </div>

        <div className="hero-visual">

          <div className="visual-glow"></div>

          <div className="ai-card">

            <div className="ai-card-header">
              <div className="robot-circle">
                <FaRobot />
              </div>

              <div>
                <strong>TestGen AI</strong>
                <span>Requirement Analyzer</span>
              </div>
            </div>

            <div className="srs-document">
              <div className="document-title">
                <FaFileAlt />
                SRS Document
              </div>

              <div className="document-line large"></div>
              <div className="document-line"></div>
              <div className="document-line"></div>

              <div className="analysis-status">
                <FaBrain />
                AI Analysis Complete
              </div>
            </div>

            <div className="generated-card">
              <span>Generated Test Cases</span>
              <strong>24</strong>
            </div>

          </div>

        </div>

      </section>

    {/* PRODUCT WORKFLOW */}

<section className="product-workflow">

  <div className="section-heading">

    <span>INTELLIGENT TESTING WORKFLOW</span>

    <h2>
      From Requirements to Reliable Test Cases
    </h2>

    <p>
      TestGen AI combines requirement analysis,
      NLP processing and AI-assisted test generation
      into one connected workflow.
    </p>

  </div>

  <div className="workflow-cards">

    <div className="workflow-card">
      <div className="workflow-icon">01</div>
      <h3>Requirements</h3>
      <p>
        Upload your SRS document and extract
        software requirements.
      </p>
    </div>

    <div className="workflow-arrow">→</div>

    <div className="workflow-card">
      <div className="workflow-icon">02</div>
      <h3>NLP Analysis</h3>
      <p>
        Analyze and classify requirements
        using NLP techniques.
      </p>
    </div>

    <div className="workflow-arrow">→</div>

    <div className="workflow-card">
      <div className="workflow-icon">03</div>
      <h3>AI Generation</h3>
      <p>
        Generate structured functional
        test cases using AI.
      </p>
    </div>

    <div className="workflow-arrow">→</div>

    <div className="workflow-card">
      <div className="workflow-icon">04</div>
      <h3>Coverage</h3>
      <p>
        Track traceability, coverage
        and testing gaps.
      </p>
    </div>

  </div>

</section>

      {/* FEATURES */}
      <section className="features-section" id="features">

        <div className="section-heading">
          <span>POWERFUL FEATURES</span>
          <h2>Everything You Need for Smarter Testing</h2>
          <p>
            Analyze requirements, generate test cases and monitor
            test coverage from one intelligent platform.
          </p>
        </div>

        <div className="features-grid">

          {features.map((feature, index) => (
            <div className="feature-card" key={index}>

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>

            </div>
          ))}

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="workflow-section" id="how-it-works">

        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>From SRS to Test Cases in Simple Steps</h2>
        </div>

        <div className="workflow">

          <div className="workflow-step">
            <div className="step-number">01</div>
            <FaUpload />
            <h3>Upload SRS</h3>
            <p>Upload your PDF, DOCX or TXT requirement document.</p>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">02</div>
            <FaBrain />
            <h3>AI Analysis</h3>
            <p>Our NLP pipeline extracts and analyzes requirements.</p>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">03</div>
            <FaRobot />
            <h3>Generate Tests</h3>
            <p>AI generates structured functional test cases.</p>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">04</div>
            <FaChartBar />
            <h3>Review & Export</h3>
            <p>Review coverage and export your final test cases.</p>
          </div>

        </div>

      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">

        <div>
          <span>ABOUT TESTGEN AI</span>
          <h2>Smarter Requirement Analysis for Modern Software Teams</h2>
        </div>

        <p>
          TestGen AI combines Natural Language Processing, semantic
          analysis and Large Language Models to assist software teams
          in converting requirements into structured test cases.
          Generated test cases remain reviewable and editable so that
          human testers remain part of the validation process.
        </p>

      </section>

      <footer className="footer">
        <div>
          <strong>TestGen AI</strong>
          <span>AI-Powered Software Testing</span>
        </div>

        <p>© 2026 TestGen AI. Final Year Project.</p>
      </footer>

    </div>
  );
}

export default Home;