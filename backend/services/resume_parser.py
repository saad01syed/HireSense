import re
from data.skills_keywords import SKILLS_KEYWORDS


SECTION_HEADERS = {
    "education": ["education", "academic background", "academics"],
    "experience": ["experience", "work experience", "professional experience", "employment"],
    "projects": ["projects", "personal projects", "academic projects"],
    "skills": ["skills", "technical skills", "core skills"],
    "leadership": [
        "leadership",
        "leadership/professional development",
        "professional development",
        "leadership experience",
        "leadership & professional development",
        "leadership / professional development",
    ],
}

ADDITIONAL_STOP_HEADERS = {
    "activities",
    "certifications",
    "awards",
    "volunteer",
    "volunteering",
    "organizations",
    "extracurriculars",
    "summary",
    "objective",
    "interests",
    "publications",
}

MONTH_PATTERN = re.compile(
    r"\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b",
    re.IGNORECASE,
)

DATE_PATTERN = re.compile(r"\b(19|20)\d{2}\b", re.IGNORECASE)
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN = re.compile(r"(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})")
BULLET_PREFIX_PATTERN = re.compile(r"^[•●▪◦■□◆◇\-*]+\s*")
MULTISPACE_PATTERN = re.compile(r"\s+")


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\t", " ")
    text = re.sub(r"[ \u00A0]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_line(line: str) -> str:
    line = line.replace("—", "-").replace("–", "-")
    line = MULTISPACE_PATTERN.sub(" ", line.strip())
    return line


def canonicalize_header(text: str) -> str:
    value = normalize_line(text).lower()
    value = value.replace("&", "and")
    value = re.sub(r"\s*/\s*", "/", value)
    value = re.sub(r"\s*:\s*$", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


ALL_KNOWN_HEADERS = {
    canonicalize_header(header)
    for headers in SECTION_HEADERS.values()
    for header in headers
}

CANONICAL_STOP_HEADERS = {canonicalize_header(header) for header in ADDITIONAL_STOP_HEADERS}


def clean_bullet_text(line: str) -> str:
    line = BULLET_PREFIX_PATTERN.sub("", line.strip())
    line = MULTISPACE_PATTERN.sub(" ", line)
    return line.strip(" -–—|")


def normalize_phone(phone: str | None) -> str | None:
    if not phone:
        return None

    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]

    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return phone.strip()


def normalize_name(name: str | None) -> str | None:
    if not name:
        return None

    cleaned = MULTISPACE_PATTERN.sub(" ", name).strip()
    if not cleaned:
        return None

    parts = cleaned.split()
    normalized_parts = []
    for part in parts:
        if len(part) <= 3 and part.isupper():
            normalized_parts.append(part)
        else:
            normalized_parts.append(part.capitalize())

    return " ".join(normalized_parts)


def extract_email(text: str) -> str | None:
    match = EMAIL_PATTERN.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = PHONE_PATTERN.search(text)
    return normalize_phone(match.group(0)) if match else None


def extract_name(text: str) -> str | None:
    lines = [normalize_line(line) for line in text.splitlines() if line.strip()]

    for line in lines[:6]:
        canonical = canonicalize_header(line)

        if "resume" in canonical:
            continue
        if "@" in line or re.search(r"\d", line):
            continue
        if len(line.split()) < 2 or len(line.split()) > 4:
            continue
        if canonical in ALL_KNOWN_HEADERS or canonical in CANONICAL_STOP_HEADERS:
            continue
        return normalize_name(line)

    return None


def extract_skills(text: str) -> list[str]:
    lowered_text = text.lower()
    found_skills: list[str] = []

    for skill in SKILLS_KEYWORDS:
        if skill.lower() in lowered_text:
            found_skills.append(skill)

    return sorted({skill.strip() for skill in found_skills if skill.strip()}, key=str.lower)


def is_section_header(line: str, possible_headers: list[str]) -> bool:
    normalized = canonicalize_header(line)
    return normalized in {canonicalize_header(header) for header in possible_headers}


def extract_section(text: str, possible_headers: list[str]) -> list[str]:
    lines = [normalize_line(line) for line in text.splitlines()]
    collected: list[str] = []
    inside_section = False

    for line in lines:
        canonical_line = canonicalize_header(line)

        if not canonical_line:
            if inside_section and collected and collected[-1] != "":
                collected.append("")
            continue

        if is_section_header(line, possible_headers):
            inside_section = True
            continue

        if inside_section and (
            canonical_line in ALL_KNOWN_HEADERS or canonical_line in CANONICAL_STOP_HEADERS
        ):
            break

        if inside_section:
            collected.append(line)

    return collected


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item.strip())

    return result


