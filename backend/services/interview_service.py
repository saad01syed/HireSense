import json
import re
from collections import Counter
from typing import Any, Dict, List


def _normalize_skill(value: str) -> str:
    return value.strip().lower()


def _extract_job_skills(job: Dict[str, Any]) -> List[str]:
    raw_skills = job.get("skills") or job.get("tags") or []

    if isinstance(raw_skills, str):
        try:
            parsed = json.loads(raw_skills)
            if isinstance(parsed, list):
                raw_skills = parsed
            else:
                raw_skills = []
        except Exception:
            raw_skills = []

    cleaned: List[str] = []
    seen = set()

    for skill in raw_skills:
        skill_text = str(skill).strip()
        normalized = _normalize_skill(skill_text)
        if skill_text and normalized not in seen:
            cleaned.append(skill_text)
            seen.add(normalized)

    return cleaned


def _extract_resume_skills(resume_data: Dict[str, Any]) -> List[str]:
    skills = resume_data.get("skills", []) or []
    cleaned: List[str] = []
    seen = set()

    for skill in skills:
        skill_text = str(skill).strip()
        normalized = _normalize_skill(skill_text)
        if skill_text and normalized not in seen:
            cleaned.append(skill_text)
            seen.add(normalized)

    return cleaned


def _top_resume_project(resume_data: Dict[str, Any]) -> str:
    projects = resume_data.get("project_entries", []) or []
    if projects and isinstance(projects[0], dict):
        return projects[0].get("title", "one of your recent technical projects")
    return "one of your recent technical projects"


def _top_resume_experience(resume_data: Dict[str, Any]) -> str:
    experiences = resume_data.get("experience_entries", []) or []
    if experiences and isinstance(experiences[0], dict):
        return experiences[0].get("title", "your recent experience")
    return "your recent experience"


def _description_text(job: Dict[str, Any]) -> str:
    description = job.get("job_description") or job.get("description") or ""

    if isinstance(description, dict):
        return str(description.get("about", "")).strip()

    return str(description).strip()


def _build_focus_skills(job: Dict[str, Any], resume_data: Dict[str, Any]) -> Dict[str, Any]:
    job_skills = _extract_job_skills(job)
    resume_skills = _extract_resume_skills(resume_data)

    resume_set = {_normalize_skill(skill) for skill in resume_skills}

    matched = [skill for skill in job_skills if _normalize_skill(skill) in resume_set]
    missing = [skill for skill in job_skills if _normalize_skill(skill) not in resume_set]

    primary = matched[0] if matched else (job_skills[0] if job_skills else "problem solving")
    secondary = matched[1] if len(matched) > 1 else (job_skills[1] if len(job_skills) > 1 else "collaboration")
    gap = missing[0] if missing else (job_skills[2] if len(job_skills) > 2 else "system design")

    return {
        "job_skills": job_skills,
        "resume_skills": resume_skills,
        "matched": matched,
        "missing": missing,
        "primary": primary,
        "secondary": secondary,
        "gap": gap,
    }


