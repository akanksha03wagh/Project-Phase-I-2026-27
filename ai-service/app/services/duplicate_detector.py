from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load the NLP model once when the service starts
model = SentenceTransformer("all-MiniLM-L6-v2")


# ==========================================================
# REQUIREMENT DUPLICATE DETECTION
# ==========================================================

def detect_duplicate_requirements(
    requirements,
    threshold=0.80
):
    """
    Detect semantically similar/duplicate requirements.

    requirements format:
    [
        {
            "requirementId": "FR-001",
            "title": "User Login",
            "text": "The system shall allow users to log in."
        }
    ]
    """

    if not requirements:
        return []

    # ------------------------------------------
    # Combine title and requirement text
    # ------------------------------------------

    texts = []

    for requirement in requirements:

        title = requirement.get(
            "title",
            ""
        )

        text = requirement.get(
            "text",
            ""
        )

        combined_text = (
            f"{title}. {text}"
        )

        texts.append(
            combined_text
        )

    # ------------------------------------------
    # Generate embeddings
    # ------------------------------------------

    embeddings = model.encode(
        texts
    )

    # ------------------------------------------
    # Calculate cosine similarity
    # ------------------------------------------

    similarity_matrix = cosine_similarity(
        embeddings
    )

    duplicate_pairs = []

    # ------------------------------------------
    # Find duplicate pairs
    # ------------------------------------------

    for i in range(
        len(requirements)
    ):

        for j in range(
            i + 1,
            len(requirements)
        ):

            similarity_score = float(
                similarity_matrix[i][j]
            )

            if similarity_score >= threshold:

                requirement_a = (
                    requirements[i]
                )

                requirement_b = (
                    requirements[j]
                )

                duplicate_pairs.append({

                    "requirement1": {

                        "requirementId":
                            requirement_a.get(
                                "requirementId"
                            ),

                        "title":
                            requirement_a.get(
                                "title"
                            ),

                        "text":
                            requirement_a.get(
                                "text"
                            )
                    },

                    "requirement2": {

                        "requirementId":
                            requirement_b.get(
                                "requirementId"
                            ),

                        "title":
                            requirement_b.get(
                                "title"
                            ),

                        "text":
                            requirement_b.get(
                                "text"
                            )
                    },

                    "similarityScore":
                        round(
                            similarity_score * 100,
                            2
                        ),

                    "status":
                        "Potential Duplicate"
                })

    # ------------------------------------------
    # Highest similarity first
    # ------------------------------------------

    duplicate_pairs.sort(
        key=lambda item:
            item["similarityScore"],
        reverse=True
    )

    return duplicate_pairs


# ==========================================================
# TEST CASE TEXT BUILDER
# ==========================================================

def build_test_case_text(
    test_case
):
    """
    Creates a combined text representation
    of a test case for semantic comparison.
    """

    title = test_case.get(
        "title",
        ""
    )

    scenario = test_case.get(
        "scenario",
        ""
    )

    expected_result = test_case.get(
        "expectedResult",
        ""
    )

    return (
        f"{title}. "
        f"{scenario}. "
        f"{expected_result}"
    )


# ==========================================================
# TEST CASE DUPLICATE PAIR DETECTION
# ==========================================================

