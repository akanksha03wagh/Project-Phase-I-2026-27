import { useEffect, useState } from "react";
import API from "../services/api";

function DuplicateDetection() {
  // ==========================================================
  // REQUIREMENT DUPLICATE STATES
  // ==========================================================

  const [duplicates, setDuplicates] = useState([]);

  const [totalRequirements, setTotalRequirements] =
    useState(0);

  const [threshold, setThreshold] =
    useState(0);


  // ==========================================================
  // TEST CASE DUPLICATE STATES
  // ==========================================================

  const [testCaseDuplicates, setTestCaseDuplicates] =
    useState([]);

  const [totalTestCases, setTotalTestCases] =
    useState(0);

  const [testCaseThreshold, setTestCaseThreshold] =
    useState(0);

  const [testCaseSearch, setTestCaseSearch] =
    useState("");

  const [testCaseSimilarityFilter, setTestCaseSimilarityFilter] =
    useState("all");

  const [testCaseCurrentPage, setTestCaseCurrentPage] =
    useState(1);


  // ==========================================================
  // LOADING AND ERROR STATES
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [testCaseLoading, setTestCaseLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [testCaseError, setTestCaseError] =
    useState("");


  // ==========================================================
  // CONSTANTS
  // ==========================================================

  const TEST_CASES_PER_PAGE = 10;


  // ==========================================================
  // LOAD DUPLICATE DATA
  // ==========================================================

  useEffect(() => {
    loadDuplicates();
  }, []);


  // ==========================================================
  // RESET TEST CASE PAGE WHEN SEARCH/FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    setTestCaseCurrentPage(1);
  }, [
    testCaseSearch,
    testCaseSimilarityFilter,
  ]);


  // ==========================================================
  // LOAD REQUIREMENT + TEST CASE DUPLICATES
  // ==========================================================

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      setTestCaseLoading(true);

      setError("");
      setTestCaseError("");


      // ======================================================
      // GET SELECTED PROJECT
      // ======================================================

      const selectedProjectId =
        localStorage.getItem("selectedProjectId");


      // ======================================================
      // CHECK WHETHER A PROJECT IS SELECTED
      // ======================================================

      if (!selectedProjectId) {

        setError(
          "Please select a project first from the Projects page."
        );

        setDuplicates([]);
        setTestCaseDuplicates([]);

        setTotalRequirements(0);
        setTotalTestCases(0);

        setThreshold(0);
        setTestCaseThreshold(0);

        setLoading(false);
        setTestCaseLoading(false);

        return;
      }


      // ======================================================
      // REQUIREMENT DUPLICATE DETECTION
      // ======================================================

      try {

        const response = await API.get(
          `/duplicates?projectId=${selectedProjectId}`
        );


        setDuplicates(
          response.data.duplicates || []
        );


        setTotalRequirements(
          response.data.totalRequirements || 0
        );


        setThreshold(
          response.data.threshold || 0
        );

      } catch (error) {

        console.error(
          "Requirement duplicate detection error:",
          error
        );


        setError(
          error.response?.data?.message ||
            "Failed to detect duplicate requirements."
        );

      } finally {

        setLoading(false);

      }


      // ======================================================
      // TEST CASE DUPLICATE DETECTION
      // ======================================================

      try {

        const testCaseResponse =
          await API.get(
            `/duplicates/test-cases?projectId=${selectedProjectId}`
          );


        setTestCaseDuplicates(
          testCaseResponse.data.duplicates || []
        );


        setTotalTestCases(
          testCaseResponse.data.totalTestCases || 0
        );


        setTestCaseThreshold(
          testCaseResponse.data.threshold || 0
        );

      } catch (error) {

        console.error(
          "Test case duplicate detection error:",
          error
        );


        setTestCaseError(
          error.response?.data?.message ||
            "Failed to detect duplicate test cases."
        );

      } finally {

        setTestCaseLoading(false);

      }

    } catch (error) {

      console.error(
        "Duplicate detection error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Failed to load duplicate detection data."
      );


      setLoading(false);
      setTestCaseLoading(false);

    }
  };


  // ==========================================================
  // FILTER TEST CASE DUPLICATES
  // ==========================================================

  const filteredTestCaseDuplicates =
    testCaseDuplicates.filter((duplicate) => {

      const searchText =
        testCaseSearch
          .toLowerCase()
          .trim();


      const testCase1 =
        duplicate.testCase1;

      const testCase2 =
        duplicate.testCase2;


      const searchableText = `
        ${testCase1.testCaseId}
        ${testCase1.requirementId}
        ${testCase1.title}
        ${testCase1.scenario}
        ${testCase1.expectedResult}
        ${testCase2.testCaseId}
        ${testCase2.requirementId}
        ${testCase2.title}
        ${testCase2.scenario}
        ${testCase2.expectedResult}
      `.toLowerCase();


      const matchesSearch =
        searchText === "" ||
        searchableText.includes(searchText);


      let matchesSimilarity = true;


      // ======================================================
      // 90% AND ABOVE
      // ======================================================

      if (
        testCaseSimilarityFilter ===
        "high"
      ) {

        matchesSimilarity =
          duplicate.similarityScore >= 90;

      }


      // ======================================================
      // 80% - 89.99%
      // ======================================================

      if (
        testCaseSimilarityFilter ===
        "medium"
      ) {

        matchesSimilarity =
          duplicate.similarityScore >= 80 &&
          duplicate.similarityScore < 90;

      }


      // ======================================================
      // 75% - 79.99%
      // ======================================================

      if (
        testCaseSimilarityFilter ===
        "moderate"
      ) {

        matchesSimilarity =
          duplicate.similarityScore >= 75 &&
          duplicate.similarityScore < 80;

      }


      return (
        matchesSearch &&
        matchesSimilarity
      );

    });


  // ==========================================================
  // TEST CASE PAGINATION
  // ==========================================================

  const totalTestCasePages =
    Math.ceil(
      filteredTestCaseDuplicates.length /
        TEST_CASES_PER_PAGE
    );


  const testCaseStartIndex =
    (testCaseCurrentPage - 1) *
    TEST_CASES_PER_PAGE;


  const paginatedTestCaseDuplicates =
    filteredTestCaseDuplicates.slice(
      testCaseStartIndex,
      testCaseStartIndex +
        TEST_CASES_PER_PAGE
    );


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (
    loading &&
    testCaseLoading
  ) {

    return (
      <div className="dashboard-page duplicate-page">

        <div className="page-header">

          <div>

            <h1>
              Duplicate Detection
            </h1>

            <p>
              Identify potentially duplicate
              or highly similar requirements
              and test cases.
            </p>

          </div>

        </div>


        <div className="empty-state">

          <h3>
            Analyzing Requirements and Test Cases...
          </h3>

          <p>
            The AI engine is comparing your
            project data using semantic similarity.
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="dashboard-page duplicate-page">


      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div className="page-header">

        <div>

          <h1>
            Duplicate Detection
          </h1>

          <p>
            Identify potentially duplicate
            or highly similar requirements
            and test cases.
          </p>

        </div>


        <button
          className="refresh-btn"
          onClick={loadDuplicates}
        >

          <span className="refresh-icon">
            ↻
          </span>

          <span>
            Refresh
          </span>

        </button>

      </div>


      {/* ====================================================
          REQUIREMENT ERROR
      ==================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ====================================================
          REQUIREMENT STATISTICS
      ==================================================== */}

      {!loading &&
        !error && (

          <div className="stats-grid">

            <div className="stat-card">

              <span>
                Requirements Analyzed
              </span>

              <strong>
                {totalRequirements}
              </strong>

            </div>


            <div className="stat-card duplicate-stat">

              <span>
                Potential Duplicates
              </span>

              <strong>
                {duplicates.length}
              </strong>

            </div>


            <div className="stat-card similarity-stat">

              <span>
                Similarity Threshold
              </span>

              <strong>
                {Math.round(
                  threshold * 100
                )}
                %
              </strong>

            </div>

          </div>

        )}


      {/* ====================================================
          REQUIREMENT DUPLICATES
      ==================================================== */}

      {!loading &&
        !error &&
        duplicates.length > 0 && (

          <div className="duplicate-results">

            <div className="section-heading">

              <div>

                <h2>
                  Potential Duplicate Requirements
                </h2>

                <p>
                  Review these requirements before
                  deciding whether they represent
                  duplicate functionality.
                </p>

              </div>

            </div>


            {duplicates.map(
              (duplicate, index) => (

                <div
                  className="duplicate-card"
                  key={`${duplicate.requirement1.requirementId}-${duplicate.requirement2.requirementId}`}
                >

                  {/* CARD HEADER */}

                  <div className="duplicate-card-header">

                    <span className="duplicate-number">
                      #{index + 1}
                    </span>

                    <span className="potential-badge">
                      Potential Duplicate
                    </span>

                  </div>


                  {/* REQUIREMENT COMPARISON */}

                  <div className="duplicate-comparison">

                    {/* REQUIREMENT 1 */}

                    <div className="duplicate-requirement">

                      <div className="requirement-card-top">

                        <span className="requirement-code">

                          {
                            duplicate
                              .requirement1
                              .requirementId
                          }

                        </span>

                      </div>


                      <h3>

                        {
                          duplicate
                            .requirement1
                            .title
                        }

                      </h3>


                      <p>

                        {
                          duplicate
                            .requirement1
                            .text
                        }

                      </p>

                    </div>


                    {/* VS */}

                    <div className="duplicate-vs">

                      <span>
                        VS
                      </span>

                    </div>


                    {/* REQUIREMENT 2 */}

                    <div className="duplicate-requirement">

                      <div className="requirement-card-top">

                        <span className="requirement-code">

                          {
                            duplicate
                              .requirement2
                              .requirementId
                          }

                        </span>

                      </div>


                      <h3>

                        {
                          duplicate
                            .requirement2
                            .title
                        }

                      </h3>


                      <p>

                        {
                          duplicate
                            .requirement2
                            .text
                        }

                      </p>

                    </div>

                  </div>


                  {/* SIMILARITY */}

                  <div className="similarity-section">

                    <div className="similarity-header">

                      <span>
                        Semantic Similarity
                      </span>

                      <strong>
                        {
                          duplicate
                            .similarityScore
                        }%
                      </strong>

                    </div>


                    <div className="similarity-bar">

                      <div
                        className="similarity-fill"
                        style={{
                          width: `${Math.min(
                            duplicate.similarityScore,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}


      {/* ====================================================
          NO REQUIREMENT DUPLICATES
      ==================================================== */}

      {!loading &&
        !error &&
        duplicates.length === 0 && (

          <div className="empty-state">

            <h3>
              No Potential Duplicate Requirements Found
            </h3>

            <p>
              The AI engine did not identify any
              requirements above the configured
              similarity threshold.
            </p>

          </div>

        )}


      {/* ====================================================
          DIVIDER
      ==================================================== */}

      <div className="duplicate-section-divider">

        <span>
          TEST CASE DUPLICATE ANALYSIS
        </span>

      </div>


      {/* ====================================================
          TEST CASE ERROR
      ==================================================== */}

      {testCaseError && (
        <div className="error-message">
          {testCaseError}
        </div>
      )}


      {/* ====================================================
          TEST CASE STATISTICS
      ==================================================== */}

      {!testCaseLoading &&
        !testCaseError && (

          <div className="stats-grid">

            <div className="stat-card">

              <span>
                Test Cases Analyzed
              </span>

              <strong>
                {totalTestCases}
              </strong>

            </div>


            <div className="stat-card duplicate-stat">

              <span>
                Potential Duplicates
              </span>

              <strong>
                {testCaseDuplicates.length}
              </strong>

            </div>


            <div className="stat-card similarity-stat">

              <span>
                Similarity Threshold
              </span>

              <strong>
                {Math.round(
                  testCaseThreshold * 100
                )}
                %
              </strong>

            </div>

          </div>

        )}


      {/* ====================================================
          TEST CASE LOADING
      ==================================================== */}

      {testCaseLoading && (

        <div className="empty-state">

          <h3>
            Analyzing Test Cases...
          </h3>

          <p>
            The AI engine is comparing test cases
            using semantic similarity.
          </p>

        </div>

      )}


      {/* ====================================================
          TEST CASE DUPLICATES
      ==================================================== */}

      {!testCaseLoading &&
        !testCaseError &&
        testCaseDuplicates.length > 0 && (

          <div className="duplicate-results">

            {/* ==================================================
                SECTION HEADING
            ================================================== */}

            <div className="section-heading test-case-section-heading">

              <div>

                <h2>
                  Potential Duplicate Test Cases
                </h2>

                <p>
                  Review these test cases to determine
                  whether they represent duplicate
                  testing scenarios.
                </p>

              </div>

            </div>


            {/* ==================================================
                SEARCH + FILTER
            ================================================== */}

            <div className="test-case-controls">

              {/* SEARCH */}

              <div className="test-case-search">

                <span className="test-case-search-icon">
                  🔎
                </span>


                <input
                  type="text"
                  placeholder="Search test case ID, requirement, title..."
                  value={testCaseSearch}
                  onChange={(event) =>
                    setTestCaseSearch(
                      event.target.value
                    )
                  }
                />

              </div>


              {/* FILTER */}

              <div className="test-case-filter">

                <select
                  value={
                    testCaseSimilarityFilter
                  }
                  onChange={(event) =>
                    setTestCaseSimilarityFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="all">
                    All Similarity
                  </option>

                  <option value="high">
                    High Similarity (90%+)
                  </option>

                  <option value="medium">
                    Medium Similarity (80–89%)
                  </option>

                  <option value="moderate">
                    Moderate Similarity (75–79%)
                  </option>

                </select>

              </div>

            </div>


            {/* ==================================================
                RESULT SUMMARY
            ================================================== */}

            <div className="duplicate-result-summary">

              Showing{" "}

              <strong>
                {
                  filteredTestCaseDuplicates.length
                }
              </strong>

              {" "}potential duplicate pairs

            </div>


            {/* ==================================================
                TEST CASE CARDS
            ================================================== */}

            {paginatedTestCaseDuplicates.map(
              (duplicate, index) => (

                <div
                  className="duplicate-card test-case-duplicate-card"
                  key={`${duplicate.testCase1.testCaseId}-${duplicate.testCase2.testCaseId}-${index}`}
                >

                  {/* CARD HEADER */}

                  <div className="duplicate-card-header">

                    <span className="duplicate-number">

                      #
                      {
                        testCaseStartIndex +
                        index +
                        1
                      }

                    </span>


                    <span className="potential-badge">

                      Potential Duplicate

                    </span>

                  </div>


                  {/* ==================================================
                      TEST CASE COMPARISON
                  ================================================== */}

                  <div className="duplicate-comparison">


                    {/* ==================================================
                        TEST CASE 1
                    ================================================== */}

                    <div className="duplicate-requirement">

                      <div className="requirement-card-top">

                        <span className="requirement-code">

                          {
                            duplicate
                              .testCase1
                              .testCaseId
                          }

                        </span>

                      </div>


                      <h3>

                        {
                          duplicate
                            .testCase1
                            .title
                        }

                      </h3>


                      <p>

                        <strong>
                          Requirement:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase1
                            .requirementId
                        }

                      </p>


                      <p>

                        <strong>
                          Scenario:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase1
                            .scenario
                        }

                      </p>


                      <p>

                        <strong>
                          Expected Result:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase1
                            .expectedResult
                        }

                      </p>


                      <div className="test-case-meta">

                        <span>

                          Priority:{" "}

                          {
                            duplicate
                              .testCase1
                              .priority
                          }

                        </span>


                        <span>

                          Status:{" "}

                          {
                            duplicate
                              .testCase1
                              .status
                          }

                        </span>

                      </div>

                    </div>


                    {/* ==================================================
                        VS
                    ================================================== */}

                    <div className="duplicate-vs">

                      <span>
                        VS
                      </span>

                    </div>


                    {/* ==================================================
                        TEST CASE 2
                    ================================================== */}

                    <div className="duplicate-requirement">

                      <div className="requirement-card-top">

                        <span className="requirement-code">

                          {
                            duplicate
                              .testCase2
                              .testCaseId
                          }

                        </span>

                      </div>


                      <h3>

                        {
                          duplicate
                            .testCase2
                            .title
                        }

                      </h3>


                      <p>

                        <strong>
                          Requirement:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase2
                            .requirementId
                        }

                      </p>


                      <p>

                        <strong>
                          Scenario:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase2
                            .scenario
                        }

                      </p>


                      <p>

                        <strong>
                          Expected Result:
                        </strong>{" "}

                        {
                          duplicate
                            .testCase2
                            .expectedResult
                        }

                      </p>


                      <div className="test-case-meta">

                        <span>

                          Priority:{" "}

                          {
                            duplicate
                              .testCase2
                              .priority
                          }

                        </span>


                        <span>

                          Status:{" "}

                          {
                            duplicate
                              .testCase2
                              .status
                          }

                        </span>

                      </div>

                    </div>

                  </div>


                  {/* ==================================================
                      SIMILARITY
                  ================================================== */}

                  <div className="similarity-section">

                    <div className="similarity-header">

                      <span>
                        Semantic Similarity
                      </span>


                      <strong>

                        {
                          duplicate
                            .similarityScore
                        }%

                      </strong>

                    </div>


                    <div className="similarity-bar">

                      <div
                        className="similarity-fill"
                        style={{
                          width: `${Math.min(
                            duplicate.similarityScore,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              )
            )}


            {/* ==================================================
                NO SEARCH/FILTER RESULTS
            ================================================== */}

            {filteredTestCaseDuplicates.length ===
              0 && (

              <div className="empty-state">

                <h3>
                  No Matching Test Cases Found
                </h3>

                <p>
                  No duplicate test cases match
                  your current search or similarity
                  filter.
                </p>

              </div>

            )}


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {totalTestCasePages > 1 && (

              <div className="test-case-pagination">

                {/* PREVIOUS */}

                <button
                  className="pagination-btn"
                  disabled={
                    testCaseCurrentPage === 1
                  }
                  onClick={() =>
                    setTestCaseCurrentPage(
                      (page) => page - 1
                    )
                  }
                >

                  ← Previous

                </button>


                {/* PAGE NUMBERS */}

                <div className="pagination-pages">

                  {Array.from(
                    {
                      length:
                        totalTestCasePages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((page) => (

                    <button
                      key={page}
                      className={`pagination-page ${
                        testCaseCurrentPage ===
                        page
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setTestCaseCurrentPage(
                          page
                        )
                      }
                    >

                      {page}

                    </button>

                  ))}

                </div>


                {/* NEXT */}

                <button
                  className="pagination-btn"
                  disabled={
                    testCaseCurrentPage ===
                    totalTestCasePages
                  }
                  onClick={() =>
                    setTestCaseCurrentPage(
                      (page) => page + 1
                    )
                  }
                >

                  Next →

                </button>

              </div>

            )}

          </div>

        )}


      {/* ====================================================
          NO TEST CASE DUPLICATES
      ==================================================== */}

      {!testCaseLoading &&
        !testCaseError &&
        testCaseDuplicates.length === 0 && (

          <div className="empty-state">

            <h3>
              No Potential Duplicate Test Cases Found
            </h3>

            <p>
              The AI engine did not identify any
              test cases above the configured
              similarity threshold.
            </p>

          </div>

        )}

    </div>
  );
}

export default DuplicateDetection;