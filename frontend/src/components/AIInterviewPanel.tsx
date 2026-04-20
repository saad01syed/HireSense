import { useState } from "react";

interface Job {
  job_id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}

interface ResumeAnalysis {
  resume_id: number;
  user_id: number;
  detected_skills: { name: string; score?: number }[];
  summary: string;
  score: number;
}

interface InterviewQuestion {
  id: number;
  question: string;
}

interface FeedbackResult {
  feedback: string;
  score: number;
  suggestion: string;
}

const MOCK_JOB: Job = {
  job_id: 1,
  title: "Software Engineer Intern",
  company: "Ericsson",
  location: "Dallas, TX",
  description: "Build scalable backend services and APIs.",
  requirements: ["Python", "React", "REST APIs", "Git"],
};

const MOCK_RESUME: ResumeAnalysis = {
  resume_id: 1,
  user_id: 1,
  detected_skills: [
    { name: "Python", score: 92 },
    { name: "React", score: 80 },
    { name: "FastAPI", score: 85 },
  ],
  summary: "Strong backend and full stack experience with solid project work.",
  score: 88,
};

function generateQuestions(job: Job, resume: ResumeAnalysis): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let id = 1;

  questions.push({
    id: id++,
    question: `Why are you interested in the ${job.title} role at ${job.company}?`,
  });

  const matchedSkills = job.requirements.filter((req) =>
    resume.detected_skills.some(
      (s) => s.name.toLowerCase() === req.toLowerCase()
    )
  );

  matchedSkills.slice(0, 2).forEach((skill) => {
    questions.push({
      id: id++,
      question: `Can you walk me through a project where you used ${skill}?`,
    });
  });

  const missingSkills = job.requirements.filter(
    (req) =>
      !resume.detected_skills.some(
        (s) => s.name.toLowerCase() === req.toLowerCase()
      )
  );

  if (missingSkills.length > 0) {
    questions.push({
      id: id++,
      question: `The role requires ${missingSkills[0]}. How would you approach learning or working with it?`,
    });
  }

  questions.push({
    id: id++,
    question: "Tell me about a time you had to debug a difficult problem. How did you approach it?",
  });

  return questions;
}

function generateFeedback(answer: string): FeedbackResult {
  const wordCount = answer.trim().split(/\s+/).length;

  if (wordCount < 10) {
    return {
      feedback: "Your answer was quite short. Try to elaborate more with specific examples.",
      score: 40,
      suggestion: "Use the STAR method: Situation, Task, Action, Result.",
    };
  }

  if (wordCount < 30) {
    return {
      feedback: "Good start, but adding a concrete example would strengthen your answer.",
      score: 65,
      suggestion: "Try to mention a specific project or outcome.",
    };
  }

  return {
    feedback: "Good answer! You provided detail and context.",
    score: 85,
    suggestion: "Consider quantifying your impact (e.g. 'reduced load time by 30%') to make it even stronger.",
  };
}

export default function AIInterviewPanel() {
  const job = MOCK_JOB;
  const resume = MOCK_RESUME;

  const [stage, setStage] = useState<"idle" | "questions" | "answering" | "feedback" | "done">("idle");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [allFeedback, setAllFeedback] = useState<{ question: string; answer: string; result: FeedbackResult }[]>([]);

  function handleStart() {
    const generated = generateQuestions(job, resume);
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setAllFeedback([]);
    setStage("answering");
  }

  function handleGenerateOnly() {
    const generated = generateQuestions(job, resume);
    setQuestions(generated);
    setStage("questions");
  }

  function handleSubmitAnswer() {
    if (!answer.trim()) return;
    const result = generateFeedback(answer);
    setFeedback(result);
    setAllFeedback((prev) => [
      ...prev,
      { question: questions[currentIndex].question, answer, result },
    ]);
    setStage("feedback");
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setFeedback(null);
      setStage("answering");
    } else {
      setStage("done");
    }
  }

  function handleRestart() {
    setStage("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setAllFeedback([]);
  }

  const overallScore =
    allFeedback.length > 0
      ? Math.round(allFeedback.reduce((sum, f) => sum + f.result.score, 0) / allFeedback.length)
      : null;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", maxWidth: "420px", fontFamily: "sans-serif", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "18px" }}>🎙️</span>
        <span style={{ fontWeight: 600, fontSize: "15px" }}>AI Interview Practice</span>
      </div>
      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "16px" }}>
        Practice interview questions tailored to this role and your resume.
      </p>

      {stage === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={handleStart} style={btnPrimary}>Start Interview</button>
          <button onClick={handleGenerateOnly} style={btnSecondary}>Generate Practice Questions</button>
        </div>
      )}

      {stage === "questions" && (
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Practice Questions for {job.title}:</p>
          <ol style={{ paddingLeft: "18px", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
            {questions.map((q) => <li key={q.id}>{q.question}</li>)}
          </ol>
          <button onClick={handleStart} style={{ ...btnPrimary, marginTop: "16px" }}>Start Interview</button>
        </div>
      )}

      {stage === "answering" && (
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Question {currentIndex + 1} of {questions.length}</div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b", marginBottom: "12px", lineHeight: "1.5" }}>{questions[currentIndex].question}</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." rows={5} style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
          <button onClick={handleSubmitAnswer} disabled={!answer.trim()} style={{ ...btnPrimary, marginTop: "10px", opacity: answer.trim() ? 1 : 0.5 }}>Submit Answer</button>
        </div>
      )}

      {stage === "feedback" && feedback && (
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Question {currentIndex + 1} of {questions.length}</div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b", marginBottom: "10px" }}>{questions[currentIndex].question}</p>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
              <span>Score</span>
              <span style={{ fontWeight: 600, color: scoreColor(feedback.score) }}>{feedback.score}/100</span>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: "99px", height: "6px" }}>
              <div style={{ width: `${feedback.score}%`, background: scoreColor(feedback.score), height: "6px", borderRadius: "99px", transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px", marginBottom: "10px", fontSize: "13px", color: "#334155" }}>
            <strong>Feedback:</strong> {feedback.feedback}
          </div>
          <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "12px", marginBottom: "14px", fontSize: "13px", color: "#1e40af" }}>
            <strong>Tip:</strong> {feedback.suggestion}
          </div>
          <button onClick={handleNext} style={btnPrimary}>{currentIndex + 1 < questions.length ? "Next Question →" : "See Results"}</button>
        </div>
      )}

      {stage === "done" && (
        <div>
          <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "8px" }}>Interview Complete 🎉</p>
          {overallScore !== null && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                <span>Overall Score</span>
                <span style={{ fontWeight: 700, color: scoreColor(overallScore) }}>{overallScore}/100</span>
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: "99px", height: "8px" }}>
                <div style={{ width: `${overallScore}%`, background: scoreColor(overallScore), height: "8px", borderRadius: "99px" }} />
              </div>
            </div>
          )}
          {allFeedback.map((item, i) => (
            <div key={i} style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", marginTop: "10px", fontSize: "13px" }}>
              <p style={{ fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}>Q{i + 1}: {item.question}</p>
              <p style={{ color: "#64748b", marginBottom: "4px" }}>Your answer: {item.answer}</p>
              <p style={{ color: scoreColor(item.result.score) }}>Score: {item.result.score}/100 — {item.result.feedback}</p>
            </div>
          ))}
          <button onClick={handleRestart} style={{ ...btnSecondary, marginTop: "16px" }}>Restart</button>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  width: "100%", padding: "10px", background: "#fff", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
};

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}