def generate_interview_questions(job: Dict[str, Any], resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Current MVP logic:
    - real backend-integrated
    - deterministic question generation
    - designed so a true LLM provider can replace this service later
    """
    title = job.get("job_title") or job.get("title") or "this role"
    company = job.get("company") or "the company"
    description = _description_text(job)
    focus = _build_focus_skills(job, resume_data)
    project_title = _top_resume_project(resume_data)
    experience_title = _top_resume_experience(resume_data)

    scenario_context = description[:180] if description else f"the expectations of the {title} role"

    questions = [
        {
            "question_id": "q1",
            "focus_area": "Role Fit",
            "prompt": f"Tell me about yourself and why your background is a strong fit for the {title} role at {company}.",
            "tips": [
                "Anchor your answer in relevant experience.",
                "Mention technical alignment to the role.",
                "Keep it concise and structured.",
            ],
            "target_keywords": [title, company, focus["primary"], experience_title],
        },
        {
            "question_id": "q2",
            "focus_area": f"Technical Depth: {focus['primary']}",
            "prompt": f"Walk me through a time you used {focus['primary']} in a project or internship. What was the problem, what did you build, and what was the result?",
            "tips": [
                "Use a problem → action → result flow.",
                "Mention tools, tradeoffs, and outcomes.",
                "Include one measurable impact if possible.",
            ],
            "target_keywords": [focus["primary"], "built", "result", "impact", "designed"],
        },
        {
            "question_id": "q3",
            "focus_area": f"Technical Depth: {focus['secondary']}",
            "prompt": f"This role emphasizes {focus['secondary']}. How would you show that strength in the context of {scenario_context}?",
            "tips": [
                "Connect your answer to the role context.",
                "Show how you think technically.",
                "Be specific about decisions and reasoning.",
            ],
            "target_keywords": [focus["secondary"], title, "tradeoff", "approach", "reasoning"],
        },
        {
            "question_id": "q4",
            "focus_area": f"Growth Area: {focus['gap']}",
            "prompt": f"One visible growth area for this role is {focus['gap']}. How would you ramp up quickly and still contribute early?",
            "tips": [
                "Be honest without underselling yourself.",
                "Describe how you learn fast.",
                "Show what you can contribute immediately.",
            ],
            "target_keywords": [focus["gap"], "learn", "ramp", "contribute", "collaboration"],
        },
        {
            "question_id": "q5",
            "focus_area": "Project Storytelling",
            "prompt": f"If I asked you to pick one project from your resume — like {project_title} — which would you choose, and how does it prepare you for this role?",
            "tips": [
                "Pick a project with strong relevance.",
                "Connect the project to the job requirements.",
                "End by tying it back to the company or role.",
            ],
            "target_keywords": [project_title, title, company, focus["primary"], focus["secondary"]],
        },
    ]

    return questions


def evaluate_answer(question: Dict[str, Any], answer: str) -> Dict[str, Any]:
    answer_text = answer.strip()
    lowered = answer_text.lower()
    words = re.findall(r"\b\w+\b", lowered)

    target_keywords = [
        str(keyword).lower()
        for keyword in question.get("target_keywords", [])
        if str(keyword).strip()
    ]

    keyword_hits = 0
    matched_keywords: List[str] = []
    for keyword in target_keywords:
        if keyword in lowered:
            keyword_hits += 1
            matched_keywords.append(keyword)

    length_score = min(len(words) / 140, 1.0) * 35
    keyword_score = min(keyword_hits / max(len(target_keywords), 1), 1.0) * 40

    structure_terms = ["built", "designed", "implemented", "improved", "led", "result", "impact", "because"]
    structure_hits = sum(1 for term in structure_terms if term in lowered)
    structure_score = min(structure_hits / 4, 1.0) * 15

    metric_score = 10 if re.search(r"\b\d+[%x+]?\b", answer_text) else 0

    total = round(length_score + keyword_score + structure_score + metric_score)
    total = max(35, min(total, 98)) if answer_text else 0

    if total >= 85:
        benchmark = "Excellent"
    elif total >= 72:
        benchmark = "Strong"
    elif total >= 58:
        benchmark = "Solid"
    else:
        benchmark = "Needs Improvement"

    strengths: List[str] = []
    improvements: List[str] = []

    if len(words) >= 60:
        strengths.append("Your answer had enough detail to feel credible and complete.")
    else:
        improvements.append("Add more depth so your example sounds more complete and convincing.")

    if keyword_hits > 0:
        strengths.append(
            f"You connected your answer to role-relevant themes like {', '.join(matched_keywords[:3])}."
        )
    else:
        improvements.append("Tie your answer more directly to the job’s required skills and focus areas.")

    if structure_hits >= 2:
        strengths.append("Your explanation showed reasonable structure and technical thinking.")
    else:
        improvements.append("Use a clearer problem → action → result structure.")

    if metric_score:
        strengths.append("Including a measurable outcome made your answer more persuasive.")
    else:
        improvements.append("Add a metric, outcome, or result to strengthen impact.")

    summary = (
        f"This answer scored {total}/100. It was strongest in "
        f"{'technical relevance' if keyword_hits > 0 else 'general clarity'}, "
        f"but could improve with "
        f"{'more role-specific detail' if keyword_hits == 0 else 'sharper impact and structure'}."
    )

    return {
        "score": total,
        "benchmark": benchmark,
        "summary": summary,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
    }


def build_final_result(responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not responses:
        return {
            "final_score": 0,
            "overall_summary": "No interview responses were recorded.",
            "top_strengths": [],
            "next_steps": [],
        }

    scores = [int(response.get("score", 0)) for response in responses]
    final_score = round(sum(scores) / len(scores))

    strengths_counter = Counter()
    improvement_counter = Counter()

    for response in responses:
        feedback = response.get("feedback", {})
        for item in feedback.get("strengths", []):
            strengths_counter[item] += 1
        for item in feedback.get("improvements", []):
            improvement_counter[item] += 1

    top_strengths = [text for text, _ in strengths_counter.most_common(3)]
    next_steps = [text for text, _ in improvement_counter.most_common(3)]

    if final_score >= 85:
        overall_summary = "You showed strong role alignment, solid technical depth, and credible communication across the interview."
    elif final_score >= 72:
        overall_summary = "You gave a strong interview overall, with good alignment to the role and a few areas that could be sharpened."
    elif final_score >= 58:
        overall_summary = "Your interview showed potential, but stronger structure and more role-specific detail would improve your performance."
    else:
        overall_summary = "Your answers need more depth, clearer structure, and stronger alignment to the role’s required skills."

    return {
        "final_score": final_score,
        "overall_summary": overall_summary,
        "top_strengths": top_strengths,
        "next_steps": next_steps,
    }