try:
    # Works when running from project root (package-style imports)
    from backend.crawler.parsers.linkedin import parse_job_linkedin
    from backend.database.queries import insert_job
except ImportError:
    # Works when running this file directly from backend/crawler
    import os
    import sys

    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from parsers.linkedin import parse_job_linkedin
    from database.queries import insert_job


def _log_db_target():
    try:
        from backend.database.connection import get_connection
    except ImportError:
        from database.connection import get_connection

    conn = get_connection()
    try:
        print(
            f"[db] target: host={conn.server_host} port={conn.server_port} "
            f"database={conn.database}",
            flush=True,
        )
    finally:
        conn.close()


def run():
    print("[crawl] run() started", flush=True)
    _log_db_target()

    jobs = []

    # Crawl linkedin
    LINKEDIN_URLS = [
        "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=full%20stack%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=backend%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=frontend%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=junior%20software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=entry%20level%20software%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=associate%20software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=web%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=application%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=data%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=data%20scientist&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=machine%20learning%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=devops%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=cloud%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=site%20reliability%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=qa%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20test%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=ios%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=android%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=senior%20software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=staff%20software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20developer%20intern&location=Dallas-Fort%20Worth%20Metroplex",
    ]

    for i, url in enumerate(LINKEDIN_URLS, start=1):
        print(f"[crawl] fetching URL {i}/{len(LINKEDIN_URLS)}: {url}", flush=True)
        new_jobs = parse_job_linkedin(url)
        print(f"[crawl]   -> parsed {len(new_jobs)} job(s)", flush=True)
        for job in new_jobs:
            jobs.append(job)

    print(f"[crawl] total jobs collected: {len(jobs)}", flush=True)

    if not jobs:
        print(
            "[crawl] WARNING: no jobs to insert - check network, LinkedIn response, or parser.",
            flush=True,
        )
        return

    # Insert all the jobs into MySQL database
    inserted = 0
    for idx, job in enumerate(jobs, start=1):
        title = (job.get("job_title") or "")[:60]
        try:
            insert_job(job)
            inserted += 1
            print(f"[crawl] insert {idx}/{len(jobs)} OK: {title!r}", flush=True)
        except Exception as exc:
            print(f"[crawl] insert {idx}/{len(jobs)} FAILED: {title!r} - {exc}", flush=True)
            raise

    print(f"[crawl] done: {inserted}/{len(jobs)} row(s) inserted", flush=True)


if __name__ == "__main__":
    run()
