# database/models.py
# TODO: Define SQLAlchemy ORM models

# Job
#   id, title, company, location, salary_min, salary_max,
#   type (full-time/contract), hybrid (remote/hybrid/on-site),
#   description, responsibilities, requirements, benefits,
#   posted_at, expires_at, source_url, is_active

# Company
#   id, name, website, hr_phone, hr_email, logo_url, city

# JobTag
#   id, job_id (FK), tag

# Resume
#   id, user_id (FK), filename, uploaded_at, analysis_json

# User
#   id, full_name, email, hashed_password, created_at

# SavedJob
#   id, user_id (FK), job_id (FK), saved_at

# AppliedJob
#   id, user_id (FK), job_id (FK), applied_at, status