def clean_section_lines(lines: list[str]) -> list[str]:
    cleaned: list[str] = []

    for line in lines:
        stripped = normalize_line(line)
        canonical = canonicalize_header(stripped)

        if not stripped:
            continue
        if set(stripped) == {"_"}:
            continue
        if canonical in ALL_KNOWN_HEADERS or canonical in CANONICAL_STOP_HEADERS:
            continue

        cleaned.append(stripped)

    return dedupe_preserve_order(cleaned)


def looks_like_bullet(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False

    if stripped.startswith(("•", "-", "*", "●", "▪", "◦", "■", "◆")):
        return True

    lower = stripped.lower()
    bullet_starters = (
        "built ",
        "developed ",
        "designed ",
        "collaborated ",
        "participated ",
        "conducted ",
        "engineered ",
        "implemented ",
        "deployed ",
        "created ",
        "led ",
        "improved ",
        "analyzed ",
        "automated ",
        "worked ",
        "promote ",
        "promoted ",
        "assisted ",
        "supported ",
        "focused ",
        "configured ",
        "integrated ",
        "used ",
        "delivered ",
        "managed ",
        "generated ",
        "applied ",
        "researched ",
        "documented ",
        "optimized ",
        "reduced ",
        "increased ",
        "maintained ",
        "tested ",
        "debugged ",
        "launched ",
        "trained ",
        "completed ",
    )
    return lower.startswith(bullet_starters)


def is_probable_heading(line: str) -> bool:
    lower = line.lower().strip()
    canonical = canonicalize_header(line)

    if not lower:
        return False

    if canonical in ALL_KNOWN_HEADERS or canonical in CANONICAL_STOP_HEADERS:
        return False

    if looks_like_bullet(line):
        return False

    words = line.split()
    if len(words) > 22:
        return False

    pipe_count = line.count("|")
    has_pipe = pipe_count >= 1
    has_multiple_pipes = pipe_count >= 2
    has_date = bool(DATE_PATTERN.search(line)) or "present" in lower
    has_month = bool(MONTH_PATTERN.search(lower))
    has_separator = " - " in line or "," in line

    title_keywords = [
        "intern",
        "engineer",
        "analyst",
        "developer",
        "manager",
        "assistant",
        "specialist",
        "associate",
        "ambassador",
        "capstone",
        "hackathon",
        "project",
        "experience",
        "research",
        "consultant",
        "technician",
        "designer",
        "coordinator",
        "lead",
        "student",
        "virtual experience",
    ]
    has_title_keyword = any(keyword in lower for keyword in title_keywords)

    tech_keywords = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "fastapi",
        "flask",
        "django",
        "sql",
        "mysql",
        "postgresql",
        "sql server",
        "docker",
        "aws",
        "azure",
        "devops",
        "git",
        "tensorflow",
        "pytorch",
        "rest",
        "api",
    ]
    has_tech_keyword = any(keyword in lower for keyword in tech_keywords)

    # Experience-style titles
    if has_pipe and (has_date or has_month or has_title_keyword):
        return True

    if has_title_keyword and (has_date or has_month or has_separator):
        return True

    if (has_date or has_month) and len(words) <= 16:
        return True

    # Project-style titles with tech stacks but no dates
    if has_multiple_pipes and has_tech_keyword and len(words) <= 20:
        return True

    # Simpler fallback for titles like "Project Name | Company | Python, React, Docker"
    if has_pipe and has_tech_keyword and len(words) <= 18:
        return True

    return False


