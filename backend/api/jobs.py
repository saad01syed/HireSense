from fastapi import APIRouter, HTTPException
from data.mock_jobs import mock_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/")
def get_jobs():
    return mock_jobs


@router.get("/{job_id}")
def get_job_by_id(job_id: int):
    for job in mock_jobs:
        if job["id"] == job_id:
            return job
    raise HTTPException(status_code=404, detail="Job not found")