import type { Candidate, Job, Screening, ScoreComponent, SkillMatch } from "./types";

// Weighted, explainable matching — the same contract the real AI service will implement.
export const WEIGHTS = { required: 60, preferred: 20, experience: 20 } as const;
export const SEMANTIC_CREDIT = 0.7;
export const SEMANTIC_THRESHOLD = 0.7;
export const MODEL_VERSION = "all-MiniLM-L6-v2 · matcher 0.3.0";
export const CONFIG_VERSION = "weights-60/20/20 · cfg-2026.10";

// Related skills with mock cosine similarities from the local embedding model.
const RELATED: Record<string, [string, number][]> = {
  "ASP.NET Core": [["ASP.NET MVC", 0.84], [".NET Framework", 0.72]],
  "SQL Server": [["T-SQL", 0.88], ["SQL", 0.74]],
  "Entity Framework Core": [["Entity Framework", 0.91]],
  Azure: [["Azure DevOps", 0.79]],
  Docker: [["Kubernetes", 0.72]],
  "Machine Learning": [["scikit-learn", 0.8], ["TensorFlow", 0.78]],
  NLP: [["Transformers", 0.81]],
  Prototyping: [["Wireframing", 0.81]],
  "User Research": [["Usability Testing", 0.77]],
  "Test Automation": [["Selenium", 0.83]],
  Recruitment: [["Talent Acquisition", 0.9]],
  HRMS: [["HR Operations", 0.73]],
};

const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function buildMatch(c: Candidate, skill: string, term: string, type: SkillMatch["type"], similarity: number): SkillMatch {
  const work = c.work.find((w) => w.summary.toLowerCase().includes(term.toLowerCase()));
  return work
    ? { skill, term, type, similarity, section: `Experience · ${work.role}, ${work.company}`, evidence: work.summary }
    : { skill, term, type, similarity, section: "Skills section", evidence: `Listed under Skills: “${term}” (no supporting project or role detail found)` };
}

function matchSkill(c: Candidate, skill: string): SkillMatch | null {
  const exact = c.skills.find((s) => eq(s, skill));
  if (exact) return buildMatch(c, skill, exact, "Exact", 1);
  for (const [term, sim] of (RELATED[skill] ?? []).filter(([, s]) => s >= SEMANTIC_THRESHOLD).sort((a, b) => b[1] - a[1])) {
    const found = c.skills.find((s) => eq(s, term));
    if (found) return buildMatch(c, skill, found, "Semantic", sim);
  }
  return null;
}

const credit = (m: SkillMatch) => (m.type === "Exact" ? 1 : SEMANTIC_CREDIT);
const describe = (matched: SkillMatch[], total: number) =>
  `${matched.filter((m) => m.type === "Exact").length} exact + ${matched.filter((m) => m.type === "Semantic").length} related of ${total}`;

export function screen(c: Candidate, job: Job, screenedOn: Date): Screening {
  const split = (skills: string[]) => {
    const matched: SkillMatch[] = [];
    const missing: string[] = [];
    for (const s of skills) {
      const m = matchSkill(c, s);
      if (m) matched.push(m);
      else missing.push(s);
    }
    return { matched, missing };
  };
  const req = split(job.required);
  const pref = split(job.preferred);

  let exp: ScoreComponent;
  if (c.experience == null) {
    exp = { name: "Relevant experience", weight: WEIGHTS.experience, fraction: null, detail: "Not reliably extracted — needs verification" };
  } else {
    const meets = c.experience >= job.minExp;
    exp = {
      name: "Relevant experience",
      weight: WEIGHTS.experience,
      fraction: meets ? 1 : Math.max(0, c.experience / job.minExp),
      detail: meets
        ? `${c.experience} yrs meets the ${job.minExp}–${job.maxExp} yrs requirement`
        : `${c.experience} yrs against a ${job.minExp} yrs minimum (pro-rated)`,
    };
  }

  const components: ScoreComponent[] = [
    { name: "Required skills", weight: WEIGHTS.required, fraction: job.required.length ? req.matched.reduce((s, m) => s + credit(m), 0) / job.required.length : null, detail: describe(req.matched, job.required.length) },
    { name: "Preferred skills", weight: WEIGHTS.preferred, fraction: job.preferred.length ? pref.matched.reduce((s, m) => s + credit(m), 0) / job.preferred.length : null, detail: describe(pref.matched, job.preferred.length) },
    exp,
  ];

  // Unknown criteria are excluded and the score re-normalised — never guessed.
  const known = components.filter((x) => x.fraction != null);
  const totalWeight = known.reduce((s, x) => s + x.weight, 0);
  const score = totalWeight ? Math.round((known.reduce((s, x) => s + x.weight * x.fraction!, 0) / totalWeight) * 100) : 0;

  const warnings: string[] = [];
  if (exp.fraction == null) warnings.push("Experience could not be reliably extracted, so it was excluded and the score re-normalised over the remaining criteria. Verify manually.");
  if (c.parsingConfidence != null && c.parsingConfidence < 70) warnings.push(`Low parsing confidence (${c.parsingConfidence}%). Check the extracted data against the original resume.`);
  if (job.required.some((s) => eq(s, "Communication"))) warnings.push("“Communication” is a soft skill and can't be verified from resume text. Assess it at interview.");
  warnings.push(...(c.warnings ?? []));

  return {
    score,
    requiredMatched: req.matched,
    requiredMissing: req.missing,
    preferredMatched: pref.matched,
    preferredMissing: pref.missing,
    components,
    warnings,
    modelVersion: MODEL_VERSION,
    configVersion: CONFIG_VERSION,
    screenedOn,
  };
}
