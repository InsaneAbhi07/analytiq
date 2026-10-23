import { screen } from "./scoring";
import type { Application, Candidate, HistoryEvent, Interview, Job, Offer, Plan, Stage } from "./types";
import { stageLabel } from "../lib/ui";

// All mock data is seeded relative to today so the prototype always looks current.
const today = new Date();
today.setHours(0, 0, 0, 0);
export const TODAY = today;
const day = (d: number, h = 0) => new Date(today.getTime() + d * 864e5 + h * 36e5);

export const company = {
  name: "Zenith Fintech Pvt. Ltd.",
  short: "ZF",
  city: "Bengaluru",
  industry: "Financial Services",
  email: "talent@zenithfintech.example",
  slug: "zenith-fintech",
};

export const currentUser = { name: "Abhishek Singh", initials: "AS", role: "Company Admin" };

export const team = [
  { name: "Abhishek Singh", role: "Company Admin", dept: "People Ops" },
  { name: "Rahul Verma", role: "Recruiter", dept: "People Ops" },
  { name: "Simran Kaur", role: "Recruiter", dept: "People Ops" },
  { name: "Ananya Iyer", role: "Interviewer", dept: "Engineering" },
  { name: "Karthik Subramanian", role: "Interviewer", dept: "Data & AI" },
  { name: "Leena D'Souza", role: "Interviewer", dept: "Design" },
];

export const departments = ["Engineering", "Data & AI", "Design", "Platform", "People Ops"];

export const jobs: Job[] = [
  {
    id: 1, title: "Senior .NET Developer", department: "Engineering", location: "Bengaluru", workMode: "Hybrid", employmentType: "Full-time",
    status: "Published", openings: 2, minExp: 5, maxExp: 9, recruiter: "Rahul Verma", hiringManager: "Ananya Iyer",
    required: ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "REST APIs"], preferred: ["Azure", "Docker", "Microservices", "React"],
    education: "B.E./B.Tech/MCA in Computer Science or equivalent experience", deadline: day(18), createdOn: day(-38), salary: "₹18–28 LPA",
    summary: "Build and scale the payments reconciliation platform used by 400+ partner banks. You will own services end-to-end, from API design to production monitoring.",
    responsibilities: ["Design and build REST APIs on ASP.NET Core", "Model data with EF Core and SQL Server, including performance tuning", "Review code and mentor two junior engineers", "Work with product and QA on release planning"],
  },
  {
    id: 2, title: "Data Scientist — NLP", department: "Data & AI", location: "Pune", workMode: "Remote", employmentType: "Full-time",
    status: "Published", openings: 1, minExp: 3, maxExp: 7, recruiter: "Simran Kaur", hiringManager: "Karthik Subramanian",
    required: ["Python", "Machine Learning", "NLP", "SQL", "scikit-learn"], preferred: ["PyTorch", "Transformers", "MLOps", "AWS"],
    education: "Bachelor's or Master's in CS, Statistics, Mathematics or related field", deadline: day(25), createdOn: day(-30), salary: "₹16–26 LPA",
    summary: "Build document-understanding models for loan processing — classification, entity extraction and summarisation over scanned and digital documents.",
    responsibilities: ["Train and evaluate NLP models on internal document corpora", "Ship models behind versioned APIs with monitoring", "Partner with compliance on model documentation"],
  },
  {
    id: 3, title: "Product Designer (UI/UX)", department: "Design", location: "Bengaluru", workMode: "On-site", employmentType: "Full-time",
    status: "Published", openings: 1, minExp: 3, maxExp: 6, recruiter: "Rahul Verma", hiringManager: "Leena D'Souza",
    required: ["Figma", "Prototyping", "User Research", "Design Systems"], preferred: ["Accessibility", "HTML/CSS", "Usability Testing"],
    education: "Degree in Design, HCI or equivalent portfolio", deadline: day(12), createdOn: day(-24), salary: "₹12–20 LPA",
    summary: "Own the end-to-end experience of our merchant dashboard, from research through high-fidelity prototypes and design-system contributions.",
    responsibilities: ["Run discovery interviews with merchants", "Produce flows, prototypes and specs in Figma", "Maintain and extend the design system"],
  },
  {
    id: 4, title: "QA Automation Engineer", department: "Engineering", location: "Hyderabad", workMode: "Hybrid", employmentType: "Full-time",
    status: "Paused", openings: 1, minExp: 3, maxExp: 6, recruiter: "Simran Kaur", hiringManager: "Ananya Iyer",
    required: ["Selenium", "C#", "API Testing", "Test Automation"], preferred: ["SpecFlow", "Azure DevOps", "Postman"],
    education: "B.E./B.Tech or equivalent", deadline: day(30), createdOn: day(-35), salary: "₹10–16 LPA",
    summary: "Build the automated regression suite for our core banking integrations.",
    responsibilities: ["Automate UI and API regression tests", "Integrate suites into CI pipelines", "Triage and report defects"],
  },
  {
    id: 5, title: "DevOps Engineer", department: "Platform", location: "Remote (India)", workMode: "Remote", employmentType: "Full-time",
    status: "Draft", openings: 1, minExp: 4, maxExp: 8, recruiter: "Rahul Verma", hiringManager: "Ananya Iyer",
    required: ["Azure", "Kubernetes", "Terraform", "CI/CD"], preferred: ["Docker", "Prometheus"],
    education: "Any graduate with relevant experience", deadline: day(40), createdOn: day(-2), salary: "₹18–30 LPA",
    summary: "Run and automate the infrastructure behind our payment APIs.",
    responsibilities: ["Manage AKS clusters and Terraform modules", "Own CI/CD pipelines", "Improve observability and on-call tooling"],
  },
  {
    id: 6, title: "HR Executive", department: "People Ops", location: "Bengaluru", workMode: "On-site", employmentType: "Full-time",
    status: "Closed", openings: 1, minExp: 1, maxExp: 4, recruiter: "Abhishek Singh", hiringManager: "Abhishek Singh",
    required: ["Recruitment", "HRMS", "Communication"], preferred: ["MS Excel", "Employee Engagement"],
    education: "MBA/PGDM in HR preferred", deadline: day(-20), createdOn: day(-62), salary: "₹5–8 LPA",
    summary: "Support end-to-end hiring and onboarding for a growing team.",
    responsibilities: ["Coordinate interviews and offers", "Maintain HRMS records", "Run onboarding sessions"],
  },
];

