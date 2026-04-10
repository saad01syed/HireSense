from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.jobs import router as jobs_router
from api.resume import router as resume_router
from api.routers import auth

app = FastAPI(title="HireSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(resume_router)
app.include_router(auth.router)


@app.get("/")
def read_root():
    return {"message": "HireSense backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