def detect_test_case_duplicate_pairs(
    test_cases,
    threshold=0.80
):
    """
    Detect semantically similar/duplicate test cases.

    This function is used by the Duplicate Detection page.

    Unlike detect_duplicate_test_cases(), this function
    does NOT remove anything.

    It compares every test case with every other test case
    and returns potential duplicate pairs.

    Example result:

    [
        {
            "testCase1": {...},
            "testCase2": {...},
            "similarityScore": 86.42,
            "status": "Potential Duplicate"
        }
    ]
    """

    if not test_cases:
        return []

    if len(test_cases) < 2:
        return []

    # ------------------------------------------
    # Build text for every test case
    # ------------------------------------------

    texts = []

    for test_case in test_cases:

        combined_text = build_test_case_text(
            test_case
        )

        texts.append(
            combined_text
        )

    # ------------------------------------------
    # Generate embeddings
    # ------------------------------------------

    embeddings = model.encode(
        texts
    )

    # ------------------------------------------
    # Calculate similarity matrix
    # ------------------------------------------

    similarity_matrix = cosine_similarity(
        embeddings
    )

    duplicate_pairs = []

    # ------------------------------------------
    # Compare every unique pair
    # ------------------------------------------

    for i in range(
        len(test_cases)
    ):

        for j in range(
            i + 1,
            len(test_cases)
        ):

            similarity_score = float(
                similarity_matrix[i][j]
            )

            # Only include pairs above threshold
            if similarity_score >= threshold:

                test_case_a = (
                    test_cases[i]
                )

                test_case_b = (
                    test_cases[j]
                )

                duplicate_pairs.append({

                    "testCase1": {

                        "testCaseId":
                            test_case_a.get(
                                "testCaseId"
                            ),

                        "requirementId":
                            test_case_a.get(
                                "requirementId"
                            ),

                        "title":
                            test_case_a.get(
                                "title"
                            ),

                        "scenario":
                            test_case_a.get(
                                "scenario"
                            ),

                        "expectedResult":
                            test_case_a.get(
                                "expectedResult"
                            ),

                        "priority":
                            test_case_a.get(
                                "priority"
                            ),

                        "status":
                            test_case_a.get(
                                "status"
                            )
                    },

                    "testCase2": {

                        "testCaseId":
                            test_case_b.get(
                                "testCaseId"
                            ),

                        "requirementId":
                            test_case_b.get(
                                "requirementId"
                            ),

                        "title":
                            test_case_b.get(
                                "title"
                            ),

                        "scenario":
                            test_case_b.get(
                                "scenario"
                            ),

                        "expectedResult":
                            test_case_b.get(
                                "expectedResult"
                            ),

                        "priority":
                            test_case_b.get(
                                "priority"
                            ),

                        "status":
                            test_case_b.get(
                                "status"
                            )
                    },

                    "similarityScore":
                        round(
                            similarity_score * 100,
                            2
                        ),

                    "status":
                        "Potential Duplicate"
                })

    # ------------------------------------------
    # Highest similarity first
    # ------------------------------------------

    duplicate_pairs.sort(
        key=lambda item:
            item["similarityScore"],
        reverse=True
    )

    return duplicate_pairs


# ==========================================================
# TEST CASE DUPLICATE PREVENTION
# ==========================================================

def detect_duplicate_test_cases(
    existing_test_cases,
    new_test_cases,
    threshold=0.80
):
    """
    Remove semantically duplicate test cases.

    existing_test_cases:
        Test cases already stored in MongoDB.

    new_test_cases:
        Newly generated test cases from the AI.

    A new test case is rejected when it is
    semantically similar to an existing test case
    or another newly generated test case.
    """

    if not new_test_cases:
        return []

    # ------------------------------------------
    # Prepare existing test cases
    # ------------------------------------------

    existing_texts = [

        build_test_case_text(
            test_case
        )

        for test_case
        in existing_test_cases

    ]

    # ------------------------------------------
    # Prepare new test cases
    # ------------------------------------------

    new_texts = [

        build_test_case_text(
            test_case
        )

        for test_case
        in new_test_cases

    ]

    # ------------------------------------------
    # Generate embeddings for existing cases
    # ------------------------------------------

    if existing_texts:

        existing_embeddings = model.encode(
            existing_texts
        )

    else:

        existing_embeddings = None

    # ------------------------------------------
    # Store accepted unique test cases
    # ------------------------------------------

    unique_test_cases = []

    unique_embeddings = []

    # ------------------------------------------
    # Check each newly generated test case
    # ------------------------------------------

    for index, new_test_case in enumerate(
        new_test_cases
    ):

        new_text = new_texts[index]

        # Ignore completely empty test cases
        if not new_text.strip():
            continue

        # --------------------------------------
        # Generate embedding for new case
        # --------------------------------------

        new_embedding = model.encode(
            [new_text]
        )[0]

        is_duplicate = False

        # --------------------------------------
        # Compare with existing test cases
        # --------------------------------------

        if existing_embeddings is not None:

            similarity_scores = (
                cosine_similarity(
                    [new_embedding],
                    existing_embeddings
                )[0]
            )

            highest_similarity = float(
                max(similarity_scores)
            )

            if (
                highest_similarity
                >= threshold
            ):

                print(
                    "Duplicate test case "
                    "detected against existing "
                    "test case. "
                    f"Similarity: "
                    f"{highest_similarity:.2f}"
                )

                is_duplicate = True

        # --------------------------------------
        # Skip if duplicate
        # --------------------------------------

        if is_duplicate:
            continue

        # --------------------------------------
        # Compare with already accepted
        # newly generated cases
        # --------------------------------------

        if unique_embeddings:

            similarity_scores = (
                cosine_similarity(
                    [new_embedding],
                    unique_embeddings
                )[0]
            )

            highest_similarity = float(
                max(similarity_scores)
            )

            if (
                highest_similarity
                >= threshold
            ):

                print(
                    "Duplicate generated "
                    "test case detected. "
                    f"Similarity: "
                    f"{highest_similarity:.2f}"
                )

                continue

        # --------------------------------------
        # Test case is unique
        # --------------------------------------

        unique_test_cases.append(
            new_test_case
        )

        unique_embeddings.append(
            new_embedding
        )

    # ------------------------------------------
    # Return only unique test cases
    # ------------------------------------------

    return unique_test_cases