const W = (role: string, company: string, period: string, summary: string) => ({ role, company, period, summary });

export const candidates: Candidate[] = [
  { id: 1, name: "Aarav Mehta", email: "aarav.mehta@mail.example", phone: "+91 98450 11223", location: "Pune", headline: "Senior Software Engineer · .NET", experience: 6.5, parsingConfidence: 96, resumeFile: "Aarav_Mehta_Resume.pdf", resumeKb: 184, links: ["linkedin.com/in/aarav-mehta-dev"],
    skills: ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "REST APIs", "Azure", "Docker", "Microservices", "Git", "xUnit"],
    education: ["B.Tech, Computer Engineering — COEP Pune (2018)"], certifications: ["Microsoft Certified: Azure Developer Associate (AZ-204)"],
    work: [W("Senior Software Engineer", "Finlytics Solutions", "Jan 2022 – Present", "Led a team of 4 building REST APIs on ASP.NET Core 8 with Entity Framework Core and SQL Server; migrated 6 services to Docker on Azure."),
           W("Software Engineer", "Inferra Tech", "Jul 2018 – Dec 2021", "Built C# microservices for loan origination; wrote xUnit test suites and tuned SQL Server queries (40% latency reduction).")],
    projects: ["Real-time settlement ledger (event sourcing, Azure Service Bus)", "Internal API gateway with rate limiting"] },
  { id: 2, name: "Sneha Kulkarni", email: "sneha.k@mail.example", phone: "+91 99220 44871", location: "Mumbai", headline: "Software Developer · .NET / Web", experience: 5, parsingConfidence: 91, resumeFile: "Sneha_Kulkarni_CV.docx", resumeKb: 96,
    skills: ["C#", "ASP.NET MVC", "Entity Framework", "T-SQL", "REST APIs", "JavaScript", "React", "Git", "Selenium"], education: ["MCA — University of Mumbai (2019)"], certifications: [],
    work: [W("Software Developer", "Retailora", "Aug 2019 – Present", "Developed ASP.NET MVC portals in C# with Entity Framework and T-SQL stored procedures; built React dashboards consuming REST APIs.")],
    projects: ["Inventory forecasting portal", "Vendor onboarding workflow"] },
  { id: 3, name: "Mohammed Faizan", email: "faizan.m@mail.example", phone: "+91 90000 31415", location: "Hyderabad", headline: "Lead Engineer · .NET & Cloud", experience: 8, parsingConfidence: 94, resumeFile: "Faizan_Resume_2026.pdf", resumeKb: 212,
    skills: ["C#", ".NET Framework", "ASP.NET Core", "SQL Server", "REST APIs", "Azure DevOps", "Kubernetes", "Angular", "WCF"], education: ["B.E., Information Technology — Osmania University (2017)"], certifications: ["Certified Kubernetes Application Developer (CKAD)"],
    work: [W("Lead Engineer", "Paysphere", "Mar 2021 – Present", "Owns ASP.NET Core payment APIs on Kubernetes; set up Azure DevOps release pipelines; mentors 6 engineers."),
           W("Senior Developer", "Cognit Systems", "Jun 2017 – Feb 2021", "Maintained .NET Framework WCF services and SQL Server reporting for insurance clients.")],
    projects: ["Card tokenisation service", "Legacy WCF → REST migration"] },
  { id: 4, name: "Kavya Reddy", email: "kavya.reddy@mail.example", phone: "+91 97400 55660", location: "Bengaluru", headline: "Full-stack Developer", experience: 2.5, parsingConfidence: 89, resumeFile: "KavyaReddy.pdf", resumeKb: 140, links: ["kavyareddy.dev"],
    skills: ["C#", "ASP.NET Core", "SQL Server", "React", "Figma", "HTML/CSS", "Git"], education: ["B.Tech, CSE — PES University (2023)"], certifications: [],
    work: [W("Associate Developer", "Brightbyte Labs", "Jun 2023 – Present", "Builds ASP.NET Core and React features; prototypes UI in Figma with HTML/CSS handoff.")], projects: ["Campus events app (React + ASP.NET Core)"] },
  { id: 5, name: "Rohan Das", email: "rohan.das@mail.example", phone: "+91 98300 77881", location: "Kolkata", headline: "Software Engineer", experience: null, parsingConfidence: 58, resumeFile: "Rohan_Das_scan.pdf", resumeKb: 2310,
    skills: ["C#", "SQL", "REST APIs", "Java"], education: ["B.Tech — (institution not extracted)"], certifications: [],
    work: [W("Software Engineer", "(not extracted)", "(dates not extracted)", "Worked on C# and Java backend services with SQL databases and REST APIs.")], projects: [],
    warnings: ["Pages 2–3 appear to be scanned images. OCR isn't configured, so their text wasn't extracted."] },
  { id: 6, name: "Ishita Banerjee", email: "ishita.b@mail.example", phone: "+91 98111 20304", location: "Pune", headline: "Data Scientist · NLP", experience: 5, parsingConfidence: 95, resumeFile: "Ishita_Banerjee_DS.pdf", resumeKb: 168,
    skills: ["Python", "Machine Learning", "NLP", "SQL", "scikit-learn", "PyTorch", "Transformers", "Pandas", "Power BI"], education: ["M.Sc. Statistics — University of Pune (2020)"], certifications: ["DeepLearning.AI NLP Specialization"],
    work: [W("Data Scientist", "Lendwise", "Aug 2021 – Present", "Built NLP document classifiers with Transformers and PyTorch; productionised scikit-learn credit models; wrote SQL feature pipelines."),
           W("Analyst", "Quantix", "Jul 2020 – Jul 2021", "Python and Pandas analysis; Power BI reporting.")], projects: ["KYC document entity extraction (F1 0.91)"] },
  { id: 7, name: "Vikram Singh", email: "vikram.singh@mail.example", phone: "+91 98720 66110", location: "Chandigarh", headline: "ML Engineer", experience: 3, parsingConfidence: 88, resumeFile: "Vikram_Singh_ML.pdf", resumeKb: 122, links: ["github.com/vikram-ml"],
    skills: ["Python", "Machine Learning", "SQL", "scikit-learn", "Pandas", "Tableau", "AWS"], education: ["B.Tech, ECE — Punjab Engineering College (2022)"], certifications: ["AWS Certified Cloud Practitioner"],
    work: [W("ML Engineer", "Agrinova", "Jul 2022 – Present", "Built scikit-learn crop-yield models in Python; deployed on AWS; SQL data pipelines.")], projects: ["Sentiment analysis of farmer feedback (open-source)"] },
  { id: 8, name: "Neha Gupta", email: "neha.gupta@mail.example", phone: "+91 99990 12121", location: "Delhi NCR", headline: "Senior Data Scientist", experience: 7, parsingConfidence: 93, resumeFile: "NehaGupta_Resume.docx", resumeKb: 88,
    skills: ["Python", "NLP", "PyTorch", "Transformers", "MLOps", "AWS", "Docker", "SQL"], education: ["M.Tech, CSE — IIIT Delhi (2019)"], certifications: [],
    work: [W("Senior Data Scientist", "Textsense AI", "Jan 2019 – Present", "Leads NLP model development in PyTorch and Transformers; built MLOps pipelines on AWS with Docker.")], projects: ["Multilingual intent classifier (Hindi/English)"] },
  { id: 9, name: "Arjun Nair", email: "arjun.nair@mail.example", phone: "+91 94470 33221", location: "Kochi", headline: "—", experience: null, parsingConfidence: null, resumeFile: "Arjun_Nair.pdf", resumeKb: 205, skills: [], education: [], certifications: [], work: [], projects: [] },
  { id: 10, name: "Pooja Joshi", email: "pooja.joshi@mail.example", phone: "+91 98900 45678", location: "Bengaluru", headline: "Product Designer", experience: 4, parsingConfidence: 92, resumeFile: "Pooja_Joshi_Design.pdf", resumeKb: 1460, links: ["behance.net/poojajoshi"],
    skills: ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility", "Adobe XD"], education: ["B.Des — NID Ahmedabad (2022)"], certifications: ["Google UX Design Certificate"],
    work: [W("Product Designer", "Shopnest", "Jun 2022 – Present", "Ran User Research with 40+ merchants; built Figma Prototyping flows and contributed 60 components to the Design Systems library with Accessibility audits.")], projects: ["Checkout redesign (+11% conversion)"] },
  { id: 11, name: "Siddharth Rao", email: "sid.rao@mail.example", phone: "+91 99000 88776", location: "Bengaluru", headline: "Senior UX Designer", experience: 6, parsingConfidence: 90, resumeFile: "Siddharth_Rao_UX.pdf", resumeKb: 980, links: ["sidrao.design"],
    skills: ["Figma", "Sketch", "Wireframing", "Usability Testing", "Design Systems", "Accessibility", "HTML/CSS"], education: ["M.Des, Interaction Design — IIT Bombay (2020)"], certifications: [],
    work: [W("Senior UX Designer", "Travelloop", "Jul 2020 – Present", "Owns Design Systems in Figma; runs Usability Testing and Wireframing for mobile booking flows; ships HTML/CSS prototypes.")], projects: ["Accessible booking flow (WCAG 2.2 AA)"] },
  { id: 12, name: "Meera Pillai", email: "meera.pillai@mail.example", phone: "+91 94000 12345", location: "Thiruvananthapuram", headline: "—", experience: null, parsingConfidence: null, resumeFile: "Meera_Pillai_Portfolio.docx", resumeKb: 4120, skills: [], education: [], certifications: [], work: [], projects: [] },
  { id: 13, name: "Karan Malhotra", email: "karan.m@mail.example", phone: "+91 98100 99887", location: "Hyderabad", headline: "SDET", experience: 5, parsingConfidence: 94, resumeFile: "Karan_Malhotra_SDET.pdf", resumeKb: 132,
    skills: ["Selenium", "C#", "SpecFlow", "API Testing", "Postman", "Azure DevOps", "Test Automation"], education: ["B.Tech, IT — JNTU Hyderabad (2020)"], certifications: ["ISTQB Foundation"],
    work: [W("SDET", "Banksoft", "Jul 2020 – Present", "Built Selenium + SpecFlow suites in C#; API Testing with Postman; integrated Test Automation into Azure DevOps.")], projects: [] },
  { id: 14, name: "Tanvi Shah", email: "tanvi.shah@mail.example", phone: "+91 98250 11009", location: "Ahmedabad", headline: "QA Engineer", experience: 3, parsingConfidence: 86, resumeFile: "Tanvi_Shah_QA.pdf", resumeKb: 110,
    skills: ["Selenium", "Java", "TestNG", "Jira", "Postman"], education: ["B.E., Computer — Gujarat University (2023)"], certifications: [],
    work: [W("QA Engineer", "Cloudmint", "Jun 2023 – Present", "Writes Selenium tests in Java with TestNG; manual API checks in Postman.")], projects: [] },
  { id: 15, name: "Rahul Khanna", email: "rahul.khanna@mail.example", phone: "+91 98860 22113", location: "Bengaluru", headline: "HR Generalist", experience: 2, parsingConfidence: 92, resumeFile: "Rahul_Khanna_HR.pdf", resumeKb: 90,
    skills: ["Talent Acquisition", "HRMS", "MS Excel", "Employee Engagement"], education: ["MBA, HR — Christ University (2024)"], certifications: [],
    work: [W("HR Associate", "Peoplefirst", "Jun 2024 – Present", "End-to-end Talent Acquisition for 30+ roles; maintained HRMS records; ran Employee Engagement surveys in MS Excel.")], projects: [] },
  { id: 16, name: "Divya Menon", email: "divya.menon@mail.example", phone: "+91 97890 33445", location: "Bengaluru", headline: "HR Coordinator", experience: 1.5, parsingConfidence: 90, resumeFile: "Divya_Menon.pdf", resumeKb: 76,
    skills: ["Recruitment", "HR Operations", "MS Excel"], education: ["MBA, HR — Symbiosis (2025)"], certifications: [],
    work: [W("HR Coordinator", "Staffly", "Apr 2025 – Present", "Coordinated Recruitment drives and HR Operations; MS Excel trackers.")], projects: [] },
  { id: 17, name: "Ankit Saxena", email: "ankit.saxena@mail.example", phone: "+91 98390 77665", location: "Lucknow", headline: "Java Developer", experience: 6, parsingConfidence: 93, resumeFile: "Ankit_Saxena.pdf", resumeKb: 150,
    skills: ["Java", "Spring Boot", "SQL", "REST APIs", "Docker", "Microservices"], education: ["B.Tech — AKTU (2019)"], certifications: ["Oracle Certified Professional, Java SE 17"],
    work: [W("Senior Java Developer", "Telenet Systems", "Jul 2019 – Present", "Spring Boot Microservices with REST APIs, Docker deployments and SQL databases.")], projects: [] },
  { id: 18, name: "Riya Chatterjee", email: "riya.c@mail.example", phone: "+91 98310 66554", location: "Kolkata", headline: "—", experience: null, parsingConfidence: null, resumeFile: "Riya_Chatterjee_CV.pdf", resumeKb: 174, skills: [], education: [], certifications: [], work: [], projects: [] },
];

