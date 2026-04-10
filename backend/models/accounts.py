from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(100), unique=True, nullable=False)
    email         = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    joined_at     = Column(DateTime, default=datetime.utcnow)

    sessions      = relationship("UserSession", back_populates="user", cascade="all, delete")
    saved_jobs    = relationship("SavedJob", back_populates="user", cascade="all, delete")
    applied_jobs  = relationship("AppliedJob", back_populates="user", cascade="all, delete")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    token      = Column(String(512), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id       = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id   = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job  = relationship("Job", back_populates="saved_by")

class AppliedJob(Base):
    __tablename__ = "applied_jobs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id     = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status     = Column(String(50), nullable=False, default="applied")
    applied_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="applied_jobs")
    job  = relationship("Job", back_populates="applied_by")
