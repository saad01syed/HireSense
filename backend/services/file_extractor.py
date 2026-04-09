import io
import pdfplumber
from docx import Document


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    text_parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
    return "\n".join(text_parts).strip()


def extract_resume_text(filename: str, file_bytes: bytes) -> str:
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)

    if lower_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)

    raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")