type Seed = Omit<Application, "screening" | "history" | "notes"> & { notes?: Application["notes"] };

const seedApps: Seed[] = [
  { id: 1, candidateId: 1, jobId: 1, appliedOn: day(-14, 10.2), processing: "Completed", stage: "Interview", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-7K2Q9",
    notes: [{ on: day(-6, 11), by: "Rahul Verma", text: "Strong API design discussion in phone screen. Confirmed 4 years on ASP.NET Core in production." },
            { on: day(-3, 16), by: "Ananya Iyer", text: "Round 1 went well — see feedback. Recommend system-design round next." }] },
  { id: 2, candidateId: 2, jobId: 1, appliedOn: day(-11, 14.5), processing: "Completed", stage: "Shortlisted", recruiter: "Rahul Verma", source: "LinkedIn", trackingCode: "ZF-3M8D1" },
  { id: 3, candidateId: 3, jobId: 1, appliedOn: day(-9, 9.1), processing: "Completed", stage: "Interview", recruiter: "Rahul Verma", source: "Referral", trackingCode: "ZF-9P4T6" },
  { id: 4, candidateId: 4, jobId: 1, appliedOn: day(-7, 18.3), processing: "Completed", stage: "OnHold", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-2H7L5", stageReason: "Below experience band; reconsider for mid-level opening",
    notes: [{ on: day(-4, 12), by: "Rahul Verma", text: "Good fundamentals but below the experience band for this role. Keeping on hold; may suit a mid-level opening." }] },
  { id: 5, candidateId: 5, jobId: 1, appliedOn: day(-2, 11.4), processing: "NeedsReview", stage: "New", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-6R1N3",
    notes: [{ on: day(-1, 10), by: "Rahul Verma", text: "Resume looks partly scanned. Experience dates didn't extract — check manually before deciding." }] },
  { id: 6, candidateId: 17, jobId: 1, appliedOn: day(-12, 12), processing: "Completed", stage: "Rejected", recruiter: "Rahul Verma", source: "Naukri", trackingCode: "ZF-8J5W2", stageReason: "No production .NET experience — confirmed in phone screen" },
  { id: 7, candidateId: 6, jobId: 2, appliedOn: day(-26, 10), processing: "Completed", stage: "Offer", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-4C9X7" },
  { id: 8, candidateId: 7, jobId: 2, appliedOn: day(-10, 16.2), processing: "Completed", stage: "Shortlisted", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-1B6V8", stageReason: "AI score overridden: portfolio shows NLP project (see note)",
    notes: [{ on: day(-1, 11), by: "Simran Kaur", text: "Override: no NLP evidence found in resume, but portfolio shows a published sentiment-analysis project. Shortlisting." }] },
  { id: 9, candidateId: 8, jobId: 2, appliedOn: day(-8, 9.7), processing: "Completed", stage: "Interview", recruiter: "Simran Kaur", source: "LinkedIn", trackingCode: "ZF-5F3K4" },
  { id: 10, candidateId: 9, jobId: 2, appliedOn: day(0, 9.3), processing: "Processing", stage: "New", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-0D2Y6" },
  { id: 11, candidateId: 18, jobId: 2, appliedOn: day(0, 9.35), processing: "Queued", stage: "New", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-7G8H1" },
  { id: 12, candidateId: 10, jobId: 3, appliedOn: day(-13, 13), processing: "Completed", stage: "Interview", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-3T5R9" },
  { id: 13, candidateId: 11, jobId: 3, appliedOn: day(-20, 11), processing: "Completed", stage: "Offer", recruiter: "Rahul Verma", source: "Referral", trackingCode: "ZF-9K1M2" },
  { id: 14, candidateId: 12, jobId: 3, appliedOn: day(0, 8.2), processing: "Failed", processingError: "File is corrupted or password-protected", stage: "New", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-2W4Q8" },
  { id: 15, candidateId: 4, jobId: 3, appliedOn: day(-5, 19), processing: "Completed", stage: "Screening", recruiter: "Rahul Verma", source: "Careers page", trackingCode: "ZF-6N7P3" },
  { id: 16, candidateId: 13, jobId: 4, appliedOn: day(-21, 10.5), processing: "Completed", stage: "OnHold", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-8X2C5", stageReason: "Requisition paused by hiring manager" },
  { id: 17, candidateId: 15, jobId: 6, appliedOn: day(-55, 10), processing: "Completed", stage: "Hired", recruiter: "Abhishek Singh", source: "Careers page", trackingCode: "ZF-1L9S4" },
  { id: 18, candidateId: 16, jobId: 6, appliedOn: day(-57, 15), processing: "Completed", stage: "Withdrawn", recruiter: "Abhishek Singh", source: "Naukri", trackingCode: "ZF-4V6B7", stageReason: "Offer declined — accepted another offer" },
  { id: 19, candidateId: 14, jobId: 4, appliedOn: day(-18, 12.5), processing: "Completed", stage: "InfoRequested", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-5Q3E1", stageReason: "Asked for C# automation samples" },
  { id: 20, candidateId: 2, jobId: 4, appliedOn: day(-6, 17), processing: "Completed", stage: "Screening", recruiter: "Simran Kaur", source: "Careers page", trackingCode: "ZF-0R8T2" },
];

const PATHS: Record<Stage, Stage[]> = {
  New: [],
  Screening: ["Screening"],
  Shortlisted: ["Screening", "Shortlisted"],
  OnHold: ["Screening", "OnHold"],
  InfoRequested: ["Screening", "InfoRequested"],
  Interview: ["Screening", "Shortlisted", "Interview"],
  Offer: ["Screening", "Shortlisted", "Interview", "Offer"],
  Hired: ["Screening", "Shortlisted", "Interview", "Offer", "Hired"],
  Rejected: ["Screening", "Rejected"],
  Withdrawn: ["Screening", "Shortlisted", "Interview", "Offer", "Withdrawn"],
};

function buildHistory(app: Application): HistoryEvent[] {
  const ev: HistoryEvent[] = [
    { on: app.appliedOn, title: "Application submitted", by: "Candidate", kind: "info" },
    { on: new Date(app.appliedOn.getTime() + 6e4), title: "Resume stored privately and queued", by: "System", kind: "muted" },
  ];
  const at = new Date(app.appliedOn.getTime() + 4 * 6e4);
  if (app.processing === "Completed") ev.push({ on: at, title: `Screening completed — match score ${app.screening!.score}`, by: "AI service", kind: "ai" });
  if (app.processing === "NeedsReview") ev.push({ on: at, title: `Screening completed with warnings — score ${app.screening!.score}`, by: "AI service", kind: "warning" });
  if (app.processing === "Failed") ev.push({ on: at, title: "Resume processing failed after 3 attempts", by: "AI service", reason: app.processingError, kind: "danger" });

  const path = PATHS[app.stage];
  const span = Math.max(1, (today.getTime() - app.appliedOn.getTime()) / 864e5 - 0.5);
  path.forEach((s, i) => {
    const on = new Date(app.appliedOn.getTime() + (span / path.length) * (i + 1) * 864e5);
    on.setHours(10 + i, 0, 0, 0);
    ev.push({
      on, title: stageLabel(s), by: s === "Withdrawn" ? "Candidate" : app.recruiter,
      reason: i === path.length - 1 ? app.stageReason : undefined,
      kind: s === "Rejected" ? "danger" : s === "Hired" ? "success" : ["OnHold", "InfoRequested", "Withdrawn"].includes(s) ? "warning" : "primary",
    });
  });
  return ev.sort((a, b) => a.on.getTime() - b.on.getTime());
}

export const jobById = (id: number) => jobs.find((j) => j.id === id)!;
export const candidateById = (id: number) => candidates.find((c) => c.id === id)!;

export const initialApplications: Application[] = seedApps.map((s) => {
  const app: Application = { ...s, notes: s.notes ?? [], screening: null, history: [] };
  if (app.processing === "Completed" || app.processing === "NeedsReview")
    app.screening = screen(candidateById(app.candidateId), jobById(app.jobId), new Date(app.appliedOn.getTime() + 4 * 6e4));
  app.history = buildHistory(app);
  return app;
});

export const interviews: Interview[] = [
  { id: 1, applicationId: 1, round: 1, title: "Technical — APIs & data", type: "Video", startsAt: day(-4, 11), duration: 60, location: "Google Meet", interviewers: ["Ananya Iyer"], status: "Completed",
    feedback: { by: "Ananya Iyer", technical: 4, problemSolving: 4, communication: 5, roleKnowledge: 4, recommendation: "Advance", evidence: "Designed an idempotent payment API end-to-end, explained EF Core tracking vs no-tracking trade-offs correctly. Minor gaps on distributed caching." } },
  { id: 2, applicationId: 1, round: 2, title: "System design", type: "Video", startsAt: day(2, 15), duration: 75, location: "Google Meet", interviewers: ["Ananya Iyer", "Abhishek Singh"], status: "Scheduled" },
  { id: 3, applicationId: 3, round: 1, title: "Technical — APIs & data", type: "Video", startsAt: day(1, 11.5), duration: 60, location: "Microsoft Teams", interviewers: ["Ananya Iyer"], status: "Scheduled" },
  { id: 4, applicationId: 7, round: 1, title: "ML case study", type: "Video", startsAt: day(-15, 14), duration: 60, location: "Google Meet", interviewers: ["Karthik Subramanian"], status: "Completed",
    feedback: { by: "Karthik Subramanian", technical: 5, problemSolving: 5, communication: 4, roleKnowledge: 5, recommendation: "Strong advance", evidence: "Walked through KYC extraction project with clear evaluation methodology; proposed a sensible approach for class imbalance." } },
  { id: 5, applicationId: 9, round: 1, title: "ML case study", type: "Video", startsAt: day(0, 16), duration: 60, location: "Google Meet", interviewers: ["Karthik Subramanian"], status: "Scheduled" },
  { id: 6, applicationId: 12, round: 1, title: "Portfolio review", type: "On-site", startsAt: day(3, 12), duration: 90, location: "Zenith HQ, Koramangala — Room 4B", interviewers: ["Leena D'Souza", "Rahul Verma"], status: "Scheduled" },
  { id: 7, applicationId: 13, round: 1, title: "Portfolio review", type: "On-site", startsAt: day(-12, 12), duration: 90, location: "Zenith HQ, Koramangala — Room 4B", interviewers: ["Leena D'Souza"], status: "Completed",
    feedback: { by: "Leena D'Souza", technical: 4, problemSolving: 5, communication: 4, roleKnowledge: 4, recommendation: "Advance", evidence: "Strong accessibility rationale in booking-flow case study; clear research-to-design traceability." } },
  { id: 8, applicationId: 16, round: 1, title: "Automation walkthrough", type: "Phone", startsAt: day(-9, 10), duration: 45, location: "Phone", interviewers: ["Ananya Iyer"], status: "Cancelled" },
  { id: 9, applicationId: 17, round: 1, title: "HR panel", type: "On-site", startsAt: day(-40, 11), duration: 45, location: "Zenith HQ", interviewers: ["Abhishek Singh"], status: "Completed",
    feedback: { by: "Abhishek Singh", technical: 4, problemSolving: 4, communication: 5, roleKnowledge: 4, recommendation: "Advance", evidence: "Clear examples of high-volume hiring coordination and HRMS data hygiene." } },
];

export const offers: Offer[] = [
  { id: 1, applicationId: 7, designation: "Data Scientist II", ctcLakh: 22.5, joining: day(35), sentOn: day(-2), status: "Sent", preparedBy: "Simran Kaur" },
  { id: 2, applicationId: 13, designation: "Senior Product Designer", ctcLakh: 17, joining: day(45), status: "Draft", preparedBy: "Rahul Verma" },
  { id: 3, applicationId: 17, designation: "HR Executive", ctcLakh: 6.2, joining: day(-12), sentOn: day(-30), status: "Joined", preparedBy: "Abhishek Singh" },
  { id: 4, applicationId: 18, designation: "HR Executive", ctcLakh: 5.8, joining: day(-12), sentOn: day(-34), status: "Declined", preparedBy: "Abhishek Singh" },
];

export const plans: Plan[] = [
  { name: "Starter", tagline: "For small teams starting structured hiring", monthly: 2999, annual: 29990, jobs: "3", credits: "100 / month", seats: "2", storage: "1 GB",
    features: ["Careers page", "Resume parsing (PDF/DOCX)", "Basic skill matching", "Email support"] },
  { name: "Growth", tagline: "For growing teams hiring every month", monthly: 7999, annual: 79990, jobs: "10", credits: "500 / month", seats: "5", storage: "5 GB", highlight: true,
    features: ["Everything in Starter", "Semantic skill matching", "Interview scheduling & feedback", "Offer tracking", "Analytics dashboard"] },
  { name: "Professional", tagline: "For recruitment teams at scale", monthly: 18999, annual: 189990, jobs: "30", credits: "2,000 / month", seats: "15", storage: "20 GB",
    features: ["Everything in Growth", "AI job-description drafts", "Candidate comparison", "Custom scoring weights", "Priority support"] },
  { name: "Enterprise", tagline: "Custom limits, SSO and dedicated hosting", monthly: null, annual: null, jobs: "Custom", credits: "Custom", seats: "Custom", storage: "Custom",
    features: ["Everything in Professional", "SSO / SAML", "Dedicated AI inference node", "Data residency options", "SLA & account manager"] },
];

// ---------- Platform (Super Admin) data: tenant-level aggregates only, no candidate content ----------

export interface Tenant {
  id: number; name: string; industry: string; city: string; email: string; plan: string;
  status: "Active" | "Trial" | "Suspended" | "Deactivated"; users: number; activeJobs: number; creditsUsed: number; creditsLimit: number; createdOn: Date;
}

const month = (m: number) => new Date(today.getFullYear(), today.getMonth() - m, today.getDate());

export const tenants: Tenant[] = [
  { id: 1, name: company.name, industry: "Financial Services", city: "Bengaluru", email: company.email, plan: "Growth", status: "Active", users: 6, activeJobs: 3, creditsUsed: 312, creditsLimit: 500, createdOn: month(7) },
  { id: 2, name: "Kalpa Health Systems", industry: "Healthcare", city: "Chennai", email: "hr@kalpahealth.example", plan: "Professional", status: "Active", users: 14, activeJobs: 19, creditsUsed: 1488, creditsLimit: 2000, createdOn: month(11) },
  { id: 3, name: "Orbit Logistics", industry: "Logistics", city: "Gurugram", email: "people@orbitlogistics.example", plan: "Starter", status: "Active", users: 2, activeJobs: 3, creditsUsed: 97, creditsLimit: 100, createdOn: month(3) },
  { id: 4, name: "Saffron Retail", industry: "Retail", city: "Mumbai", email: "careers@saffronretail.example", plan: "Growth", status: "Active", users: 5, activeJobs: 8, creditsUsed: 221, creditsLimit: 500, createdOn: month(5) },
  { id: 5, name: "Vertex Infra Projects", industry: "Construction", city: "Ahmedabad", email: "hr@vertexinfra.example", plan: "Starter", status: "Suspended", users: 2, activeJobs: 0, creditsUsed: 100, creditsLimit: 100, createdOn: month(9) },
  { id: 6, name: "Brightpath EdTech", industry: "Education", city: "Noida", email: "talent@brightpath.example", plan: "Enterprise", status: "Active", users: 38, activeJobs: 44, creditsUsed: 5210, creditsLimit: 8000, createdOn: month(14) },
  { id: 7, name: "Nimbus Cloudworks", industry: "Software", city: "Pune", email: "hiring@nimbuscloud.example", plan: "Professional", status: "Trial", users: 4, activeJobs: 6, creditsUsed: 58, creditsLimit: 200, createdOn: day(-9) },
  { id: 8, name: "Lotus Hospitality", industry: "Hospitality", city: "Jaipur", email: "hr@lotushospitality.example", plan: "Starter", status: "Deactivated", users: 1, activeJobs: 0, creditsUsed: 0, creditsLimit: 100, createdOn: month(10) },
];

export const auditLog = [
  { on: day(0, 9.2), actor: "abhishek.singh@zenithfintech.example", company: company.name, action: "Resume downloaded", target: "Application #1 · Aarav Mehta", ip: "103.21.44.10", severity: "Info" },
  { on: day(0, 8.9), actor: "rahul.verma@zenithfintech.example", company: company.name, action: "Stage changed → Shortlisted", target: "Application #2 · Sneha Kulkarni", ip: "103.21.44.12", severity: "Info" },
  { on: day(0, 8.1), actor: "system", company: "Kalpa Health Systems", action: "Usage limit warning (90%)", target: "Resume credits", ip: "—", severity: "Warning" },
  { on: day(0, 7.4), actor: "unknown", company: "—", action: "Login throttled (5 failed attempts)", target: "admin@orbitlogistics.example", ip: "45.155.22.8", severity: "High" },
  { on: day(-1, 21), actor: "platform-admin@analytiq.example", company: "Vertex Infra Projects", action: "Company suspended", target: "Reason: payment overdue > grace period", ip: "10.0.0.4", severity: "Warning" },
  { on: day(-1, 18), actor: "system", company: company.name, action: "Cross-tenant request blocked", target: "GET /candidates/2041 (owned by tenant 2)", ip: "103.21.44.12", severity: "High" },
  { on: day(-1, 11), actor: "simran.kaur@zenithfintech.example", company: company.name, action: "AI score overridden", target: "Application #8 · Vikram Singh (reason recorded)", ip: "103.21.44.15", severity: "Info" },
  { on: day(-1, 10), actor: "platform-admin@analytiq.example", company: "Nimbus Cloudworks", action: "Plan assigned → Professional (trial)", target: "Subscription", ip: "10.0.0.4", severity: "Info" },
  { on: day(-2, 15), actor: "abhishek.singh@zenithfintech.example", company: company.name, action: "User invited", target: "leena.dsouza@zenithfintech.example (Interviewer)", ip: "103.21.44.10", severity: "Info" },
  { on: day(-2, 9), actor: "system", company: "Brightpath EdTech", action: "Retention policy purge", target: "142 candidate records older than 24 months", ip: "—", severity: "Info" },
] as const;

export const processingJobs = [
  { id: "rp-8f21", company: company.name, fileType: "PDF", status: "Processing", attempts: 1, durationMs: 0, queuedOn: day(0, 9.3) },
  { id: "rp-8f1e", company: company.name, fileType: "DOCX", status: "Queued", attempts: 0, durationMs: 0, queuedOn: day(0, 9.35) },
  { id: "rp-8f0a", company: "Kalpa Health Systems", fileType: "PDF", status: "Completed", attempts: 1, durationMs: 2140, queuedOn: day(0, 9.1) },
  { id: "rp-8ef3", company: "Brightpath EdTech", fileType: "PDF", status: "NeedsReview", attempts: 1, durationMs: 3890, queuedOn: day(0, 8.8), error: "Low text density — possible scanned document" },
  { id: "rp-8ee7", company: company.name, fileType: "DOCX", status: "Failed", attempts: 3, durationMs: 310, queuedOn: day(0, 8.2), error: "File is corrupted or password-protected" },
  { id: "rp-8ed2", company: "Saffron Retail", fileType: "PDF", status: "Completed", attempts: 2, durationMs: 1820, queuedOn: day(0, 7.9) },
] as const;

export const planSubscribers: Record<string, number> = { Starter: 23, Growth: 41, Professional: 12, Enterprise: 3 };

export const subscription = {
  plan: "Growth",
  cycle: "Monthly",
  status: "Active",
  periodStart: day(-22),
  renewsOn: day(8),
  usage: [
    { name: "Active job postings", used: jobs.filter((j) => j.status === "Published").length, limit: 10, unit: "" },
    { name: "Resume-processing credits", used: 312, limit: 500, unit: "" },
    { name: "Recruiter seats", used: 3, limit: 5, unit: "" },
    { name: "Resume storage", used: 1.8, limit: 5, unit: "GB" },
  ],
  invoices: [
    { number: "ANQ-2026-0412", issued: day(-22), amount: 9438.82, status: "Paid" },
    { number: "ANQ-2026-0347", issued: day(-52), amount: 9438.82, status: "Paid" },
    { number: "ANQ-2026-0281", issued: day(-83), amount: 3538.82, status: "Paid" },
    { number: "ANQ-2026-0219", issued: day(-113), amount: 3538.82, status: "Paid" },
  ],
};
