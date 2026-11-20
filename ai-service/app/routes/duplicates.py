from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.duplicate_detector import (
    detect_duplicate_requirements,
    detect_test_case_duplicate_pairs
)


router = APIRouter()


# ==========================================================
# REQUIREMENT DUPLICATE DETECTION
# ==========================================================

class RequirementInput(BaseModel):
    requirementId: str
    title: str
    text: str


class DuplicateDetectionRequest(BaseModel):
    requirements: list[RequirementInput]
    threshold: float = 0.80


@router.post("/requirements")
async def detect_duplicates(
    request: DuplicateDetectionRequest
):

    try:

        if not request.requirements:
            raise HTTPException(
                status_code=400,
                detail="At least one requirement is required."
            )

        if request.threshold < 0 or request.threshold > 1:
            raise HTTPException(
                status_code=400,
                detail="Threshold must be between 0 and 1."
            )

        requirements = [
            requirement.model_dump()
            for requirement in request.requirements
        ]

        duplicates = detect_duplicate_requirements(
            requirements,
            request.threshold
        )

        return {
            "message":
                "Duplicate requirement detection completed.",

            "totalRequirements":
                len(requirements),

            "totalDuplicates":
                len(duplicates),

            "threshold":
                request.threshold,

            "duplicates":
                duplicates
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=
                f"Duplicate detection failed: {str(error)}"
        )


# ==========================================================
# TEST CASE DUPLICATE DETECTION
# ==========================================================

class TestCaseInput(BaseModel):

    testCaseId: str

    requirementId: str

    title: str

    scenario: str = ""

    expectedResult: str = ""

    priority: str = ""

    status: str = ""


class TestCaseDuplicateDetectionRequest(BaseModel):

    testCases: list[TestCaseInput]

    threshold: float = 0.80


@router.post("/test-cases")
async def detect_test_case_duplicates(
    request: TestCaseDuplicateDetectionRequest
):

    try:

        # ------------------------------------------
        # Validate test cases
        # ------------------------------------------

        if not request.testCases:

            return {
                "message":
                    "No test cases available for duplicate detection.",

                "totalTestCases":
                    0,

                "totalDuplicates":
                    0,

                "threshold":
                    request.threshold,

                "duplicates":
                    []
            }


        # ------------------------------------------
        # Validate threshold
        # ------------------------------------------

        if (
            request.threshold < 0
            or request.threshold > 1
        ):

            raise HTTPException(
                status_code=400,
                detail=
                    "Threshold must be between 0 and 1."
            )


        # ------------------------------------------
        # Convert Pydantic models to dictionaries
        # ------------------------------------------

        test_cases = [

            test_case.model_dump()

            for test_case
            in request.testCases

        ]


        # ------------------------------------------
        # Detect duplicate test-case pairs
        # ------------------------------------------

        duplicates = (
            detect_test_case_duplicate_pairs(
                test_cases,
                request.threshold
            )
        )


        # ------------------------------------------
        # Return results
        # ------------------------------------------

        return {

            "message":
                "Duplicate test case detection completed.",

            "totalTestCases":
                len(test_cases),

            "totalDuplicates":
                len(duplicates),

            "threshold":
                request.threshold,

            "duplicates":
                duplicates
        }


    except HTTPException:
        raise


    except Exception as error:

       raise HTTPException(
    status_code=500,

    detail=
        f"Test case duplicate detection failed: {str(error)}"
)