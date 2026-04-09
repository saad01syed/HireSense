try:
    from backend.database.connection import get_connection
except ImportError:
    try:
        from database.connection import get_connection
    except ImportError:
        from connection import get_connection
import json
import mysql.connector


def _normalize_job_type_for_db(raw):
    """Map LinkedIn labels to values that fit typical MySQL ENUM/VARCHAR schemas."""
    if not raw:
        return "Full-time"
    v = str(raw).strip()
    lower = v.lower()
    if lower in ("volunteer", "other", "unspecified"):
        return "Full-time"
    return v


def _normalize_experience_level_for_db(raw):
    if not raw:
        return "Entry level"
    v = str(raw).strip()
    lower = v.lower()
    if lower in ("not applicable", "n/a", "unspecified", "other"):
        return "Entry level"
    return v


def _normalize_work_style_for_db(raw):
    if not raw:
        return "On-site"
    return str(raw).strip()


# -----------------------------
# INSERT JOB
# -----------------------------
def insert_job(job):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO job_data (
            job_title,
            company,
            location,
            salary,
            date_posted,
            application_link,
            job_description,
            skills,
            job_type,
            experience_level,
            work_style
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        job.get("job_title"),
        job.get("company"),
        job.get("location"),
        job.get("salary"),
        job.get("date_posted"),
        job.get("application_link"),
        job.get("job_description"),
        json.dumps(job.get("skills", [])),
        _normalize_job_type_for_db(job.get("job_type")),
        _normalize_experience_level_for_db(job.get("experience_level")),
        _normalize_work_style_for_db(job.get("work_style")),
    )

    try:
        cursor.execute(query, values)
        conn.commit()
        row_id = cursor.lastrowid
        print(
            f"[db] insert_job OK: lastrowid={row_id}, title={job.get('job_title')!r}",
            flush=True,
        )
    except mysql.connector.IntegrityError as exc:
        # Duplicate unique-key row: keep crawling, just skip insert.
        if getattr(exc, "errno", None) == 1062:
            print(
                f"[db] insert_job SKIP duplicate: title={job.get('job_title')!r}",
                flush=True,
            )
            return
        print(
            f"[db] insert_job FAILED (integrity): {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        raise
    except Exception as exc:
        print(
            f"[db] insert_job FAILED: {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        raise
    finally:
        cursor.close()
        conn.close()


# -----------------------------
# GET JOBS TO RECHECK
# -----------------------------
def get_jobs_to_check():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, application_link
        FROM job_data
        WHERE date_posted IS NULL 
            OR DATEDIFF(CURDATE(), date_posted) > 30;
    """)

    jobs = cursor.fetchall()

    cursor.close()
    conn.close()

    return jobs

# -----------------------------
# DELETE JOB
# -----------------------------

def delete_job(job_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM job_data
        WHERE id = %s
    """, (job_id,))

    conn.commit()

    cursor.close()
    conn.close()