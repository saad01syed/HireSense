from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from database.connection import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("job_data.id"), nullable=False)

    status = Column(String(40), nullable=False, default="in_progress")
    current_question_index = Column(Integer, nullable=False, default=0)
    total_questions = Column(Integer, nullable=False, default=0)

    final_score = Column(Integer, nullable=True)
    overall_summary = Column(Text, nullable=True)

    job_snapshot = Column(Text, nullable=False)
    resume_snapshot = Column(Text, nullable=False)
    question_set = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)

    question_id = Column(String(100), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_prompt = Column(Text, nullable=False)

    answer_text = Column(Text, nullable=False)
    score = Column(Integer, nullable=False)
    benchmark = Column(String(40), nullable=False)
    feedback_json = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)