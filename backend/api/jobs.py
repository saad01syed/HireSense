from collections import Counter
from fastapi import APIRouter, HTTPException
from data.mock_jobs import mock_jobs

try:
    from backend.database.queries import (
        fetch_all_jobs_from_db,
        fetch_job_by_id_from_db,
    )
except ImportError:
    try:
        from database.queries import (
            fetch_all_jobs_from_db,
            fetch_job_by_id_from_db,
        )
    except ImportError:
        fetch_all_jobs_from_db = None
        fetch_job_by_id_from_db = None

router = APIRouter(prefix="/jobs", tags=["jobs"])


def get_jobs_data():
    if fetch_all_jobs_from_db:
        try:
            db_jobs = fetch_all_jobs_from_db()
            if db_jobs:
                return db_jobs
        except Exception:
            pass

    return mock_jobs


@router.get("/market-insights")
def get_market_insights():
    jobs = get_jobs_data()

    skill_counter = Counter()
    location_counter = Counter()
    company_counter = Counter()

    for job in jobs:
        for tag in job.get("tags", []):
            skill_counter[tag] += 1

        location = job.get("location", "Unknown")
        location_counter[location] += 1

        company = job.get("company", "Unknown")
        company_counter[company] += 1

    total_jobs = len(jobs)
    remote_jobs = sum(1 for job in jobs if job.get("hybrid") == "Remote")
    hybrid_jobs = sum(1 for job in jobs if job.get("hybrid") == "Hybrid")
    onsite_jobs = sum(1 for job in jobs if job.get("hybrid") == "On-site")

    return {
        "overview": {
            "total_jobs": total_jobs,
            "remote_jobs": remote_jobs,
            "hybrid_jobs": hybrid_jobs,
            "onsite_jobs": onsite_jobs,
        },
        "trending_skills": [
            {"name": name, "count": count}
            for name, count in skill_counter.most_common(6)
        ],
        "top_locations": [
            {"city": city, "count": count}
            for city, count in location_counter.most_common(5)
        ],
        "top_companies": [
            {"name": name, "count": count}
            for name, count in company_counter.most_common(5)
        ],
    }


@router.get("/")
def get_jobs():
    return get_jobs_data()


@router.get("/{job_id}")
def get_job_by_id(job_id: int):
    if fetch_job_by_id_from_db:
        try:
            job = fetch_job_by_id_from_db(job_id)
            if job:
                return job
        except Exception:
            pass

    for job in mock_jobs:
        if job["id"] == job_id:
            return job

    raise HTTPException(status_code=404, detail="Job not found")