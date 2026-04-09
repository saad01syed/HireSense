from parsers.linkedin import parse_job_linkedin

TEST_URL = "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Dallas-Fort%20Worth"

jobs = parse_job_linkedin(TEST_URL)

print(f"Found {len(jobs)} jobs\n")

for x in jobs:
    print(x.get("job_title"))
    print(x.get("company"))
    print(x.get("location"))
    print(x.get("salary"))
    print(x.get("date_posted"))
    print(x.get("application_link"))
    print(x.get("job_description"))
    print(x.get("skills"))
    print(x.get("job_type"))
    print(x.get("experience_level"))
    print(x.get("work_style"))