def group_structured_entries(lines: list[str]) -> list[dict]:
    entries: list[dict] = []
    current_entry: dict | None = None

    for raw_line in lines:
        line = normalize_line(raw_line)
        canonical = canonicalize_header(line)

        if not line:
            continue

        if canonical in ALL_KNOWN_HEADERS or canonical in CANONICAL_STOP_HEADERS:
            continue

        if is_probable_heading(line):
            if current_entry and (current_entry["title"] or current_entry["bullets"]):
                current_entry["bullets"] = dedupe_preserve_order(current_entry["bullets"])
                entries.append(current_entry)

            current_entry = {
                "title": line,
                "bullets": [],
            }
            continue

        cleaned_bullet = clean_bullet_text(line)

        if current_entry is None:
            current_entry = {
                "title": cleaned_bullet,
                "bullets": [],
            }
            continue

        if cleaned_bullet and cleaned_bullet.lower() != current_entry["title"].strip().lower():
            current_entry["bullets"].append(cleaned_bullet)

    if current_entry and (current_entry["title"] or current_entry["bullets"]):
        current_entry["bullets"] = dedupe_preserve_order(current_entry["bullets"])
        entries.append(current_entry)

    normalized_entries: list[dict] = []
    seen_titles: set[str] = set()

    for entry in entries:
        title = normalize_line(entry.get("title", ""))
        bullets = dedupe_preserve_order(
            [clean_bullet_text(bullet) for bullet in entry.get("bullets", []) if clean_bullet_text(bullet)]
        )

        if not title and not bullets:
            continue

        if not title and bullets:
            title = bullets[0]
            bullets = bullets[1:]

        title_key = title.lower()
        if title_key in seen_titles and not bullets:
            continue

        seen_titles.add(title_key)
        normalized_entries.append(
            {
                "title": title,
                "bullets": bullets,
            }
        )

    return normalized_entries


def flatten_structured_entries(entries: list[dict]) -> list[str]:
    flattened: list[str] = []

    for entry in entries:
        title = normalize_line(entry.get("title", ""))
        bullets = entry.get("bullets", [])

        if title:
            flattened.append(title)

        for bullet in bullets:
            cleaned = clean_bullet_text(bullet)
            if cleaned:
                flattened.append(cleaned)

    return dedupe_preserve_order(flattened)


def parse_resume_text(text: str) -> dict:
    normalized_text = normalize_whitespace(text)

    education = clean_section_lines(extract_section(normalized_text, SECTION_HEADERS["education"]))
    experience_lines = clean_section_lines(extract_section(normalized_text, SECTION_HEADERS["experience"]))
    project_lines = clean_section_lines(extract_section(normalized_text, SECTION_HEADERS["projects"]))
    leadership_lines = clean_section_lines(extract_section(normalized_text, SECTION_HEADERS["leadership"]))

    structured_experience = group_structured_entries(experience_lines)
    structured_projects = group_structured_entries(project_lines)
    structured_leadership = group_structured_entries(leadership_lines)

    return {
        "name": extract_name(normalized_text),
        "email": extract_email(normalized_text),
        "phone": extract_phone(normalized_text),
        "skills": extract_skills(normalized_text),
        "education": education,
        "experience": flatten_structured_entries(structured_experience),
        "projects": flatten_structured_entries(structured_projects),
        "leadership": flatten_structured_entries(structured_leadership),
        "experience_entries": structured_experience,
        "project_entries": structured_projects,
        "leadership_entries": structured_leadership,
        "raw_text": normalized_text,
    }