from sqlalchemy import Column, Date, Integer, String, Text
from sqlalchemy.orm import relationship

from database.connection import Base


class Job(Base):
    __tablename__ = "job_data"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    salary = Column(Integer, nullable=True)
    date_posted = Column(Date, nullable=True)
    application_link = Column(String(1000), nullable=True)
    job_description = Column(Text, nullable=True)
    job_description_summary = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    job_type = Column(String(100), nullable=True, default="Full-time")
    experience_level = Column(String(100), nullable=True)
    work_style = Column(String(100), nullable=True, default="On-site")

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete")
    applied_by = relationship("AppliedJob", back_populates="job", cascade="all, delete")