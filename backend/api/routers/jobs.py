# api/routers/jobs.py
# TODO: Job listing endpoints

# GET  /jobs
#   Query params (all multi-value, comma-separated):
#     city         — e.g. Dallas,Plano,Irving
#     style        — Remote | Hybrid | On-site
#     experience   — Internship | Entry level (0–2 yrs) | Mid level (2–5 yrs) | Senior (5–8 yrs) | Staff / Principal (8+ yrs)
#     salary       — Under $80k | $80k – $100k | $100k – $130k | $130k – $160k | $160k+
#     type         — Full-time | Part-time | Contract | Internship
#     date         — Last 24 hours | Last 7 days | Last 30 days
#     q            — keyword search (title, company, tags)

# GET  /jobs/{id}         — single job detail
# GET  /jobs/companies    — companies with open roles + hr_phone
# POST /jobs/{id}/save    — save a job (auth required)
# POST /jobs/{id}/apply   — mark as applied (auth required)
# GET  /jobs/saved        — user's saved jobs (auth required)
# GET  /jobs/applied      — user's applied jobs (auth required)
