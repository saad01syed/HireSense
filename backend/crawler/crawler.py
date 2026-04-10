# crawler/crawler.py
# TODO: Web crawler — runs daily via APScheduler

# Targets (DFW tech job sources — TBD):
#   - Company career pages (direct scrape)
#   - Indeed DFW tech listings
#   - LinkedIn DFW tech listings (check ToS)

# Responsibilities:
#   - Scrape job title, company, location, salary, description,
#     responsibilities, requirements, benefits, posted date
#   - Attempt to find HR phone number on company contact pages
#   - Upsert new jobs into MySQL (insert if new, skip if exists)
#   - Mark jobs as inactive (is_active=False) if no longer found
#   - Log crawl results and errors

# Schedule: daily at 2am (configured in .env CRAWLER_SCHEDULE)
