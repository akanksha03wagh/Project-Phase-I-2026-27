from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import tempfile

from app.services.document_extractor import extract_text
from app.services.requirement_analyzer import analyze_requirements

router = APIRouter()


@router.post("/extract")
async def extract_document(
    file: UploadFile = File(...)
):

    allowed_extensions = [".pdf", ".docx", ".txt"]

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported."
        )

    try:

        file_content = await file.read()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(file_content)

            temp_file_path = temp_file.name

        extracted_text = extract_text(
            temp_file_path,
            extension
        )

        Path(temp_file_path).unlink(
            missing_ok=True
        )

        return {
            "message": "Document text extracted successfully.",
            "filename": file.filename,
            "character_count": len(extracted_text),
            "text": extracted_text
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Text extraction failed: {str(error)}"
        )

@router.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...)
):

    allowed_extensions = [".pdf", ".docx", ".txt"]

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported."
        )

    try:

        file_content = await file.read()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(file_content)

            temp_file_path = temp_file.name

        # Step 1: Extract text
        extracted_text = extract_text(
            temp_file_path,
            extension
        )

        # Step 2: Analyze requirements
        requirements = analyze_requirements(
            extracted_text
        )

        Path(temp_file_path).unlink(
            missing_ok=True
        )

        return {
            "message": "Requirements analyzed successfully.",
            "filename": file.filename,
            "total_requirements": len(requirements),
            "requirements": requirements
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Requirement analysis failed: {str(error)}"
        )