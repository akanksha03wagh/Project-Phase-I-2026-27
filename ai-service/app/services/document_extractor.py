import pymupdf
from docx import Document


def extract_from_pdf(file_path):
    text = ""

    document = pymupdf.open(file_path)

    for page in document:
        text += page.get_text()

    document.close()

    return text


def extract_from_docx(file_path):
    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text.strip())

    return "\n".join(paragraphs)


def extract_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()


def extract_text(file_path, file_extension):

    extension = file_extension.lower()

    if extension == ".pdf":
        return extract_from_pdf(file_path)

    elif extension == ".docx":
        return extract_from_docx(file_path)

    elif extension == ".txt":
        return extract_from_txt(file_path)

    else:
        raise ValueError(
            "Unsupported file format. "
            "Only PDF, DOCX and TXT are supported."
        )