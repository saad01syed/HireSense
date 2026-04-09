"""
updater.py removes expired jobs from database.
"""

import requests
from database.queries import get_jobs_to_check, delete_job


def update_database():
    jobs = get_jobs_to_check()

    for job in jobs:
        try:
            response = requests.get(job["application_link"], timeout=10)

            if response.status_code == 404:
                delete_job(job["id"])

        except requests.RequestException:
            # Skip if site temporarily unreachable
            pass