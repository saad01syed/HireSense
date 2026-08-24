"""Shorten scraped job descriptions with a local Hugging Face seq2seq model."""

import hashlib
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SHORT_CHAR_THRESHOLD = 400
MAX_SOURCE_CHARS = 8000
# DistilBART is roughly limited near 1024 tokens; stay conservative on chars.
CHUNK_CHAR_LIMIT = 2800
CARD_SUMMARY_CHARS = 420
DEFAULT_MODEL = "sshleifer/distilbart-cnn-12-6"

_summarizer: Optional[Tuple[Any, Any]] = None
_summarizer_error: Optional[str] = None


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _model_name() -> str:
    return _env("AI_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL


def _summarization_enabled() -> bool:
    raw = _env("SUMMARIZE_JOB_DESCRIPTIONS", "true").lower()
    return raw not in {"0", "false", "no", "off"}


def is_configured() -> bool:
    return _summarization_enabled() and _get_summarizer() is not None


def _get_summarizer():
    """Load tokenizer + seq2seq model once per process. Downloads on first use."""
    global _summarizer, _summarizer_error

    if _summarizer is not None:
        return _summarizer
    if _summarizer_error is not None:
        return None

    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ImportError as exc:
        _summarizer_error = (
            "transformers is not installed. Run: pip install transformers torch"
        )
        print(f"[ai] {_summarizer_error} ({exc})", flush=True)
        return None

    model_name = _model_name()
    print(f"[ai] loading Hugging Face summarizer model={model_name!r} ...", flush=True)
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        generation_config = getattr(model, "generation_config", None)
        if generation_config is not None and getattr(
            generation_config, "forced_bos_token_id", None
        ) is None:
            generation_config.forced_bos_token_id = 0
        model.eval()
    except Exception as exc:
        _summarizer_error = str(exc)
        print(f"[ai] failed to load summarizer: {exc}", flush=True)
        return None

    _summarizer = (tokenizer, model)
    print("[ai] summarizer ready", flush=True)
    return _summarizer


def _clean_source(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", (text or "").strip())
    cleaned = re.sub(
        r"(?i)\bequal opportunity employer\b.{0,240}",
        " ",
        cleaned,
    )
    cleaned = re.sub(
        r"(?i)\bwe are an equal opportunity\b.{0,240}",
        " ",
        cleaned,
    )
    return re.sub(r"\s+", " ", cleaned).strip()


def _chunk_text(text: str, limit: int = CHUNK_CHAR_LIMIT) -> List[str]:
    if len(text) <= limit:
        return [text]

    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + limit, len(text))
        if end < len(text):
            split_at = text.rfind(". ", start, end)
            if split_at > start + limit // 2:
                end = split_at + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end
    return chunks


def _summary_lengths(source_len: int) -> Dict[str, int]:
    max_len = min(142, max(60, source_len // 12))
    min_len = min(40, max(20, max_len // 3))
    if min_len >= max_len:
        min_len = max(10, max_len - 10)
    return {"max_length": max_len, "min_length": min_len}


def _extractive_summary(text: str) -> str:
    """Card-length fallback when the local model is unavailable or fails."""
    cleaned = _clean_source(text)
    if not cleaned:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", cleaned)
    parts: List[str] = []
    for sentence in sentences:
        candidate = " ".join(parts + [sentence]).strip()
        if parts and len(candidate) > CARD_SUMMARY_CHARS:
            break
        parts.append(sentence)
        if len(candidate) >= CARD_SUMMARY_CHARS:
            break

    summary = " ".join(parts).strip() or cleaned
    if len(summary) > CARD_SUMMARY_CHARS + 80:
        summary = summary[: CARD_SUMMARY_CHARS + 80].rsplit(" ", 1)[0].rstrip(" ,;") + "."
    return summary


def _run_summarizer(text: str) -> str:
    loaded = _get_summarizer()
    if loaded is None:
        return ""

    tokenizer, model = loaded
    lengths = _summary_lengths(len(text))
    try:
        import torch

        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=1024,
        )
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_length=lengths["max_length"],
                min_length=lengths["min_length"],
                num_beams=4,
                length_penalty=2.0,
                early_stopping=True,
                no_repeat_ngram_size=3,
                do_sample=False,
            )
        return tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
    except Exception as exc:
        print(f"[ai] generate() failed: {exc}", flush=True)
        return ""


def _format_summary(
    summary_body: str,
    *,
    job_title: Optional[str] = None,
    company: Optional[str] = None,
) -> str:
    body = re.sub(r"\s+", " ", (summary_body or "").strip())
    title = (job_title or "").strip()
    company_name = (company or "").strip()
    prefix_bits = [bit for bit in (title, company_name) if bit]
    context_prefix = f"{' at '.join(prefix_bits)}. " if prefix_bits else ""
    overview = f"{context_prefix}{body}".strip()
    return f"Overview\n{overview}"


def simplify_job_description(
    raw_description: str,
    *,
    job_title: Optional[str] = None,
    company: Optional[str] = None,
) -> Optional[str]:
    """Return a shortened description, or None if there is nothing to summarize."""
    raw = (raw_description or "").strip()
    if not raw:
        return None

    source = _clean_source(raw[:MAX_SOURCE_CHARS])
    if not source:
        return None

    used_model = False
    summary_body = ""

    if _summarization_enabled() and len(source) >= SHORT_CHAR_THRESHOLD:
        if _get_summarizer() is not None:
            try:
                # Cards only need a short overview; the first chunk is the role intro.
                first_chunk = _chunk_text(source)[0]
                summary_body = _run_summarizer(first_chunk)
                used_model = bool(summary_body)
            except Exception as exc:
                print(
                    f"[ai] summarization failed for {job_title or 'job'!r}: {exc}",
                    flush=True,
                )

    if not summary_body or len(summary_body) < 40:
        summary_body = _extractive_summary(source)
        used_model = False

    summary_body = re.sub(r"\s+", " ", summary_body).strip()
    if not summary_body:
        return None
    if used_model and len(summary_body) >= len(raw):
        summary_body = _extractive_summary(source)

    return _format_summary(summary_body, job_title=job_title, company=company)


def _description_key(raw_description: str) -> str:
    return hashlib.sha256(raw_description.encode("utf-8")).hexdigest()


def simplify_jobs(jobs: List[Dict[str, Any]]) -> None:
    """Set job_description_summary on each job. Never mutates job_description."""
    for job in jobs:
        job.setdefault("job_description_summary", None)

    if not jobs:
        return

    if not _summarization_enabled():
        print("[ai] model rewrite off; using extractive card summaries", flush=True)
    elif _get_summarizer() is None:
        print("[ai] summarizer unavailable; using extractive card summaries", flush=True)

    grouped: Dict[str, Dict[str, Any]] = {}
    for job in jobs:
        raw = (job.get("job_description") or "").strip()
        if not raw:
            continue
        key = _description_key(raw)
        bucket = grouped.setdefault(
            key,
            {
                "raw": raw,
                "title": job.get("job_title") or job.get("title"),
                "company": job.get("company"),
                "jobs": [],
            },
        )
        bucket["jobs"].append(job)

    items: List[Dict[str, Any]] = list(grouped.values())
    if not items:
        print("[ai] no job descriptions available to summarize", flush=True)
        return

    print(
        f"[ai] summarizing {len(items)} unique job description(s) "
        f"with model={_model_name()!r}",
        flush=True,
    )

    rewritten = 0
    fallback = 0
    failed = 0
    for index, item in enumerate(items, start=1):
        summary = simplify_job_description(
            item["raw"],
            job_title=item.get("title"),
            company=item.get("company"),
        )
        if summary:
            if _get_summarizer() is not None and _summarization_enabled() and len(item["raw"]) >= SHORT_CHAR_THRESHOLD:
                rewritten += 1
            else:
                fallback += 1
            for job in item["jobs"]:
                job["job_description_summary"] = summary
        else:
            failed += 1

        if index % 5 == 0 or index == len(items):
            print(f"[ai] summarize progress {index}/{len(items)}", flush=True)

    print(
        f"[ai] description summarize done: unique={len(items)} "
        f"model={rewritten} extractive={fallback} failed={failed}",
        flush=True,
    )


def backfill_missing_summaries() -> int:
    """Write summaries for existing job_data rows that are still null."""
    try:
        from database.queries import (
            fetch_jobs_missing_summaries,
            update_job_description_summary,
        )
    except ImportError:
        from backend.database.queries import (  # type: ignore
            fetch_jobs_missing_summaries,
            update_job_description_summary,
        )

    jobs = fetch_jobs_missing_summaries()
    if not jobs:
        print("[ai] no jobs need summary backfill", flush=True)
        return 0

    print(f"[ai] backfilling summaries for {len(jobs)} job(s)", flush=True)
    simplify_jobs(jobs)

    updated = 0
    for job in jobs:
        summary = (job.get("job_description_summary") or "").strip()
        job_id = job.get("id")
        if not summary or job_id is None:
            continue
        if update_job_description_summary(job_id, summary):
            updated += 1

    print(f"[ai] backfill updated {updated}/{len(jobs)} row(s)", flush=True)
    return updated


if __name__ == "__main__":
    backfill_missing_summaries()
