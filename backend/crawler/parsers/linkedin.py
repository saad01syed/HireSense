import re
from datetime import date, timedelta
from urllib.parse import parse_qs, unquote, urlparse

import requests
from bs4 import BeautifulSoup

try:
    from backend.crawler.parsers.skills_catalog import TECH_SKILLS
except ImportError:
    try:
        from crawler.parsers.skills_catalog import TECH_SKILLS
    except ImportError:
        from parsers.skills_catalog import TECH_SKILLS


BASE_URL = "https://www.linkedin.com"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def _safe_text(node):
    return node.get_text(" ", strip=True) if node else None


def _normalize_relative_date(relative_text):
    if not relative_text:
        return None

    text = relative_text.strip().lower()
    today = date.today()

    if "today" in text or "just now" in text:
        return today.strftime("%Y-%m-%d")
    if "yesterday" in text:
        return (today - timedelta(days=1)).strftime("%Y-%m-%d")

    match = re.search(r"(\d+)\s+(hour|day|week|month|year)s?", text)
    if not match:
        return None

    amount = int(match.group(1))
    unit = match.group(2)

    if unit == "hour":
        delta = timedelta(days=0)
    elif unit == "day":
        delta = timedelta(days=amount)
    elif unit == "week":
        delta = timedelta(days=7 * amount)
    elif unit == "month":
        delta = timedelta(days=30 * amount)
    else:  # year
        delta = timedelta(days=365 * amount)

    return (today - delta).strftime("%Y-%m-%d")


def _normalize_linkedin_text(text):
    if not text:
        return ""
    return (
        text.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\xa0", " ")
    )


def _extract_skills_from_description(description):
    normalized = _normalize_linkedin_text(description).lower()
    found = []
    for skill in TECH_SKILLS:
        pattern = r"(?<![A-Za-z0-9])" + re.escape(skill.lower()) + r"(?![A-Za-z0-9])"
        if re.search(pattern, normalized):
            found.append(skill)
    return found


def _normalize_href(href):
    if not href:
        return None
    if href.startswith("/"):
        return f"{BASE_URL}{href}"
    return href


def _is_noise_link(href):
    if not href:
        return True
    lowered = href.lower()
    blocked_tokens = (
        "/legal/",
        "/signup/",
        "/login",
        "/uas/login",
        "request-password-reset",
        "cookie-policy",
        "privacy-policy",
        "user-agreement",
    )
    return any(token in lowered for token in blocked_tokens)


def _is_external_apply_link(href):
    if not href:
        return False
    lowered = href.lower()
    blocked_domains = (
        "linkedin.com",
        "licdn.com",
        "static.licdn.com",
    )
    return not any(domain in lowered for domain in blocked_domains)


def _normalize_location(location_text):
    if not location_text:
        return None
    cleaned = location_text.replace(" Metroplex", "").strip()
    city = cleaned.split(",")[0].strip()
    return city or location_text.strip()


def _extract_external_url_from_description(description):
    if not description:
        return None

    url_with_scheme = re.findall(r"https?://[^\s)>,]+", description)
    bare_www = re.findall(r"\bwww\.[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[^\s)>,]*)?", description)
    candidates = url_with_scheme + [f"https://{value}" for value in bare_www]

    external = [url.rstrip(".,;") for url in candidates if _is_external_apply_link(url)]
    if not external:
        return None

    for url in external:
        lowered = url.lower()
        if any(token in lowered for token in ("apply", "career", "careers", "jobs")):
            return url
    return None


def _extract_external_redirect(href):
    if not href or "linkedin.com" not in href.lower():
        return None
    parsed = urlparse(href)
    query = parse_qs(parsed.query)
    for key in ("url", "redirect", "redirect_url"):
        values = query.get(key)
        if not values:
            continue
        decoded = unquote(values[0])
        if _is_external_apply_link(decoded):
            return decoded
    return None


def _extract_salary_from_description(description):
    if not description:
        return None

    text = _normalize_linkedin_text(description)

    range_pattern = re.search(
        r"([$€£]\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?\s?(?:-|to)\s?[$€£]?\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?(?:\s*/\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?)",
        text,
    )
    if range_pattern:
        return range_pattern.group(1).strip()

    single_pattern = re.search(
        r"((?:USD|EUR|GBP)\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?(?:\s*/\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?|[$€£]\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?(?:\s*/\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?)",
        text,
        flags=re.IGNORECASE,
    )
    if single_pattern:
        return single_pattern.group(1).strip()

    return None


def _parse_salary_number(raw_amount):
    if not raw_amount:
        return None
    amount_text = raw_amount.strip().replace(",", "")
    multiplier = 1
    if amount_text.lower().endswith("k"):
        multiplier = 1000
        amount_text = amount_text[:-1].strip()
    try:
        return float(amount_text) * multiplier
    except ValueError:
        return None


def _salary_period_multiplier(salary_text):
    text = salary_text.lower()
    if any(token in text for token in ("/hour", "per hour", "/hr", " hourly")):
        return 2080
    if any(token in text for token in ("/day", "per day", " daily")):
        return 260
    if any(token in text for token in ("/week", "per week", " weekly", "/wk")):
        return 52
    if any(token in text for token in ("/month", "per month", " monthly", "/mo")):
        return 12
    return 1


