from fastapi import FastAPI

from app.routes.extraction import router as extraction_router
from app.routes.test_cases import router as test_cases_router
from app.routes.duplicates import router as duplicates_router

app = FastAPI(
    title="TestGen AI Service",
    description="AI service for software requirement analysis and test case generation.",
    version="1.0.0"
)


app.include_router(
    extraction_router,
    prefix="/api/extraction",
    tags=["Document Extraction"]
)

app.include_router(
    test_cases_router,
    prefix="/api/test-cases",
    tags=["Test Case Generation"]
)

app.include_router(
    duplicates_router,
    prefix="/api/duplicates",
    tags=["Duplicate Detection"]
)

@app.get("/")
def root():
    return {
        "message": "TestGen AI Service is running!"
    }