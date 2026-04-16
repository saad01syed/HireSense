import json
import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_ROOT / ".env")

def get_connection():
    host = os.environ.get("DB_HOST")
    port_raw = os.environ.get("DB_PORT", "3306")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    database = os.environ.get("DB_NAME")
    missing = [
        name
        for name, val in (
            ("DB_HOST", host),
            ("DB_USER", user),
            ("DB_PASSWORD", password),
            ("DB_NAME", database),
        )
        if not val
    ]
    if missing:
        raise RuntimeError(
            "Missing required database environment variables: "
            f"{', '.join(missing)}. Copy backend/.env.example to backend/.env and set them."
        )
    try:
        port = int(port_raw)
    except ValueError as exc:
        raise ValueError(f"DB_PORT must be an integer, got {port_raw!r}") from exc
    return mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
    )

def _normalize_experience_level_for_db(raw):
    if not raw:
        return "Entry level"
    v = str(raw).strip()
    lower = v.lower()
    if lower in ("not applicable", "n/a", "unspecified", "other"):
        return "Entry level"
    return v

def _nonempty_str(value):
    """Return stripped string or None so omitted INSERT columns use DB defaults."""
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None


def _sanitize_salary_for_db(raw_salary):
    """Return a DB-safe integer salary or None.

    Uses signed INT max as a conservative upper bound since schema type may vary.
    """
    if raw_salary is None:
        return None
    try:
        value = int(raw_salary)
    except (TypeError, ValueError):
        return None
    if value < 0:
        return None
    if value > 2_147_483_647:
        return None
    return value

def insert_job(job):
    """Insert one job row. Returns True on success, False if skipped or failed (never raises)."""
    conn = get_connection()
    cursor = conn.cursor()

    salary_value = _sanitize_salary_for_db(job.get("salary"))
    job_type_value = _nonempty_str(job.get("job_type"))
    work_style_value = _nonempty_str(job.get("work_style"))

    columns = [
        "job_title",
        "company",
        "location",
        "salary",
        "date_posted",
        "application_link",
        "job_description",
        "skills",
    ]
    values = [
        job.get("job_title"),
        job.get("company"),
        job.get("location"),
        salary_value,
        job.get("date_posted"),
        job.get("application_link"),
        job.get("job_description"),
        json.dumps(job.get("skills", [])),
    ]
    if job_type_value is not None:
        columns.append("job_type")
        values.append(job_type_value)
    columns.append("experience_level")
    values.append(_normalize_experience_level_for_db(job.get("experience_level")))
    if work_style_value is not None:
        columns.append("work_style")
        values.append(work_style_value)

    placeholders = ", ".join(["%s"] * len(values))
    column_sql = ", ".join(columns)
    query = f"""
        INSERT INTO job_data (
            {column_sql}
        )
        VALUES ({placeholders})
    """
    values = tuple(values)

    try:
        cursor.execute(query, values)
        conn.commit()
        row_id = cursor.lastrowid
        print(
            f"[db] insert_job OK: lastrowid={row_id}, title={job.get('job_title')!r}",
            flush=True,
        )
        return True
    except mysql.connector.DataError as exc:
        # If salary still overflows this specific schema type, retry with NULL.
        if getattr(exc, "errno", None) == 1264 and salary_value is not None:
            try:
                conn.rollback()
                values_no_salary = list(values)
                values_no_salary[3] = None
                cursor.execute(query, tuple(values_no_salary))
                conn.commit()
                row_id = cursor.lastrowid
                print(
                    f"[db] insert_job RETRY salary=NULL: lastrowid={row_id}, title={job.get('job_title')!r}",
                    flush=True,
                )
                return True
            except mysql.connector.Error as retry_exc:
                conn.rollback()
                print(
                    f"[db] insert_job FAILED (retry): {retry_exc!r} | title={job.get('job_title')!r}",
                    flush=True,
                )
                return False
        conn.rollback()
        print(
            f"[db] insert_job FAILED (data): {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        return False
    except mysql.connector.IntegrityError as exc:
        conn.rollback()
        # Duplicate unique-key row: keep crawling, just skip insert.
        if getattr(exc, "errno", None) == 1062:
            print(
                f"[db] insert_job SKIP duplicate: title={job.get('job_title')!r}",
                flush=True,
            )
            return False
        print(
            f"[db] insert_job FAILED (integrity): {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        return False
    except mysql.connector.Error as exc:
        conn.rollback()
        print(
            f"[db] insert_job FAILED (db): {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        return False
    except Exception as exc:
        try:
            conn.rollback()
        except mysql.connector.Error:
            pass
        print(
            f"[db] insert_job FAILED: {exc!r} | title={job.get('job_title')!r}",
            flush=True,
        )
        return False
    finally:
        cursor.close()
        conn.close()

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