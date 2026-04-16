# api/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
# TODO: Pydantic schemas for request/response validation

# JobOut       — job listing returned to frontend
# JobDetailOut — full job with description, responsibilities, etc.
# CompanyOut   — company info including hr_phone
# ResumeIn     — uploaded file metadata
# ResumeOut    — analysis results (skills, score, insights)
# InterviewIn  — job_id + user_answer
# InterviewOut — feedback (score, strengths, suggestions)
# UserCreate   — signup payload
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
# UserLogin    — login payload
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    joined_at: datetime

    class Config:
        from_attributes = True
# Token        — JWT auth token response
class AuthResponse(BaseModel):
    token: str
    user: UserOut

