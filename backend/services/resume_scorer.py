import re


ACTION_VERBS = {
    "built",
    "developed",
    "designed",
    "implemented",
    "engineered",
    "created",
    "led",
    "improved",
    "optimized",
    "deployed",
    "automated",
    "managed",
    "analyzed",
    "reduced",
    "increased",
    "launched",
    "integrated",
    "maintained",
    "tested",
    "debugged",
    "configured",
    "delivered",
    "generated",
    "researched",
    "documented",
    "trained",
}

WEAK_STARTERS = {
    "responsible for",
    "worked on",
    "helped",
    "assisted with",
    "participated in",
    "involved in",
    "tasked with",
    "support",
    "supported",
    "used",
}

TECHNICAL_CATEGORY_KEYWORDS = {
    "languages": {"python", "java", "javascript", "typescript", "c", "c++", "c#", "sql", "go", "rust"},
    "frameworks": {"react", "fastapi", "flask", "django", "node.js", "express", "spring", "tensorflow", "pytorch"},
    "cloud_devops": {"aws", "azure", "docker", "kubernetes", "ci/cd", "github actions", "azure devops"},
    "databases": {"mysql", "postgresql", "mongodb", "sql server", "sqlite", "oracle"},
}

METRIC_PATTERN = re.compile(r"(\d+%|\d+\+|\$\d+|\d+\s?(users|clients|hours|days|weeks|months|years|records|rows|requests))", re.IGNORECASE)


def build_summary(parsed_data: dict, score: int, warnings: list[str]) -> str:
    name = parsed_data.get("name") or "This candidate"
    skills = parsed_data.get("skills", [])
    experience_entries = parsed_data.get("experience_entries", [])
    project_entries = parsed_data.get("project_entries", [])

    preferred_order = [
        "Python",
        "FastAPI",
        "SQL",
        "React",
        "Docker",
        "PostgreSQL",
        "AWS",
        "Azure",
        "Machine Learning",
        "Pytest",
    ]

    normalized_skill_map = {skill.lower(): skill for skill in skills}
    top_skills = [
        normalized_skill_map[skill.lower()]
        for skill in preferred_order
        if skill.lower() in normalized_skill_map
    ][:5]

    if not top_skills:
        top_skills = skills[:5]

    if score >= 85:
        tone = "is a strong technical resume"
    elif score >= 70:
        tone = "has a solid foundation but still needs refinement"
    elif score >= 55:
        tone = "shows potential but needs stronger presentation"
    else:
        tone = "needs significant improvement before it is competitive"

    details = []

    if top_skills:
        details.append(f"Key skills detected include {', '.join(top_skills)}")
    if experience_entries:
        details.append(f"{len(experience_entries)} experience entr{'y' if len(experience_entries) == 1 else 'ies'} detected")
    if project_entries:
        details.append(f"{len(project_entries)} project entr{'y' if len(project_entries) == 1 else 'ies'} detected")
    if warnings:
        details.append(f"{len(warnings)} major issue{'s' if len(warnings) != 1 else ''} flagged")

    detail_text = ". ".join(details) + "." if details else ""
    return f"{name} {tone} with a score of {score}/100. {detail_text}".strip()


def get_all_bullets(parsed_data: dict) -> list[str]:
    bullets: list[str] = []

    for entry in parsed_data.get("experience_entries", []):
        bullets.extend(entry.get("bullets", []))

    for entry in parsed_data.get("project_entries", []):
        bullets.extend(entry.get("bullets", []))

    return [bullet.strip() for bullet in bullets if bullet.strip()]


def has_metric(text: str) -> bool:
    return bool(METRIC_PATTERN.search(text))


def starts_with_action_verb(text: str) -> bool:
    first_word = text.strip().split(" ")[0].lower() if text.strip() else ""
    return first_word in ACTION_VERBS


def starts_with_weak_phrase(text: str) -> bool:
    lower = text.strip().lower()
    return any(lower.startswith(phrase) for phrase in WEAK_STARTERS)


def count_technical_categories(skills: list[str]) -> int:
    normalized = {skill.lower() for skill in skills}
    count = 0

    for keywords in TECHNICAL_CATEGORY_KEYWORDS.values():
        if normalized.intersection({keyword.lower() for keyword in keywords}):
            count += 1

    return count


