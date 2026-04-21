import json
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from api.schemas import (
    FinalInterviewResultOut,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewFeedbackOut,
    InterviewQuestionOut,
    InterviewStartRequest,
)
from database.connection import get_db
from database.models import InterviewResponse, InterviewSession, Job, UserSession
from services.interview_service import (
    build_final_result,
    evaluate_answer,
    generate_interview_questions,
)

router = APIRouter(prefix="/interview", tags=["interview"])


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None

    prefix = "bearer "
    if authorization.lower().startswith(prefix):
        return authorization[len(prefix):].strip()

    return authorization.strip()


def _resolve_user_id(db: Session, authorization: Optional[str]) -> Optional[int]:
    token = _extract_bearer_token(authorization)
    if not token:
        return None

    session = db.query(UserSession).filter(UserSession.token == token).first()
    if not session:
        return None

    return session.user_id


def _job_snapshot(job: Job) -> dict:
    return {
        "id": job.id,
        "job_title": job.job_title,
        "company": job.company,
        "location": job.location,
        "job_description": job.job_description,
        "skills": job.skills,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "work_style": job.work_style,
    }


def _question_out(session: InterviewSession, question: dict, question_index: int) -> InterviewQuestionOut:
    return InterviewQuestionOut(
        session_id=session.id,
        question_index=question_index + 1,
        total_questions=session.total_questions,
        question_id=question["question_id"],
        focus_area=question["focus_area"],
        prompt=question["prompt"],
        tips=question.get("tips", []),
    )


@router.post("/start", response_model=InterviewQuestionOut)
def start_interview(
    body: InterviewStartRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == body.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    resume_payload = body.resume_data.model_dump()
    job_payload = _job_snapshot(job)

    question_set = generate_interview_questions(job_payload, resume_payload)
    if not question_set:
        raise HTTPException(status_code=500, detail="Could not generate interview questions.")

    user_id = _resolve_user_id(db, authorization)

    session = InterviewSession(
        user_id=user_id,
        job_id=job.id,
        status="in_progress",
        current_question_index=0,
        total_questions=len(question_set),
        job_snapshot=json.dumps(job_payload),
        resume_snapshot=json.dumps(resume_payload),
        question_set=json.dumps(question_set),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return _question_out(session, question_set[0], 0)


@router.post("/{session_id}/answer", response_model=InterviewAnswerResponse)
def answer_interview_question(
    session_id: int,
    body: InterviewAnswerRequest,
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    if session.status == "completed":
        raise HTTPException(status_code=400, detail="This interview session is already completed.")

    question_set = json.loads(session.question_set)
    current_index = session.current_question_index

    if current_index >= len(question_set):
        raise HTTPException(status_code=400, detail="No remaining interview questions.")

    current_question = question_set[current_index]
    feedback = evaluate_answer(current_question, body.answer)

    response = InterviewResponse(
        session_id=session.id,
        question_id=current_question["question_id"],
        question_index=current_index,
        question_prompt=current_question["prompt"],
        answer_text=body.answer,
        score=feedback["score"],
        benchmark=feedback["benchmark"],
        feedback_json=json.dumps(feedback),
    )
    db.add(response)

    is_last_question = current_index >= len(question_set) - 1

    if is_last_question:
        db.flush()

        saved_responses = (
            db.query(InterviewResponse)
            .filter(InterviewResponse.session_id == session.id)
            .all()
        )

        response_payloads = [
            {
                "score": item.score,
                "feedback": json.loads(item.feedback_json),
            }
            for item in saved_responses
        ]

        final_result = build_final_result(response_payloads)

        session.status = "completed"
        session.current_question_index = len(question_set)
        session.final_score = final_result["final_score"]
        session.overall_summary = final_result["overall_summary"]

        db.commit()

        return InterviewAnswerResponse(
            session_id=session.id,
            question_index=current_index + 1,
            is_complete=True,
            feedback=InterviewFeedbackOut(**feedback),
            next_question=None,
            final_result=FinalInterviewResultOut(**final_result),
        )

    session.current_question_index = current_index + 1
    db.commit()
    db.refresh(session)

    next_question = question_set[session.current_question_index]

    return InterviewAnswerResponse(
        session_id=session.id,
        question_index=current_index + 1,
        is_complete=False,
        feedback=InterviewFeedbackOut(**feedback),
        next_question=_question_out(session, next_question, session.current_question_index),
        final_result=None,
    )