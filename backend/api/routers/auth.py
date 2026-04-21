from datetime import datetime, timedelta
from secrets import token_hex

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from api.schemas import SignupRequest, LoginRequest, AuthResponse
from database.connection import get_db
from database.models import User, UserSession

router = APIRouter(prefix="/auth", tags=["auth"])

# Stable password hashing for this project setup
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)


@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == body.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == body.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=body.username,
        email=body.email,
        password_hash=pwd_context.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = token_hex(64)
    session = UserSession(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    db.add(session)
    db.commit()

    return {"token": token, "user": user}


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = token_hex(64)
    session = UserSession(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    db.add(session)
    db.commit()

    return {"token": token, "user": user}


@router.post("/logout")
def logout(token: str, db: Session = Depends(get_db)):
    session = db.query(UserSession).filter(UserSession.token == token).first()

    if session:
        db.delete(session)
        db.commit()

    return {"message": "Logged out"}