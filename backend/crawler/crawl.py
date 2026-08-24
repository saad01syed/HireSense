import time

try:
    from ai.job_description import backfill_missing_summaries, simplify_jobs
    from crawler.parsers.linkedin import parse_job_linkedin
    from database.queries import insert_job
except ImportError:
    import os
    import sys

    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from ai.job_description import backfill_missing_summaries, simplify_jobs
    from crawler.parsers.linkedin import parse_job_linkedin
    from database.queries import insert_job

# Stop each LinkedIn search URL after this many seconds (paging + job details).
PER_URL_TIME_LIMIT_SEC = 5 * 60


def _log_db_target():
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

    location = "Dallas-Fort%20Worth%20Metroplex"
    # LinkedIn: f_E=1 Internship, f_E=2 Entry level
    experience_filter = "f_E=1%2C2"
    keywords = [
        # fields instead of job titles
        "artificial intelligence",
        "computer science",
        "information technology",
        "cybersecurity",
        "data science",
        "software engineering",
    ]
    linkedin_urls = [
        (
            "https://www.linkedin.com/jobs/search/"
            f"?keywords={keyword.replace(' ', '%20')}"
            f"&location={location}&{experience_filter}"
        )
        for keyword in keywords
    ]

    for i, url in enumerate(linkedin_urls, start=1):
        print(
            f"[crawl] fetching URL {i}/{len(linkedin_urls)} "
            f"(up to {PER_URL_TIME_LIMIT_SEC // 60} min): {url}",
            flush=True,
        )
        started = time.monotonic()
        try:
            new_jobs = parse_job_linkedin(url, time_limit_sec=PER_URL_TIME_LIMIT_SEC)
            elapsed = time.monotonic() - started
            print(
                f"[crawl]   -> parsed {len(new_jobs)} job(s) in {elapsed:.0f}s",
                flush=True,
            )
            jobs.extend(new_jobs)
        except Exception as exc:
            print(f"[crawl]   -> parser failed for URL {i}: {exc}", flush=True)

    print(f"[crawl] total jobs collected before insert: {len(jobs)}", flush=True)

    if jobs:
        print("[crawl] simplifying job descriptions", flush=True)
        simplify_jobs(jobs)
    else:
        print("[crawl] no new jobs found", flush=True)

    inserted = 0
    failed = 0

    for idx, job in enumerate(jobs, start=1):
        title = (job.get("job_title") or "Unknown Title")[:70]
        try:
            result = insert_job(job)
            if result is False:
                print(f"[crawl] insert {idx}/{len(jobs)} skipped: {title!r}", flush=True)
            else:
                inserted += 1
                print(f"[crawl] insert {idx}/{len(jobs)} OK: {title!r}", flush=True)
        except Exception as exc:
            failed += 1
            print(f"[crawl] insert {idx}/{len(jobs)} FAILED: {title!r} - {exc}", flush=True)
            continue

    print("[crawl] backfilling any remaining null summaries", flush=True)
    backfill_missing_summaries()

    print(
        f"[crawl] done: processed={len(jobs)} inserted_or_skipped={inserted} failed={failed}",
        flush=True,
    )


if __name__ == "__main__":
    run()