def score_resume(parsed_data: dict) -> dict:
    score = 0
    strengths: list[str] = []
    improvements: list[str] = []
    warnings: list[str] = []

    name = parsed_data.get("name")
    email = parsed_data.get("email")
    phone = parsed_data.get("phone")
    education = parsed_data.get("education", [])
    experience_entries = parsed_data.get("experience_entries", [])
    project_entries = parsed_data.get("project_entries", [])
    skills = parsed_data.get("skills", [])
    all_bullets = get_all_bullets(parsed_data)

    # Contact info
    if name:
        score += 6
        strengths.append("Resume includes a clear candidate name.")
    else:
        warnings.append("Candidate name was not confidently detected.")
        improvements.append("Place your full name clearly at the top of the resume.")

    if email:
        score += 7
        strengths.append("Resume includes an email address.")
    else:
        warnings.append("Email address is missing.")
        improvements.append("Add a professional email address near the top of the resume.")

    if phone:
        score += 7
        strengths.append("Resume includes a phone number.")
    else:
        warnings.append("Phone number is missing.")
        improvements.append("Add a phone number so recruiters can contact you directly.")

    # Core sections
    if education:
        score += 10
        strengths.append("Education details were detected.")
    else:
        warnings.append("Education section is missing or unclear.")
        improvements.append("Add a clear education section with school, degree, and graduation date.")

    if experience_entries:
        score += 18
        strengths.append("Work experience is present.")
    else:
        warnings.append("No work experience section was confidently detected.")
        improvements.append("Add a work experience section with role titles, dates, and impact-focused bullets.")

    if project_entries:
        score += 14
        strengths.append("Projects section adds technical credibility.")
    else:
        warnings.append("No projects section was confidently detected.")
        improvements.append("Add 2–3 strong projects that show tools, scope, and results.")

    # Skills
    skills_count = len(skills)
    technical_category_count = count_technical_categories(skills)

    if skills_count >= 12:
        score += 14
        strengths.append("Resume shows a broad technical skill set.")
    elif skills_count >= 8:
        score += 10
        strengths.append("Resume includes a solid number of technical skills.")
    elif skills_count >= 4:
        score += 6
        improvements.append("Expand the skills section with more job-relevant tools, languages, and platforms.")
    else:
        warnings.append("Skills section is light or missing.")
        improvements.append("Add a stronger technical skills section grouped by languages, frameworks, databases, and tools.")

    if technical_category_count >= 3:
        score += 6
        strengths.append("Skills span multiple technical categories.")
    elif skills_count > 0:
        improvements.append("Balance your skills section across languages, frameworks, databases, and cloud/dev tools.")

    # Entry structure quality
    if len(experience_entries) >= 2:
        score += 4
        strengths.append("Resume includes multiple experience entries.")
    elif experience_entries:
        improvements.append("Add more depth to the experience section or include additional relevant roles.")

    if len(project_entries) >= 2:
        score += 4
        strengths.append("Resume includes multiple projects.")
    elif project_entries:
        improvements.append("Adding another strong project would make the resume more competitive for technical roles.")

    # Bullet quality
    bullet_count = len(all_bullets)
    if bullet_count >= 10:
        score += 10
        strengths.append("Resume includes a healthy amount of detail across experience and projects.")
    elif bullet_count >= 6:
        score += 6
        improvements.append("Add more detail to experience and project bullets to show scope and ownership.")
    elif bullet_count > 0:
        warnings.append("Experience and project sections are too thin.")
        improvements.append("Add more bullets under each role and project so the resume feels more complete.")
    else:
        warnings.append("No clear bullet content was detected under experience or projects.")
        improvements.append("Use bullet points under each role and project to describe what you built, improved, or delivered.")

    bullets_with_metrics = [bullet for bullet in all_bullets if has_metric(bullet)]
    metric_ratio = len(bullets_with_metrics) / bullet_count if bullet_count else 0

    if bullet_count and metric_ratio >= 0.35:
        score += 10
        strengths.append("Several bullets include measurable impact.")
    elif bullet_count and metric_ratio >= 0.15:
        score += 5
        improvements.append("Increase the number of bullets with metrics such as percentages, scale, time saved, or user counts.")
    elif bullet_count:
        warnings.append("Bullets rarely show measurable results.")
        improvements.append("Rewrite bullets to include measurable impact like percentages, time saved, scale, or outcomes.")

    strong_action_bullets = [bullet for bullet in all_bullets if starts_with_action_verb(bullet)]
    strong_action_ratio = len(strong_action_bullets) / bullet_count if bullet_count else 0

    if bullet_count and strong_action_ratio >= 0.6:
        score += 8
        strengths.append("Many bullets start with strong action verbs.")
    elif bullet_count and strong_action_ratio >= 0.3:
        score += 4
        improvements.append("Start more bullets with strong verbs like Built, Developed, Automated, Designed, or Led.")
    elif bullet_count:
        warnings.append("Bullets do not consistently start with strong action verbs.")
        improvements.append("Rewrite bullet points so they begin with stronger action verbs and sound more results-driven.")

    weak_bullets = [bullet for bullet in all_bullets if starts_with_weak_phrase(bullet)]
    if len(weak_bullets) >= 2:
        warnings.append("Several bullets sound task-based or vague.")
        improvements.append("Replace weak phrasing like 'worked on' or 'helped with' with direct ownership and impact-focused language.")

    short_bullets = [bullet for bullet in all_bullets if len(bullet.split()) < 6]
    if bullet_count and len(short_bullets) >= max(2, bullet_count // 3):
        warnings.append("Several bullets are too short to show meaningful impact.")
        improvements.append("Expand short bullets so they explain the tool used, what you did, and the result.")

    duplicate_bullets = len({bullet.lower() for bullet in all_bullets}) != len(all_bullets)
    if duplicate_bullets:
        warnings.append("Some bullet content appears repetitive.")
        improvements.append("Remove repeated bullets and make each point add a distinct accomplishment.")

    # Resume completeness balance
    if experience_entries and project_entries and skills_count >= 8 and bullet_count >= 8:
        score += 8
        strengths.append("Resume has a strong balance of experience, projects, skills, and supporting detail.")

    if not parsed_data.get("raw_text", "").strip():
        warnings.append("Resume text extraction may have failed or returned very little content.")
        improvements.append("Use a cleaner PDF or DOCX export so text can be extracted more reliably.")

    # Keep score harsher and realistic
    score = max(20, min(score, 96))

    # De-duplicate feedback while preserving order
    strengths = list(dict.fromkeys(strengths))
    improvements = list(dict.fromkeys(improvements))
    warnings = list(dict.fromkeys(warnings))

    # Limit noise but keep enough value
    strengths = strengths[:6]
    warnings = warnings[:6]
    improvements = improvements[:8]

    return {
        "score": score,
        "summary": build_summary(parsed_data, score, warnings),
        "strengths": strengths,
        "warnings": warnings,
        "improvements": improvements,
    }