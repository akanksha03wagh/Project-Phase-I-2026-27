import json
import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-6-luna")


if not API_KEY:
    raise ValueError(
        "OPENAI_API_KEY is missing from the .env file."
    )


client = OpenAI(api_key=API_KEY)


def generate_test_cases(
    requirement_id,
    requirement_text,
    existing_test_cases=None
):

    if existing_test_cases is None:
        existing_test_cases = []


    # ------------------------------------------
    # Prepare existing test cases for the prompt
    # ------------------------------------------

    if existing_test_cases:

        existing_cases_text = ""

        for index, test_case in enumerate(
            existing_test_cases,
            start=1
        ):

            existing_cases_text += f"""
Existing Test Case {index}:

ID:
{test_case.get("testCaseId", "")}

Title:
{test_case.get("title", "")}

Scenario:
{test_case.get("scenario", "")}

Preconditions:
{test_case.get("preconditions", "")}

Steps:
{json.dumps(test_case.get("steps", []), indent=2)}

Expected Result:
{test_case.get("expectedResult", "")}

Priority:
{test_case.get("priority", "Medium")}

Source:
{test_case.get("source", "")}

----------------------------------------
"""

    else:

        existing_cases_text = """
There are currently no existing test cases
for this requirement.

Generate the initial set of test cases.
"""


    # ------------------------------------------
    # Build AI prompt
    # ------------------------------------------

    prompt = f"""
You are an expert software testing engineer.

Your task is to generate high-quality functional
test cases from the software requirement provided below.

IMPORTANT:

This request may be an initial generation OR a request
to generate ADDITIONAL test cases.

You must carefully study the existing test cases before
creating new ones.

==================================================
REQUIREMENT
==================================================

Requirement ID:
{requirement_id}

Requirement:
{requirement_text}


==================================================
EXISTING TEST CASES
==================================================

{existing_cases_text}


==================================================
GENERATION RULES
==================================================

Generate between 4 and 8 test cases.

Every generated test case MUST directly relate to
the requirement.

The requirement is the primary source of truth.

Do NOT invent functionality that is not supported
by the requirement.

Cover relevant scenarios such as:

1. Positive scenarios
2. Negative scenarios
3. Invalid input
4. Missing required input
5. Boundary conditions when applicable
6. Validation scenarios
7. Security-related validation when applicable

Only include scenarios that make sense for this
specific requirement.


==================================================
IMPORTANT: ADDITIONAL TEST CASE GENERATION
==================================================

If existing test cases are provided above, you are
generating ADDITIONAL test cases.

DO NOT repeat an existing test case.

DO NOT create a test case with the same or nearly
identical:

- Title
- Scenario
- Testing objective
- Input condition
- Expected behavior

Do not simply rewrite an existing test case using
different wording.

Each new test case must provide a meaningfully
different testing perspective.

For example, if an existing test case already verifies
a valid login, do not create another test case that
also verifies the same valid login behavior.

Instead, if supported by the requirement, consider
different relevant aspects such as:

- Invalid credentials
- Missing fields
- Boundary values
- Input validation
- Error handling
- Security validation

Only generate these if they are actually relevant
to the requirement.


==================================================
QUALITY REQUIREMENTS
==================================================

Each test case must contain:

- A clear title
- A specific scenario
- Relevant preconditions
- Clear step-by-step actions
- A specific expected result
- A priority

Steps must be actionable and logically ordered.

Expected results must describe observable system
behavior.

Do not include explanations outside the JSON.


==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

The JSON must have exactly this structure:

{{
    "testCases": [
        {{
            "title": "Test case title",
            "scenario": "Test scenario",
            "preconditions": "Required preconditions",
            "steps": [
                "Step 1",
                "Step 2",
                "Step 3"
            ],
            "expectedResult": "Expected system behavior",
            "priority": "High"
        }}
    ]
}}

Priority must be exactly one of:

High
Medium
Low
"""


    # ------------------------------------------
    # Call OpenAI
    # ------------------------------------------

    response = client.responses.create(
        model=MODEL,
        input=prompt
    )


    output_text = response.output_text.strip()


    # ------------------------------------------
    # Parse JSON
    # ------------------------------------------

    try:

        result = json.loads(output_text)

    except json.JSONDecodeError as error:

        raise ValueError(
            f"LLM returned invalid JSON: {error}"
        )


    generated_cases = result.get(
        "testCases",
        []
    )


    if not generated_cases:

        raise ValueError(
            "LLM did not generate any test cases."
        )


    # ------------------------------------------
    # Prepare response
    # ------------------------------------------

    test_cases = []


    for index, test_case in enumerate(
        generated_cases,
        start=1
    ):

        test_cases.append(
            {
                "testCaseId":
                    f"{requirement_id}-TC-{index:03d}",

                "requirementId":
                    requirement_id,

                "title":
                    test_case.get(
                        "title",
                        f"Test Case {index}"
                    ),

                "scenario":
                    test_case.get(
                        "scenario",
                        ""
                    ),

                "preconditions":
                    test_case.get(
                        "preconditions",
                        ""
                    ),

                "steps":
                    test_case.get(
                        "steps",
                        []
                    ),

                "expectedResult":
                    test_case.get(
                        "expectedResult",
                        ""
                    ),

                "priority":
                    test_case.get(
                        "priority",
                        "Medium"
                    ),

                "status":
                    "Not Executed",

                "source":
                    "AI Generated"
            }
        )


    return test_cases