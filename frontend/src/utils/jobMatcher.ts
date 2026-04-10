type MatchableJob = {
  title?: string;
  company?: string;
  description?: string | { about?: string };
  tags?: string[];
  skills?: string[];
};

type ResumeParsedData = {
  skills?: string[];
  summary?: string;
};

export type JobMatchResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
};

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function uniqueNormalized(values: string[] = []): string[] {
  const seen = new Set<string>();

  values.forEach((value) => {
    const normalized = normalizeSkill(value);
    if (normalized) {
      seen.add(normalized);
    }
  });

  return Array.from(seen);
}

function toDisplayCase(skill: string): string {
  return skill
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export function matchResumeToJob(
  resumeData: ResumeParsedData | undefined,
  job: MatchableJob | undefined
): JobMatchResult {
  const resumeSkills = uniqueNormalized(resumeData?.skills ?? []);
  const jobSkills = uniqueNormalized([...(job?.tags ?? []), ...(job?.skills ?? [])]);

  if (jobSkills.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      recommendation:
        "No job skills were available for matching yet. Add job tags or skills to improve this comparison.",
    };
  }

  const matchedSkills = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill));

  const rawScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
  const matchScore = Math.max(0, Math.min(100, rawScore));

  let recommendation = "";

  if (matchScore >= 80) {
    recommendation =
      "Strong fit. Your resume already aligns well with this role’s listed skills.";
  } else if (matchScore >= 60) {
    recommendation =
      "Solid match. You meet several of the core skills, but there are a few gaps you could address.";
  } else if (matchScore >= 40) {
    recommendation =
      "Moderate match. You have some overlap, but tailoring your resume for the missing skills would help.";
  } else {
    recommendation =
      "Low match right now. You may need more relevant skills or stronger resume tailoring for this role.";
  }

  return {
    matchScore,
    matchedSkills: matchedSkills.map(toDisplayCase),
    missingSkills: missingSkills.map(toDisplayCase),
    recommendation,
  };
}