# ai/resume_analysis.py
# TODO: Resume analysis feature

# Input:  uploaded resume file (PDF / DOCX / TXT)
# Output: skill scores, overall match score, insights

# Steps:
#   - Extract text from uploaded file
#   - Send text to AI provider (TBD: openai / anthropic)
#   - AI returns: extracted skills, scores per skill (0-100),
#     overall score, positive insights, gaps, tips
#   - Save analysis JSON to Resume table in DB
#   - Return analysis to frontend
