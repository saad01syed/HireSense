try:
    from crawler.parsers.linkedin import parse_job_linkedin
    from database.queries import insert_job
except ImportError:
    import os
    import sys

    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from crawler.parsers.linkedin import parse_job_linkedin
    from database.queries import insert_job


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

    linkedin_urls = [
        "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=full%20stack%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=frontend%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=backend%20developer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=data%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=data%20scientist&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=machine%20learning%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=devops%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=cloud%20engineer&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=software%20developer%20intern&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=data%20analyst%20intern&location=Dallas-Fort%20Worth%20Metroplex",
        "https://www.linkedin.com/jobs/search/?keywords=machine%20learning%20intern&location=Dallas-Fort%20Worth%20Metroplex",
    ]

    for i, url in enumerate(linkedin_urls, start=1):
      print(f"[crawl] fetching URL {i}/{len(linkedin_urls)}: {url}", flush=True)
      try:
          new_jobs = parse_job_linkedin(url)
          print(f"[crawl]   -> parsed {len(new_jobs)} job(s)", flush=True)
          jobs.extend(new_jobs)
      except Exception as exc:
          print(f"[crawl]   -> parser failed for URL {i}: {exc}", flush=True)

    print(f"[crawl] total jobs collected before insert: {len(jobs)}", flush=True)

    if not jobs:
        print("[crawl] no jobs found", flush=True)
        return

    inserted = 0
    failed = 0

    for idx, job in enumerate(jobs, start=1):
        title = (job.get("job_title") or "Unknown Title")[:70]
        try:
            insert_job(job)
            inserted += 1
            print(f"[crawl] insert {idx}/{len(jobs)} OK: {title!r}", flush=True)
        except Exception as exc:
            failed += 1
            print(f"[crawl] insert {idx}/{len(jobs)} FAILED: {title!r} - {exc}", flush=True)
            continue

    print(
        f"[crawl] done: processed={len(jobs)} inserted_or_skipped={inserted} failed={failed}",
        flush=True,
    )


if __name__ == "__main__":
    run()