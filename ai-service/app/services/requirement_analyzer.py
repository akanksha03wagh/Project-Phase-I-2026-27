import re


# Words that commonly indicate functional requirements
FUNCTIONAL_KEYWORDS = [
    "shall",
    "must",
    "should",
    "allow",
    "enable",
    "provide",
    "create",
    "delete",
    "update",
    "register",
    "login",
    "authenticate",
    "display",
    "send",
    "upload",
    "download",
    "search",
    "book",
    "cancel",
    "view",
    "manage",
    "submit",
    "access",
    "receive",
    "generate",
]


# Words that commonly indicate non-functional requirements
NON_FUNCTIONAL_KEYWORDS = [
    "performance",
    "response time",
    "seconds",
    "milliseconds",
    "availability",
    "reliability",
    "security",
    "scalability",
    "usability",
    "maintainability",
    "concurrent",
    "uptime",
    "encryption",
    "secure",
]


# Patterns used to identify real requirement IDs
REQUIREMENT_ID_PATTERNS = [
    r"\bFR-\d+\b",
    r"\bNFR-\d+\b",
    r"\bF-\d+\b",
    r"\bNF-\d+\b",
]


def normalize_text(text):
    """
    Clean extracted PDF text.
    """

    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n+", "\n", text)

    return text.strip()


def is_table_of_contents(text):
    """
    Detect common Table of Contents content.
    """

    text_lower = text.lower()

    toc_keywords = [
        "table of contents",
        "contents",
        "1 introduction",
        "2 overall description",
        "3 user roles",
        "4 functional requirements",
        "5 non-functional requirements",
    ]

    matches = sum(
        1
        for keyword in toc_keywords
        if keyword in text_lower
    )

    return matches >= 2


def is_section_heading(text):
    """
    Detect common SRS section headings.
    """

    text_lower = text.lower().strip()

    headings = [
        "introduction",
        "purpose",
        "scope",
        "overall description",
        "product functions",
        "user roles",
        "functional requirements",
        "non-functional requirements",
        "business rules",
        "validation rules",
        "external interface requirements",
        "data requirements",
        "security and privacy",
        "reports and notifications",
        "constraints and assumptions",
        "acceptance criteria",
    ]

    return text_lower in headings


def contains_requirement_id(text):
    """
    Check whether the text contains a requirement ID.
    """

    for pattern in REQUIREMENT_ID_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def extract_requirement_id(text):
    """
    Extract FR-001 / NFR-001 etc.
    """

    for pattern in REQUIREMENT_ID_PATTERNS:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return match.group(0).upper()

    return None


def classify_requirement(text, requirement_id=None):
    """
    Classify requirement as Functional or Non-Functional.
    """

    text_lower = text.lower()

    # Requirement ID is the strongest indicator
    if requirement_id:

        if requirement_id.upper().startswith(
            ("NFR-", "NF-")
        ):
            return "Non-Functional"

        if requirement_id.upper().startswith(
            ("FR-", "F-")
        ):
            return "Functional"

    # Otherwise check non-functional keywords
    for keyword in NON_FUNCTIONAL_KEYWORDS:

        if keyword in text_lower:
            return "Non-Functional"

    return "Functional"


def clean_requirement_text(text, requirement_id=None):
    """
    Remove requirement ID and clean unnecessary whitespace.
    """

    text = text.strip()

    if requirement_id:

        text = re.sub(
            rf"\b{re.escape(requirement_id)}\b",
            "",
            text,
            count=1,
            flags=re.IGNORECASE
        )

    # Remove repeated spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip(" :-")


def split_requirement_title(text):
    """
    Separate requirement title from requirement description.

    Example:

    Input:
    User Registration The system shall allow a student to register.

    Output:
    Title:
    User Registration

    Description:
    The system shall allow a student to register.
    """

    action_patterns = [
        r"\bthe system shall\b",
        r"\bthe system must\b",
        r"\bthe system should\b",
        r"\bthe application shall\b",
        r"\bthe application must\b",
        r"\bthe application should\b",
        r"\busers shall\b",
        r"\busers must\b",
        r"\busers should\b",
        r"\badministrators shall\b",
        r"\badministrators must\b",
        r"\badministrators should\b",
    ]

    for pattern in action_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            title = text[:match.start()].strip()

            description = text[
                match.start():
            ].strip()

            # Remove unnecessary punctuation
            title = title.strip(" :-.")

            if not title:
                title = "Requirement"

            return title, description

    # Fallback:
    # If no common action phrase is found,
    # use the first few words as the title.
    words = text.split()

    if len(words) > 8:

        title = " ".join(words[:6])

        description = " ".join(words[6:])

        return title, description

    return "Requirement", text


def extract_requirements_from_lines(text):
    """
    Extract requirements based on FR/NFR identifiers.
    """

    text = normalize_text(text)

    # Find all FR/NFR identifiers
    matches = list(
        re.finditer(
            r"\b(?:FR|NFR|F|NF)-\d+\b",
            text,
            re.IGNORECASE
        )
    )

    requirements = []

    for index, match in enumerate(matches):

        requirement_id = match.group(0).upper()

        start = match.start()

        if index + 1 < len(matches):
            end = matches[index + 1].start()
        else:
            end = len(text)

        block = text[start:end].strip()

        # Remove the ID
        requirement_text = clean_requirement_text(
            block,
            requirement_id
        )

        # Ignore very short blocks
        if len(requirement_text) < 10:
            continue

        # Ignore obvious headings
        if is_section_heading(requirement_text):
            continue

        requirement_type = classify_requirement(
            requirement_text,
            requirement_id
        )

        # Separate title and description
        title, description = split_requirement_title(
            requirement_text
        )

        requirements.append(
            {
                "id": requirement_id,
                "title": title,
                "text": description,
                "type": requirement_type,
            }
        )

    return requirements


def split_into_sentences(text):
    """
    Split text into sentences.
    """

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text
    )

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def analyze_requirements(text):
    """
    Main requirement analysis function.

    First attempts to find explicit FR/NFR IDs.

    If none are found, uses keyword-based detection.
    """

    # -----------------------------------------
    # Method 1: Explicit FR/NFR IDs
    # -----------------------------------------

    requirements = extract_requirements_from_lines(
        text
    )

    if requirements:
        return requirements


    # -----------------------------------------
    # Method 2: Fallback keyword analysis
    # -----------------------------------------

    sentences = split_into_sentences(text)

    requirements = []

    requirement_number = 1

    for sentence in sentences:

        sentence_lower = sentence.lower()

        # Ignore very short sentences
        if len(sentence) < 20:
            continue

        # Ignore Table of Contents
        if "table of contents" in sentence_lower:
            continue

        # Ignore common section headings
        if is_section_heading(sentence):
            continue

        is_requirement = False

        # Check functional keywords
        for keyword in FUNCTIONAL_KEYWORDS:

            if keyword in sentence_lower:

                is_requirement = True
                break

        # Check non-functional keywords
        if not is_requirement:

            for keyword in NON_FUNCTIONAL_KEYWORDS:

                if keyword in sentence_lower:

                    is_requirement = True
                    break

        if not is_requirement:
            continue

        requirement_type = classify_requirement(
            sentence
        )

        # Separate title and description
        title, description = split_requirement_title(
            sentence
        )

        requirements.append(
            {
                "id": f"REQ-{requirement_number:03d}",
                "title": title,
                "text": description,
                "type": requirement_type,
            }
        )

        requirement_number += 1

    return requirements