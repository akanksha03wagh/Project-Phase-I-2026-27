from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from app.services.test_case_generator import generate_test_cases
from app.services.duplicate_detector import detect_duplicate_test_cases


router = APIRouter()


class TestCaseGenerationRequest(BaseModel):
    requirementId: str
    requirementText: str

    # Existing test cases from MongoDB
    existingTestCases: List[Dict[str, Any]] = Field(
        default_factory=list
    )


@router.post("/generate")
async def generate_test_cases_endpoint(
    request: TestCaseGenerationRequest
):

    try:

        # ------------------------------------------
        # Validate requirement ID
        # ------------------------------------------

        if not request.requirementId.strip():
            raise HTTPException(
                status_code=400,
                detail="Requirement ID is required."
            )


        # ------------------------------------------
        # Validate requirement text
        # ------------------------------------------

        if not request.requirementText.strip():
            raise HTTPException(
                status_code=400,
                detail="Requirement text is required."
            )


        # ------------------------------------------
        # Generate new test cases using AI
        # ------------------------------------------

        generated_test_cases = generate_test_cases(
            request.requirementId,
            request.requirementText,
            request.existingTestCases
        )


        # ------------------------------------------
        # Remove duplicate test cases
        # ------------------------------------------

        unique_test_cases = detect_duplicate_test_cases(
            request.existingTestCases,
            generated_test_cases,
            threshold=0.80
        )


        # ------------------------------------------
        # Check if all generated cases were duplicates
        # ------------------------------------------

        if not unique_test_cases:

            return {
                "message":
                    "AI generated test cases, but all generated "
                    "cases were duplicates of existing test cases.",

                "requirementId":
                    request.requirementId,

                "generatedTestCases":
                    len(generated_test_cases),

                "totalTestCases":
                    0,

                "testCases":
                    []
            }


        # ------------------------------------------
        # Return only unique test cases
        # ------------------------------------------

        return {
            "message":
                "Unique test cases generated successfully.",

            "requirementId":
                request.requirementId,

            "generatedTestCases":
                len(generated_test_cases),

            "totalTestCases":
                len(unique_test_cases),

            "removedDuplicates":
                len(generated_test_cases) -
                len(unique_test_cases),

            "testCases":
                unique_test_cases
        }


    except HTTPException:
        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=
                f"Test case generation failed: {str(error)}"
        )