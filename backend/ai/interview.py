# ai/interview.py
# TODO: AI-powered mock interview feature

# Input:  job description + user's answer to an interview question
# Output: feedback on the answer (clarity, relevance, improvements)

# Steps:
#   - Accept job_id and user answer from API
#   - Pull job description from DB to give the AI context
#   - Send prompt to AI provider (TBD: openai / anthropic)
#   - Return structured feedback: score, strengths, suggestions