def _normalize_salary_to_annual(salary_text):
    if not salary_text:
        return None

    amounts = re.findall(r"\d[\d,]*(?:\.\d+)?\s*[kK]?", salary_text)
    values = [value for value in (_parse_salary_number(item) for item in amounts) if value]
    if not values:
        return None

    base_value = values[0] if len(values) == 1 else (values[0] + values[1]) / 2
    annual_salary = base_value * _salary_period_multiplier(salary_text)
    return int(round(annual_salary))

def _extract_search_params(start_url):
    parsed = urlparse(start_url)
    query = parse_qs(parsed.query)
    return {
        "keywords": query.get("keywords", [""])[0],
        "location": query.get("location", [""])[0],
    }

def _extract_job_ids(search_html):
    soup = BeautifulSoup(search_html, "html.parser")
    job_ids = []

    for item in soup.select("li"):
        job_id = item.get("data-entity-urn", "").split(":")[-1]
        if job_id and job_id.isdigit():
            job_ids.append(job_id)
            continue

        fallback_link = item.select_one("a.base-card__full-link")
        if not fallback_link:
            continue
        href = fallback_link.get("href", "")
        if "currentJobId=" in href:
            parsed = urlparse(href)
            current_job_id = parse_qs(parsed.query).get("currentJobId", [None])[0]
            if current_job_id and current_job_id.isdigit():
                job_ids.append(current_job_id)
                continue

        # Newer LinkedIn guest links often encode job id in path:
        # /jobs/view/<slug>-<job_id>
        match = re.search(r"/jobs/view/(?:[^/?#]*-)?(\d+)", href)
        if match:
            job_ids.append(match.group(1))

    # Keep order but remove duplicates
    return list(dict.fromkeys(job_ids))


def _extract_details_from_posting(job_id, session):
    details_url = f"{BASE_URL}/jobs-guest/jobs/api/jobPosting/{job_id}"
    resp = session.get(details_url, timeout=15)
    if resp.status_code != 200:
        return None

    soup = BeautifulSoup(resp.text, "html.parser")
    criteria = {}
    for item in soup.select("li.description__job-criteria-item"):
        header = _safe_text(item.select_one("h3.description__job-criteria-subheader"))
        value = _safe_text(item.select_one("span.description__job-criteria-text"))
        if header and value:
            criteria[header.lower()] = value

    external_candidate = None
    linkedin_candidate = None
    for apply_anchor in soup.select("a"):
        href = _normalize_href(apply_anchor.get("href"))
        if _is_noise_link(href):
            continue

        if _is_external_apply_link(href):
            external_candidate = href
            break

        redirected_external = _extract_external_redirect(href)
        if redirected_external:
            external_candidate = redirected_external
            break

        tracking_name = (apply_anchor.get("data-tracking-control-name") or "").lower()
        classes = " ".join(apply_anchor.get("class", []))
        text = (apply_anchor.get_text(" ", strip=True) or "").lower()
        if (
            "topcard__link" in classes
            or "public_jobs_topcard-title" in tracking_name
            or "apply" in text
        ):
            linkedin_candidate = href

    application_link = external_candidate or linkedin_candidate
    if not application_link:
        application_link = f"{BASE_URL}/jobs/view/{job_id}/"

    description = _normalize_linkedin_text(
        _safe_text(soup.select_one("div.show-more-less-html__markup"))
    )
    salary_text = _safe_text(soup.select_one("span.compensation__salary"))
    if not salary_text:
        salary_text = _extract_salary_from_description(description)
    salary = _normalize_salary_to_annual(salary_text)
    relative_date = _safe_text(soup.select_one("span.posted-time-ago__text"))
    if not external_candidate and application_link and "linkedin.com" in application_link.lower():
        external_from_description = _extract_external_url_from_description(description)
        if external_from_description:
            application_link = external_from_description

    return {
        "job_title": _safe_text(soup.select_one("h2.top-card-layout__title")),
        "company": _safe_text(
            soup.select_one("a.topcard__org-name-link, span.topcard__flavor")
        ),
        "location": _normalize_location(
            _safe_text(soup.select_one("span.topcard__flavor--bullet"))
        ),
        "salary": salary,
        "date_posted": _normalize_relative_date(relative_date),
        "application_link": application_link,
        "job_description": description,
        "skills": _extract_skills_from_description(description),
        "job_type": criteria.get("employment type"),
        "experience_level": criteria.get("seniority level"),
        "work_style": criteria.get("workplace type"),
    }


def parse_job_linkedin(start_url, max_jobs=25):
    search_params = _extract_search_params(start_url)
    jobs = []

    with requests.Session() as session:
        session.headers.update(HEADERS)

        for start in range(0, max_jobs, 25):
            params = {
                "keywords": search_params["keywords"],
                "location": search_params["location"],
                "start": start,
            }
            search_url = f"{BASE_URL}/jobs-guest/jobs/api/seeMoreJobPostings/search"
            search_response = session.get(search_url, params=params, timeout=15)
            if search_response.status_code != 200:
                break

            job_ids = _extract_job_ids(search_response.text)
            if not job_ids:
                break

            for job_id in job_ids:
                try:
                    data = _extract_details_from_posting(job_id, session)
                    if data and data["job_title"] and data["company"]:
                        jobs.append(data)
                    if len(jobs) >= max_jobs:
                        return jobs
                except requests.RequestException:
                    continue

    return jobs