try:
    from backend.database.connection import get_connection
except ImportError:
    try:
        from database.connection import get_connection
    except ImportError:
        from connection import get_connection

import json
import mysql.connector


ALLOWED_JOB_TYPES = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    "contract": "Contract",
    "internship": "Internship",
    "temporary": "Temporary",
}

ALLOWED_EXPERIENCE_LEVELS = {
    "internship": "Internship",
    "entry level": "Entry level",
    "associate": "Associate",
    "mid-senior level": "Mid-Senior level",
    "director": "Director",
    "executive": "Executive",
}


def _normalize_job_type_for_db(raw, title=None):
    title_text = (title or "").lower()

    if "intern" in title_text:
        return "Internship"

    if not raw:
        return "Full-time"

    value = str(raw).strip()
    lower = value.lower()

    if lower in ALLOWED_JOB_TYPES:
        return ALLOWED_JOB_TYPES[lower]

    if "intern" in lower:
        return "Internship"
    if "contract" in lower:
        return "Contract"
    if "part" in lower:
        return "Part-time"
    if "temp" in lower:
        return "Temporary"
    if "full" in lower:
        return "Full-time"

    return "Full-time"


def _normalize_experience_level_for_db(raw):
    if not raw:
        return "Entry level"

    value = str(raw).strip()
    lower = value.lower()

    if lower in ALLOWED_EXPERIENCE_LEVELS:
        return ALLOWED_EXPERIENCE_LEVELS[lower]

    if "intern" in lower:
        return "Internship"
    if "entry" in lower or "junior" in lower:
        return "Entry level"
    if "associate" in lower:
        return "Associate"
    if "senior" in lower or "mid" in lower:
        return "Mid-Senior level"
    if "director" in lower:
        return "Director"
    if "executive" in lower:
        return "Executive"

    return "Entry level"


def _normalize_work_style_for_db(raw):
    if not raw:
        return "On-site"

    value = str(raw).strip()
    lower = value.lower()

    if "remote" in lower:
        return "Remote"
    if "hybrid" in lower:
        return "Hybrid"
    if "site" in lower or "office" in lower or "on-site" in lower:
        return "On-site"

    return "On-site"


def _safe_load_skills(raw):
    if not raw:
        return []
    if isinstance(raw, list):
        return raw

    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data]
    except Exception:
        pass

    return []


def _map_db_row_to_frontend_job(row):
    skills = _safe_load_skills(row.get("skills"))

    work_style = row.get("work_style") or "On-site"
    job_type = row.get("job_type") or "Full-time"
    experience_level = row.get("experience_level") or "Entry level"
    salary = row.get("salary") or "Not listed"
    date_posted = row.get("date_posted")

    posted = str(date_posted) if date_posted else "Recently posted"

    return {
        "id": row.get("id"),
        "title": row.get("job_title") or "Untitled Role",
        "company": row.get("company") or "Unknown Company",
        "location": row.get("location") or "Unknown Location",
        "type": job_type,
        "salary": salary,
        "salaryRange": salary,
        "tags": skills,
        "posted": posted,
        "badge": "Live",
        "match": 0,
        "logo": "",
        "hybrid": work_style,
        "experienceLevel": experience_level,
        "dateRange": "Live",
        "description": row.get("job_description") or "No description available.",
        "applicationLink": row.get("application_link") or "",
    }


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

    title = job.get("job_title")

    values = (
        title,
        job.get("company"),
        job.get("location"),
        job.get("salary"),
        job.get("date_posted"),
        job.get("application_link"),
        job.get("job_description"),
        json.dumps(job.get("skills", [])),
        _normalize_job_type_for_db(job.get("job_type"), title),
        _normalize_experience_level_for_db(job.get("experience_level")),
        _normalize_work_style_for_db(job.get("work_style")),
    )

    try:
        cursor.execute(query, values)
        conn.commit()
    except mysql.connector.IntegrityError as exc:
        if getattr(exc, "errno", None) == 1062:
            return
        raise
    finally:
        cursor.close()
        conn.close()


def get_jobs_to_check():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, application_link
        FROM job_data
        WHERE date_posted IS NULL
            OR DATEDIFF(CURDATE(), date_posted) > 30;
        """
    )

    jobs = cursor.fetchall()

    cursor.close()
    conn.close()

    return jobs


def delete_job(job_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM job_data
        WHERE id = %s
        """,
        (job_id,),
    )

    conn.commit()

    cursor.close()
    conn.close()


def fetch_all_jobs_from_db():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
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
        FROM job_data
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [_map_db_row_to_frontend_job(row) for row in rows]


def fetch_job_by_id_from_db(job_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
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
        FROM job_data
        WHERE id = %s
        LIMIT 1
        """,
        (job_id,),
    )

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return None

    return _map_db_row_to_frontend_job(row)