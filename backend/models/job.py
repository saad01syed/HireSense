from dataclasses import dataclass
from datetime import date

@dataclass
class Job:
    title: str
    company: str
    location: str
    salary: int | None
    date_posted: date | None
    application_link: str
    description: str
    skills: list[str]
    job_type: str = "Full-time"
    experience_level: str
    work_style: str = "On-site"