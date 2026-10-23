using Analytiq.Web.Models.Mock;

namespace Analytiq.Web.Services;

/// <summary>
/// In-memory data for the UI prototype. Everything is seeded relative to today so the
/// screens always look current. Scores are computed with the same weighted, explainable
/// formula the real matching service will use (required 60 / preferred 20 / experience 20),
/// so the explanation panels stay consistent with the numbers shown in tables.
/// Nothing here is persisted; replace with EF Core repositories in the real build.
/// </summary>
public class MockDataStore
{
    public const int RequiredWeight = 60;
    public const int PreferredWeight = 20;
    public const int ExperienceWeight = 20;
    public const double SemanticCredit = 0.7;
    public const double SemanticThreshold = 0.70;
    public const string ModelVersion = "all-MiniLM-L6-v2 · matcher 0.3.0";
    public const string ConfigVersion = "weights-60/20/20 · cfg-2026.10";

    public DateTime Today { get; } = DateTime.Today;

    public Company Company { get; }
    public TeamUser CurrentUser { get; }
    public List<TeamUser> Team { get; }
    public List<Department> Departments { get; }
    public List<Job> Jobs { get; }
    public List<Candidate> Candidates { get; }
    public List<Application> Applications { get; }
    public List<Interview> Interviews { get; }
    public List<Offer> Offers { get; }
    public List<Plan> Plans { get; }
    public Subscription Subscription { get; }
    public List<Invoice> Invoices { get; }
    public List<Company> PlatformCompanies { get; }
    public List<AuditEvent> AuditLog { get; }
    public List<ProcessingJob> ProcessingJobs { get; }

    private static readonly Dictionary<string, (string Term, double Similarity)[]> RelatedSkills =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["ASP.NET Core"] = [("ASP.NET MVC", 0.84), (".NET Framework", 0.72)],
            ["SQL Server"] = [("T-SQL", 0.88), ("SQL", 0.74)],
            ["Entity Framework Core"] = [("Entity Framework", 0.91)],
            ["Azure"] = [("Azure DevOps", 0.79)],
            ["Docker"] = [("Kubernetes", 0.72)],
            ["Machine Learning"] = [("scikit-learn", 0.80), ("TensorFlow", 0.78)],
            ["NLP"] = [("Transformers", 0.81)],
            ["Prototyping"] = [("Wireframing", 0.81)],
            ["User Research"] = [("Usability Testing", 0.77)],
            ["Test Automation"] = [("Selenium", 0.83)],
            ["Recruitment"] = [("Talent Acquisition", 0.90)],
            ["HRMS"] = [("HR Operations", 0.73)],
        };

    public MockDataStore()
    {
        var t = Today;

        Company = new Company
        {
            Id = 1, Name = "Zenith Fintech Pvt. Ltd.", Industry = "Financial Services", Email = "talent@zenithfintech.example",
            City = "Bengaluru", Plan = "Growth", Users = 5, Slug = "zenith-fintech", CreatedOn = t.AddMonths(-7)
        };

        Team =
        [
            new() { Id = 1, Name = "Priya Sharma", Email = "priya.sharma@zenithfintech.example", Role = "Company Admin", Department = "People Ops", LastActive = t.AddHours(9) },
            new() { Id = 2, Name = "Rahul Verma", Email = "rahul.verma@zenithfintech.example", Role = "Recruiter", Department = "People Ops", LastActive = t.AddHours(8.5) },
            new() { Id = 3, Name = "Simran Kaur", Email = "simran.kaur@zenithfintech.example", Role = "Recruiter", Department = "People Ops", LastActive = t.AddDays(-1) },
            new() { Id = 4, Name = "Ananya Iyer", Email = "ananya.iyer@zenithfintech.example", Role = "Interviewer", Department = "Engineering", LastActive = t.AddDays(-2) },
            new() { Id = 5, Name = "Karthik Subramanian", Email = "karthik.s@zenithfintech.example", Role = "Interviewer", Department = "Data & AI", LastActive = t.AddDays(-1) },
            new() { Id = 6, Name = "Leena D'Souza", Email = "leena.dsouza@zenithfintech.example", Role = "Interviewer", Department = "Design", Status = "Invited" },
        ];
        CurrentUser = Team[0];

        Departments =
        [
            new() { Id = 1, Name = "Engineering", Head = "Ananya Iyer", Members = 42 },
            new() { Id = 2, Name = "Data & AI", Head = "Karthik Subramanian", Members = 11 },
            new() { Id = 3, Name = "Design", Head = "Leena D'Souza", Members = 6 },
            new() { Id = 4, Name = "Platform", Head = "Ananya Iyer", Members = 9 },
            new() { Id = 5, Name = "People Ops", Head = "Priya Sharma", Members = 5 },
        ];

        Jobs =
        [
            new()
            {
                Id = 1, Title = "Senior .NET Developer", Department = "Engineering", Location = "Bengaluru", WorkMode = "Hybrid",
                Status = JobStatus.Published, Openings = 2, MinExperience = 5, MaxExperience = 9, Recruiter = "Rahul Verma", HiringManager = "Ananya Iyer",
                RequiredSkills = ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "REST APIs"],
                PreferredSkills = ["Azure", "Docker", "Microservices", "React"],
                Education = "B.E./B.Tech/MCA in Computer Science or equivalent experience",
                Deadline = t.AddDays(18), CreatedOn = t.AddDays(-38), Salary = "₹18–28 LPA",
                Summary = "Build and scale the payments reconciliation platform used by 400+ partner banks. You will own services end-to-end, from API design to production monitoring.",
                Responsibilities = ["Design and build REST APIs on ASP.NET Core", "Model data with EF Core and SQL Server, including performance tuning", "Review code and mentor two junior engineers", "Work with product and QA on release planning"],
                Slug = "senior-dotnet-developer"
            },
            new()
            {
                Id = 2, Title = "Data Scientist — NLP", Department = "Data & AI", Location = "Pune", WorkMode = "Remote",
                Status = JobStatus.Published, Openings = 1, MinExperience = 3, MaxExperience = 7, Recruiter = "Simran Kaur", HiringManager = "Karthik Subramanian",
                RequiredSkills = ["Python", "Machine Learning", "NLP", "SQL", "scikit-learn"],
                PreferredSkills = ["PyTorch", "Transformers", "MLOps", "AWS"],
                Education = "Bachelor's or Master's in CS, Statistics, Mathematics or related field",
                Deadline = t.AddDays(25), CreatedOn = t.AddDays(-30), Salary = "₹16–26 LPA",
                Summary = "Build document-understanding models for loan processing — classification, entity extraction and summarisation over scanned and digital documents.",
                Responsibilities = ["Train and evaluate NLP models on internal document corpora", "Ship models behind versioned APIs with monitoring", "Partner with compliance on model documentation"],
                Slug = "data-scientist-nlp"
            },
            new()
            {
                Id = 3, Title = "Product Designer (UI/UX)", Department = "Design", Location = "Bengaluru", WorkMode = "On-site",
                Status = JobStatus.Published, Openings = 1, MinExperience = 3, MaxExperience = 6, Recruiter = "Rahul Verma", HiringManager = "Leena D'Souza",
                RequiredSkills = ["Figma", "Prototyping", "User Research", "Design Systems"],
                PreferredSkills = ["Accessibility", "HTML/CSS", "Usability Testing"],
                Education = "Degree in Design, HCI or equivalent portfolio",
                Deadline = t.AddDays(12), CreatedOn = t.AddDays(-24), Salary = "₹12–20 LPA",
                Summary = "Own the end-to-end experience of our merchant dashboard, from research through high-fidelity prototypes and design-system contributions.",
                Responsibilities = ["Run discovery interviews with merchants", "Produce flows, prototypes and specs in Figma", "Maintain and extend the design system"],
                Slug = "product-designer"
            },
            new()
            {
                Id = 4, Title = "QA Automation Engineer", Department = "Engineering", Location = "Hyderabad", WorkMode = "Hybrid",
                Status = JobStatus.Paused, Openings = 1, MinExperience = 3, MaxExperience = 6, Recruiter = "Simran Kaur", HiringManager = "Ananya Iyer",
                RequiredSkills = ["Selenium", "C#", "API Testing", "Test Automation"],
                PreferredSkills = ["SpecFlow", "Azure DevOps", "Postman"],
                Education = "B.E./B.Tech or equivalent",
                Deadline = t.AddDays(30), CreatedOn = t.AddDays(-35), Salary = "₹10–16 LPA",
                Summary = "Build the automated regression suite for our core banking integrations.",
                Responsibilities = ["Automate UI and API regression tests", "Integrate suites into CI pipelines", "Triage and report defects"],
                Slug = "qa-automation-engineer"
            },
            new()
            {
                Id = 5, Title = "DevOps Engineer", Department = "Platform", Location = "Remote (India)", WorkMode = "Remote",
                Status = JobStatus.Draft, Openings = 1, MinExperience = 4, MaxExperience = 8, Recruiter = "Rahul Verma", HiringManager = "Ananya Iyer",
                RequiredSkills = ["Azure", "Kubernetes", "Terraform", "CI/CD"],
                PreferredSkills = ["Docker", "Prometheus"],
                Education = "Any graduate with relevant experience",
                Deadline = t.AddDays(40), CreatedOn = t.AddDays(-2), Salary = "₹18–30 LPA",
                Summary = "Run and automate the infrastructure behind our payment APIs.",
                Responsibilities = ["Manage AKS clusters and Terraform modules", "Own CI/CD pipelines", "Improve observability and on-call tooling"],
                Slug = "devops-engineer"
            },
            new()
            {
                Id = 6, Title = "HR Executive", Department = "People Ops", Location = "Bengaluru", WorkMode = "On-site",
                Status = JobStatus.Closed, Openings = 1, MinExperience = 1, MaxExperience = 4, Recruiter = "Priya Sharma", HiringManager = "Priya Sharma",
                RequiredSkills = ["Recruitment", "HRMS", "Communication"],
                PreferredSkills = ["MS Excel", "Employee Engagement"],
                Education = "MBA/PGDM in HR preferred",
                Deadline = t.AddDays(-20), CreatedOn = t.AddDays(-62), Salary = "₹5–8 LPA",
                Summary = "Support end-to-end hiring and onboarding for a growing team.",
                Responsibilities = ["Coordinate interviews and offers", "Maintain HRMS records", "Run onboarding sessions"],
                Slug = "hr-executive"
            },
        ];

        Candidates = SeedCandidates();
        Applications = SeedApplications(t);

        foreach (var app in Applications)
        {
            app.Candidate = Candidates.First(c => c.Id == app.CandidateId);
            app.Job = Jobs.First(j => j.Id == app.JobId);
            if (app.Processing is ProcessingStatus.Completed or ProcessingStatus.NeedsReview)
                app.Screening = Screen(app.Candidate, app.Job, app.AppliedOn.AddMinutes(4));
            app.History = BuildHistory(app);
        }
        SeedNotes();

        Interviews = SeedInterviews(t);
        foreach (var i in Interviews) i.Application = Applications.First(a => a.Id == i.ApplicationId);

        Offers =
        [
            new() { Id = 1, ApplicationId = 7, Designation = "Data Scientist II", AnnualCtcLakh = 22.5m, ProposedJoining = t.AddDays(35), SentOn = t.AddDays(-2), Status = OfferStatus.Sent, PreparedBy = "Simran Kaur" },
            new() { Id = 2, ApplicationId = 13, Designation = "Senior Product Designer", AnnualCtcLakh = 17.0m, ProposedJoining = t.AddDays(45), Status = OfferStatus.Draft, PreparedBy = "Rahul Verma" },
            new() { Id = 3, ApplicationId = 17, Designation = "HR Executive", AnnualCtcLakh = 6.2m, ProposedJoining = t.AddDays(-12), SentOn = t.AddDays(-30), RespondedOn = t.AddDays(-27), Status = OfferStatus.Joined, PreparedBy = "Priya Sharma" },
            new() { Id = 4, ApplicationId = 18, Designation = "HR Executive", AnnualCtcLakh = 5.8m, ProposedJoining = t.AddDays(-12), SentOn = t.AddDays(-34), RespondedOn = t.AddDays(-31), Status = OfferStatus.Declined, PreparedBy = "Priya Sharma" },
        ];
        foreach (var o in Offers) o.Application = Applications.First(a => a.Id == o.ApplicationId);

        Plans =
        [
            new() { Name = "Starter", Tagline = "For small teams starting structured hiring", MonthlyPrice = 2999, AnnualPrice = 29990, ActiveJobs = "3", ResumeCredits = "100 / month", Seats = "2", Storage = "1 GB", Subscribers = 23,
                    Features = ["Careers page", "Resume parsing (PDF/DOCX)", "Basic skill matching", "Email support"] },
            new() { Name = "Growth", Tagline = "For growing teams hiring every month", MonthlyPrice = 7999, AnnualPrice = 79990, ActiveJobs = "10", ResumeCredits = "500 / month", Seats = "5", Storage = "5 GB", Highlight = true, Subscribers = 41,
                    Features = ["Everything in Starter", "Semantic skill matching", "Interview scheduling & feedback", "Offer tracking", "Analytics dashboard"] },
            new() { Name = "Professional", Tagline = "For recruitment teams at scale", MonthlyPrice = 18999, AnnualPrice = 189990, ActiveJobs = "30", ResumeCredits = "2,000 / month", Seats = "15", Storage = "20 GB", AdvancedAi = true, Subscribers = 12,
                    Features = ["Everything in Growth", "AI job-description drafts", "Candidate comparison", "Custom scoring weights", "Priority support"] },
            new() { Name = "Enterprise", Tagline = "Custom limits, SSO and dedicated hosting", ActiveJobs = "Custom", ResumeCredits = "Custom", Seats = "Custom", Storage = "Custom", AdvancedAi = true, Subscribers = 3,
                    Features = ["Everything in Professional", "SSO / SAML", "Dedicated AI inference node", "Data residency options", "SLA & account manager"] },
        ];

        Subscription = new Subscription
        {
            Plan = "Growth", Cycle = "Monthly", Status = "Active", PaymentStatus = "Paid (demo billing mode)",
            PeriodStart = t.AddDays(-22), RenewsOn = t.AddDays(8),
            Usage =
            [
                new() { Name = "Active job postings", Used = Jobs.Count(j => j.Status == JobStatus.Published), Limit = 10, Icon = "bi-briefcase" },
                new() { Name = "Resume-processing credits", Used = 312, Limit = 500, Icon = "bi-cpu" },
                new() { Name = "Recruiter seats", Used = Team.Count(u => u.Role is "Company Admin" or "Recruiter"), Limit = 5, Icon = "bi-people" },
                new() { Name = "Resume storage", Used = 1.8, Limit = 5, Unit = "GB", Icon = "bi-hdd" },
            ]
        };

        Invoices =
        [
            new() { Number = "NXT-2026-0412", IssuedOn = t.AddDays(-22), Period = $"{t.AddDays(-22):dd MMM} – {t.AddDays(8):dd MMM yyyy}", Amount = 9438.82m, Status = "Paid" },
            new() { Number = "NXT-2026-0347", IssuedOn = t.AddDays(-52), Period = $"{t.AddDays(-52):dd MMM} – {t.AddDays(-22):dd MMM yyyy}", Amount = 9438.82m, Status = "Paid" },
            new() { Number = "NXT-2026-0281", IssuedOn = t.AddDays(-83), Period = $"{t.AddDays(-83):dd MMM} – {t.AddDays(-52):dd MMM yyyy}", Amount = 3538.82m, Status = "Paid" },
            new() { Number = "NXT-2026-0219", IssuedOn = t.AddDays(-113), Period = $"{t.AddDays(-113):dd MMM} – {t.AddDays(-83):dd MMM yyyy}", Amount = 3538.82m, Status = "Paid" },
        ];

        PlatformCompanies =
        [
            new() { Id = 1, Name = Company.Name, Industry = "Financial Services", City = "Bengaluru", Plan = "Growth", Users = 6, ActiveJobs = 3, CreditsUsed = 312, CreditsLimit = 500, CreatedOn = t.AddMonths(-7), Email = Company.Email },
            new() { Id = 2, Name = "Kalpa Health Systems", Industry = "Healthcare", City = "Chennai", Plan = "Professional", Users = 14, ActiveJobs = 19, CreditsUsed = 1488, CreditsLimit = 2000, CreatedOn = t.AddMonths(-11), Email = "hr@kalpahealth.example" },
            new() { Id = 3, Name = "Orbit Logistics", Industry = "Logistics", City = "Gurugram", Plan = "Starter", Users = 2, ActiveJobs = 3, CreditsUsed = 97, CreditsLimit = 100, CreatedOn = t.AddMonths(-3), Email = "people@orbitlogistics.example" },
            new() { Id = 4, Name = "Saffron Retail", Industry = "Retail", City = "Mumbai", Plan = "Growth", Users = 5, ActiveJobs = 8, CreditsUsed = 221, CreditsLimit = 500, CreatedOn = t.AddMonths(-5), Email = "careers@saffronretail.example" },
            new() { Id = 5, Name = "Vertex Infra Projects", Industry = "Construction", City = "Ahmedabad", Plan = "Starter", Status = "Suspended", Users = 2, ActiveJobs = 0, CreditsUsed = 100, CreditsLimit = 100, CreatedOn = t.AddMonths(-9), Email = "hr@vertexinfra.example" },
            new() { Id = 6, Name = "Brightpath EdTech", Industry = "Education", City = "Noida", Plan = "Enterprise", Users = 38, ActiveJobs = 44, CreditsUsed = 5210, CreditsLimit = 8000, CreatedOn = t.AddMonths(-14), Email = "talent@brightpath.example" },
            new() { Id = 7, Name = "Nimbus Cloudworks", Industry = "Software", City = "Pune", Plan = "Professional", Status = "Trial", Users = 4, ActiveJobs = 6, CreditsUsed = 58, CreditsLimit = 200, CreatedOn = t.AddDays(-9), Email = "hiring@nimbuscloud.example" },
            new() { Id = 8, Name = "Lotus Hospitality", Industry = "Hospitality", City = "Jaipur", Plan = "Starter", Status = "Deactivated", Users = 1, ActiveJobs = 0, CreditsUsed = 0, CreditsLimit = 100, CreatedOn = t.AddMonths(-10), Email = "hr@lotushospitality.example" },
        ];

        AuditLog =
        [
            new() { On = t.AddHours(9.2), Actor = "priya.sharma@zenithfintech.example", Company = Company.Name, Action = "Resume downloaded", Target = "Application #1 · Aarav Mehta", Ip = "103.21.44.10" },
            new() { On = t.AddHours(8.9), Actor = "rahul.verma@zenithfintech.example", Company = Company.Name, Action = "Stage changed → Shortlisted", Target = "Application #2 · Sneha Kulkarni", Ip = "103.21.44.12" },
            new() { On = t.AddHours(8.1), Actor = "system", Company = "Kalpa Health Systems", Action = "Usage limit warning (90%)", Target = "Resume credits", Ip = "—", Severity = "Warning" },
            new() { On = t.AddHours(7.4), Actor = "unknown", Company = "—", Action = "Login throttled (5 failed attempts)", Target = "admin@orbitlogistics.example", Ip = "45.155.22.8", Severity = "High" },
            new() { On = t.AddHours(-3), Actor = "platform-admin@analytiq.example", Company = "Vertex Infra Projects", Action = "Company suspended", Target = "Reason: payment overdue > grace period", Ip = "10.0.0.4", Severity = "Warning" },
            new() { On = t.AddHours(-6), Actor = "system", Company = Company.Name, Action = "Cross-tenant request blocked", Target = "GET /candidates/2041 (owned by tenant 2)", Ip = "103.21.44.12", Severity = "High" },
            new() { On = t.AddDays(-1).AddHours(11), Actor = "simran.kaur@zenithfintech.example", Company = Company.Name, Action = "AI score overridden", Target = "Application #8 · Vikram Singh (reason recorded)", Ip = "103.21.44.15" },
            new() { On = t.AddDays(-1).AddHours(10), Actor = "platform-admin@analytiq.example", Company = "Nimbus Cloudworks", Action = "Plan assigned → Professional (trial)", Target = "Subscription", Ip = "10.0.0.4" },
            new() { On = t.AddDays(-2).AddHours(15), Actor = "priya.sharma@zenithfintech.example", Company = Company.Name, Action = "User invited", Target = "leena.dsouza@zenithfintech.example (Interviewer)", Ip = "103.21.44.10" },
            new() { On = t.AddDays(-2).AddHours(9), Actor = "system", Company = "Brightpath EdTech", Action = "Retention policy purge", Target = "142 candidate records older than 24 months", Ip = "—" },
        ];

        ProcessingJobs =
        [
            new() { Id = "rp-8f21", Company = Company.Name, FileType = "PDF", Status = ProcessingStatus.Processing, Attempts = 1, QueuedOn = t.AddHours(9.3) },
            new() { Id = "rp-8f1e", Company = Company.Name, FileType = "DOCX", Status = ProcessingStatus.Queued, Attempts = 0, QueuedOn = t.AddHours(9.35) },
            new() { Id = "rp-8f0a", Company = "Kalpa Health Systems", FileType = "PDF", Status = ProcessingStatus.Completed, Attempts = 1, DurationMs = 2140, QueuedOn = t.AddHours(9.1) },
            new() { Id = "rp-8ef3", Company = "Brightpath EdTech", FileType = "PDF", Status = ProcessingStatus.NeedsReview, Attempts = 1, DurationMs = 3890, QueuedOn = t.AddHours(8.8), Error = "Low text density — possible scanned document" },
            new() { Id = "rp-8ee7", Company = Company.Name, FileType = "DOCX", Status = ProcessingStatus.Failed, Attempts = 3, DurationMs = 310, QueuedOn = t.AddHours(8.2), Error = "File is corrupted or password-protected" },
            new() { Id = "rp-8ed2", Company = "Saffron Retail", FileType = "PDF", Status = ProcessingStatus.Completed, Attempts = 2, DurationMs = 1820, QueuedOn = t.AddHours(7.9) },
        ];
    }

    // ---------- Queries used by controllers ----------

    public Job? GetJob(int id) => Jobs.FirstOrDefault(j => j.Id == id);
    public Application? GetApplication(int id) => Applications.FirstOrDefault(a => a.Id == id);
    public IEnumerable<Application> ApplicationsFor(int jobId) => Applications.Where(a => a.JobId == jobId);
    public IEnumerable<Application> ApplicationsOf(int candidateId) => Applications.Where(a => a.CandidateId == candidateId);
    public IEnumerable<Interview> InterviewsFor(int applicationId) => Interviews.Where(i => i.ApplicationId == applicationId).OrderBy(i => i.Round);
    public Offer? OfferFor(int applicationId) => Offers.FirstOrDefault(o => o.ApplicationId == applicationId);
    public Application? FindByTrackingCode(string code) =>
        Applications.FirstOrDefault(a => a.TrackingCode.Equals(code.Trim(), StringComparison.OrdinalIgnoreCase));

    public DateTime? HiredOn(Application app) => app.History.LastOrDefault(h => h.Title == "Hired")?.On;

    public static bool Reached(Application app, ApplicationStage stage) =>
        app.Stage == stage || app.History.Any(h => h.Title == Ui.StageLabel(stage));

    public static bool AwaitsReview(Application a) =>
        a.Stage == ApplicationStage.New && a.Processing is ProcessingStatus.Completed or ProcessingStatus.NeedsReview or ProcessingStatus.Failed;

    public static List<Models.FunnelStep> Funnel(IEnumerable<Application> apps)
    {
        var list = apps.ToList();
        return
        [
            new("Applied", list.Count),
            new("Screened", list.Count(a => a.Screening is not null)),
            new("Shortlisted", list.Count(a => Reached(a, ApplicationStage.Shortlisted))),
            new("Interviewed", list.Count(a => Reached(a, ApplicationStage.Interview))),
            new("Offered", list.Count(a => Reached(a, ApplicationStage.Offer))),
            new("Hired", list.Count(a => a.Stage == ApplicationStage.Hired)),
        ];
    }

    /// <summary>Counts dates into the last <paramref name="weeks"/> weekly buckets ending today.</summary>
    public (List<string> Labels, List<int> Counts) Weekly(IEnumerable<DateTime> dates, int weeks = 8)
    {
        var start = Today.AddDays(-7 * weeks + 1);
        var labels = Enumerable.Range(0, weeks).Select(w => start.AddDays(7 * w).ToString("dd MMM")).ToList();
        var counts = new int[weeks];
        foreach (var d in dates.Where(d => d >= start))
            counts[Math.Min(weeks - 1, (int)((d.Date - start).TotalDays / 7))]++;
        return (labels, counts.ToList());
    }

    // ---------- Explainable scoring (mirrors the planned AI service contract) ----------

    public ScreeningResult Screen(Candidate candidate, Job job, DateTime screenedOn)
    {
        var reqMatched = new List<SkillMatch>();
        var reqMissing = new List<string>();
        foreach (var skill in job.RequiredSkills)
        {
            var m = MatchSkill(candidate, skill);
            if (m is null) reqMissing.Add(skill); else reqMatched.Add(m);
        }

        var prefMatched = new List<SkillMatch>();
        var prefMissing = new List<string>();
        foreach (var skill in job.PreferredSkills)
        {
            var m = MatchSkill(candidate, skill);
            if (m is null) prefMissing.Add(skill); else prefMatched.Add(m);
        }

        static double Credit(SkillMatch m) => m.Type == SkillMatchType.Exact ? 1.0 : SemanticCredit;

        var components = new List<ScoreComponent>
        {
            new()
            {
                Name = "Required skills", Weight = RequiredWeight,
                Fraction = job.RequiredSkills.Count == 0 ? null : reqMatched.Sum(Credit) / job.RequiredSkills.Count,
                Detail = $"{reqMatched.Count(m => m.Type == SkillMatchType.Exact)} exact + {reqMatched.Count(m => m.Type == SkillMatchType.Semantic)} related of {job.RequiredSkills.Count}"
            },
            new()
            {
                Name = "Preferred skills", Weight = PreferredWeight,
                Fraction = job.PreferredSkills.Count == 0 ? null : prefMatched.Sum(Credit) / job.PreferredSkills.Count,
                Detail = $"{prefMatched.Count(m => m.Type == SkillMatchType.Exact)} exact + {prefMatched.Count(m => m.Type == SkillMatchType.Semantic)} related of {job.PreferredSkills.Count}"
            },
            ExperienceComponent(candidate, job),
        };

        var known = components.Where(c => c.IsKnown).ToList();
        var score = known.Count == 0 ? 0 : (int)Math.Round(known.Sum(c => c.Weight * c.Fraction!.Value) / known.Sum(c => c.Weight) * 100);

        var warnings = new List<string>();
        if (!components[2].IsKnown)
            warnings.Add("Experience could not be reliably extracted, so it was excluded and the score re-normalised over the remaining criteria. Verify manually.");
        if (candidate.ParsingConfidence is < 70)
            warnings.Add($"Low parsing confidence ({candidate.ParsingConfidence}%). Check the extracted data against the original resume.");
        if (job.RequiredSkills.Any(s => s.Equals("Communication", StringComparison.OrdinalIgnoreCase)))
            warnings.Add("“Communication” is a soft skill and cannot be verified from resume text. Assess it at interview.");
        warnings.AddRange(candidate.DataWarnings);

        return new ScreeningResult
        {
            Score = score, RequiredMatched = reqMatched, RequiredMissing = reqMissing, PreferredMatched = prefMatched,
            PreferredMissing = prefMissing, Components = components, Warnings = warnings,
            ModelVersion = ModelVersion, ConfigVersion = ConfigVersion, ScreenedOn = screenedOn
        };
    }

    private static ScoreComponent ExperienceComponent(Candidate c, Job job)
    {
        if (c.ExperienceYears is not { } years)
            return new ScoreComponent { Name = "Relevant experience", Weight = ExperienceWeight, Fraction = null, Detail = "Not reliably extracted — needs verification" };

        var fraction = years >= job.MinExperience ? 1.0 : Math.Max(0, years / job.MinExperience);
        var detail = years >= job.MinExperience
            ? $"{years:0.#} yrs meets the {job.MinExperience}–{job.MaxExperience} yrs requirement"
            : $"{years:0.#} yrs against a {job.MinExperience} yrs minimum (pro-rated)";
        return new ScoreComponent { Name = "Relevant experience", Weight = ExperienceWeight, Fraction = fraction, Detail = detail };
    }

    private static SkillMatch? MatchSkill(Candidate c, string skill)
    {
        var exact = c.Skills.FirstOrDefault(s => s.Equals(skill, StringComparison.OrdinalIgnoreCase));
        if (exact is not null)
            return BuildMatch(c, skill, exact, SkillMatchType.Exact, 1.0);

        if (RelatedSkills.TryGetValue(skill, out var related))
        {
            foreach (var (term, sim) in related.Where(r => r.Similarity >= SemanticThreshold).OrderByDescending(r => r.Similarity))
            {
                var found = c.Skills.FirstOrDefault(s => s.Equals(term, StringComparison.OrdinalIgnoreCase));
                if (found is not null)
                    return BuildMatch(c, skill, found, SkillMatchType.Semantic, sim);
            }
        }
        return null;
    }

    private static SkillMatch BuildMatch(Candidate c, string skill, string term, SkillMatchType type, double sim)
    {
        var work = c.WorkHistory.FirstOrDefault(w => w.Summary.Contains(term, StringComparison.OrdinalIgnoreCase));
        return work is not null
            ? new SkillMatch { Skill = skill, MatchedTerm = term, Type = type, Similarity = sim, Section = $"Experience · {work.Role}, {work.Company}", Evidence = work.Summary }
            : new SkillMatch { Skill = skill, MatchedTerm = term, Type = type, Similarity = sim, Section = "Skills section", Evidence = $"Listed under Skills: “{term}” (no supporting project or role detail found)" };
    }

    // ---------- Seed helpers ----------

    private static List<StatusEvent> BuildHistory(Application app)
    {
        var events = new List<StatusEvent>
        {
            new() { On = app.AppliedOn, Title = "Application submitted", By = "Candidate", Kind = "info" },
            new() { On = app.AppliedOn.AddMinutes(1), Title = "Resume stored privately and queued", By = "System", Kind = "muted" },
        };

        switch (app.Processing)
        {
            case ProcessingStatus.Completed:
                events.Add(new() { On = app.AppliedOn.AddMinutes(4), Title = $"Screening completed — match score {app.Screening!.Score}", By = "AI service", Kind = "ai" });
                break;
            case ProcessingStatus.NeedsReview:
                events.Add(new() { On = app.AppliedOn.AddMinutes(4), Title = $"Screening completed with warnings — score {app.Screening!.Score}", By = "AI service", Kind = "warning" });
                break;
            case ProcessingStatus.Failed:
                events.Add(new() { On = app.AppliedOn.AddMinutes(3), Title = "Resume processing failed after 3 attempts", By = "AI service", Reason = app.ProcessingError, Kind = "danger" });
                break;
        }

        ApplicationStage[] path = app.Stage switch
        {
            ApplicationStage.Screening => [ApplicationStage.Screening],
            ApplicationStage.Shortlisted => [ApplicationStage.Screening, ApplicationStage.Shortlisted],
            ApplicationStage.OnHold => [ApplicationStage.Screening, ApplicationStage.OnHold],
            ApplicationStage.InfoRequested => [ApplicationStage.Screening, ApplicationStage.InfoRequested],
            ApplicationStage.Interview => [ApplicationStage.Screening, ApplicationStage.Shortlisted, ApplicationStage.Interview],
            ApplicationStage.Offer => [ApplicationStage.Screening, ApplicationStage.Shortlisted, ApplicationStage.Interview, ApplicationStage.Offer],
            ApplicationStage.Hired => [ApplicationStage.Screening, ApplicationStage.Shortlisted, ApplicationStage.Interview, ApplicationStage.Offer, ApplicationStage.Hired],
            ApplicationStage.Rejected => [ApplicationStage.Screening, ApplicationStage.Rejected],
            ApplicationStage.Withdrawn => [ApplicationStage.Screening, ApplicationStage.Shortlisted, ApplicationStage.Interview, ApplicationStage.Offer, ApplicationStage.Withdrawn],
            _ => []
        };

        var days = Math.Max(1.0, (DateTime.Today - app.AppliedOn).TotalDays - 0.5);
        var step = path.Length == 0 ? 0 : days / path.Length;
        for (var i = 0; i < path.Length; i++)
        {
            var stage = path[i];
            var last = i == path.Length - 1;
            events.Add(new StatusEvent
            {
                On = app.AppliedOn.AddDays(step * (i + 1)).Date.AddHours(10 + i),
                Title = Ui.StageLabel(stage),
                By = stage == ApplicationStage.Withdrawn ? "Candidate" : app.AssignedRecruiter,
                Reason = last ? app.StageReason : null,
                Kind = stage switch
                {
                    ApplicationStage.Rejected => "danger",
                    ApplicationStage.Hired => "success",
                    ApplicationStage.OnHold or ApplicationStage.InfoRequested or ApplicationStage.Withdrawn => "warning",
                    _ => "primary"
                }
            });
        }
        return events.OrderBy(e => e.On).ToList();
    }

    private void SeedNotes()
    {
        GetApplication(1)!.Notes =
        [
            new() { On = Today.AddDays(-6).AddHours(11), By = "Rahul Verma", Text = "Strong API design discussion in phone screen. Confirmed 4 years on ASP.NET Core in production." },
            new() { On = Today.AddDays(-3).AddHours(16), By = "Ananya Iyer", Text = "Round 1 went well — see feedback. Recommend system-design round next." },
        ];
        GetApplication(4)!.Notes = [new() { On = Today.AddDays(-4).AddHours(12), By = "Rahul Verma", Text = "Good fundamentals but below the experience band for this role. Keeping on hold; may suit a mid-level opening." }];
        GetApplication(5)!.Notes = [new() { On = Today.AddDays(-1).AddHours(10), By = "Rahul Verma", Text = "Resume looks partly scanned. Experience dates did not extract — need to check manually before deciding." }];
        GetApplication(8)!.Notes = [new() { On = Today.AddDays(-1).AddHours(11), By = "Simran Kaur", Text = "Override: AI marked NLP as missing, but portfolio shows a published sentiment-analysis project. Shortlisting." }];
    }

    private static List<Candidate> SeedCandidates() =>
    [
        new()
        {
            Id = 1, FullName = "Aarav Mehta", Email = "aarav.mehta@mail.example", Phone = "+91 98450 11223", Location = "Pune", Headline = "Senior Software Engineer · .NET",
            ExperienceYears = 6.5, ParsingConfidence = 96, ResumeFileName = "Aarav_Mehta_Resume.pdf", ResumeSizeKb = 184, LinkedIn = "linkedin.com/in/aarav-mehta-dev",
            Skills = ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "REST APIs", "Azure", "Docker", "Microservices", "Git", "xUnit"],
            Education = ["B.Tech, Computer Engineering — COEP Pune (2018)"], Certifications = ["Microsoft Certified: Azure Developer Associate (AZ-204)"],
            WorkHistory =
            [
                new() { Role = "Senior Software Engineer", Company = "Finlytics Solutions", Period = "Jan 2022 – Present", Summary = "Led a team of 4 building REST APIs on ASP.NET Core 8 with Entity Framework Core and SQL Server; migrated 6 services to Docker on Azure." },
                new() { Role = "Software Engineer", Company = "Inferra Tech", Period = "Jul 2018 – Dec 2021", Summary = "Built C# microservices for loan origination; wrote xUnit test suites and tuned SQL Server queries (40% latency reduction)." },
            ],
            Projects = ["Real-time settlement ledger (event sourcing, Azure Service Bus)", "Internal API gateway with rate limiting"]
        },
        new()
        {
            Id = 2, FullName = "Sneha Kulkarni", Email = "sneha.k@mail.example", Phone = "+91 99220 44871", Location = "Mumbai", Headline = "Software Developer · .NET / Web",
            ExperienceYears = 5.0, ParsingConfidence = 91, ResumeFileName = "Sneha_Kulkarni_CV.docx", ResumeSizeKb = 96,
            Skills = ["C#", "ASP.NET MVC", "Entity Framework", "T-SQL", "REST APIs", "JavaScript", "React", "Git", "Selenium"],
            Education = ["MCA — University of Mumbai (2019)"], Certifications = [],
            WorkHistory =
            [
                new() { Role = "Software Developer", Company = "Retailora", Period = "Aug 2019 – Present", Summary = "Developed ASP.NET MVC portals in C# with Entity Framework and T-SQL stored procedures; built React dashboards consuming REST APIs." },
            ],
            Projects = ["Inventory forecasting portal", "Vendor onboarding workflow"]
        },
        new()
        {
            Id = 3, FullName = "Mohammed Faizan", Email = "faizan.m@mail.example", Phone = "+91 90000 31415", Location = "Hyderabad", Headline = "Lead Engineer · .NET & Cloud",
            ExperienceYears = 8.0, ParsingConfidence = 94, ResumeFileName = "Faizan_Resume_2026.pdf", ResumeSizeKb = 212, LinkedIn = "linkedin.com/in/mfaizan",
            Skills = ["C#", ".NET Framework", "ASP.NET Core", "SQL Server", "REST APIs", "Azure DevOps", "Kubernetes", "Angular", "WCF"],
            Education = ["B.E., Information Technology — Osmania University (2017)"], Certifications = ["Certified Kubernetes Application Developer (CKAD)"],
            WorkHistory =
            [
                new() { Role = "Lead Engineer", Company = "Paysphere", Period = "Mar 2021 – Present", Summary = "Owns ASP.NET Core payment APIs on Kubernetes; set up Azure DevOps release pipelines; mentors 6 engineers." },
                new() { Role = "Senior Developer", Company = "Cognit Systems", Period = "Jun 2017 – Feb 2021", Summary = "Maintained .NET Framework WCF services and SQL Server reporting for insurance clients." },
            ],
            Projects = ["Card tokenisation service", "Legacy WCF → REST migration"]
        },
        new()
        {
            Id = 4, FullName = "Kavya Reddy", Email = "kavya.reddy@mail.example", Phone = "+91 97400 55660", Location = "Bengaluru", Headline = "Full-stack Developer",
            ExperienceYears = 2.5, ParsingConfidence = 89, ResumeFileName = "KavyaReddy.pdf", ResumeSizeKb = 140, Portfolio = "kavyareddy.dev",
            Skills = ["C#", "ASP.NET Core", "SQL Server", "React", "Figma", "HTML/CSS", "Git"],
            Education = ["B.Tech, CSE — PES University (2023)"], Certifications = [],
            WorkHistory = [new() { Role = "Associate Developer", Company = "Brightbyte Labs", Period = "Jun 2023 – Present", Summary = "Builds ASP.NET Core and React features; prototypes UI in Figma with HTML/CSS handoff." }],
            Projects = ["Campus events app (React + ASP.NET Core)"]
        },
        new()
        {
            Id = 5, FullName = "Rohan Das", Email = "rohan.das@mail.example", Phone = "+91 98300 77881", Location = "Kolkata", Headline = "Software Engineer",
            ExperienceYears = null, ParsingConfidence = 58, ResumeFileName = "Rohan_Das_scan.pdf", ResumeSizeKb = 2310,
            Skills = ["C#", "SQL", "REST APIs", "Java"],
            Education = ["B.Tech — (institution not extracted)"], Certifications = [],
            WorkHistory = [new() { Role = "Software Engineer", Company = "(not extracted)", Period = "(dates not extracted)", Summary = "Worked on C# and Java backend services with SQL databases and REST APIs." }],
            DataWarnings = ["Pages 2–3 appear to be scanned images; OCR not configured, so their text was not extracted."]
        },
        new()
        {
            Id = 6, FullName = "Ishita Banerjee", Email = "ishita.b@mail.example", Phone = "+91 98111 20304", Location = "Pune", Headline = "Data Scientist · NLP",
            ExperienceYears = 5.0, ParsingConfidence = 95, ResumeFileName = "Ishita_Banerjee_DS.pdf", ResumeSizeKb = 168, LinkedIn = "linkedin.com/in/ishitab",
            Skills = ["Python", "Machine Learning", "NLP", "SQL", "scikit-learn", "PyTorch", "Transformers", "Pandas", "Power BI"],
            Education = ["M.Sc. Statistics — University of Pune (2020)"], Certifications = ["DeepLearning.AI NLP Specialization"],
            WorkHistory =
            [
                new() { Role = "Data Scientist", Company = "Lendwise", Period = "Aug 2021 – Present", Summary = "Built NLP document classifiers with Transformers and PyTorch; productionised scikit-learn credit models; wrote SQL feature pipelines." },
                new() { Role = "Analyst", Company = "Quantix", Period = "Jul 2020 – Jul 2021", Summary = "Python and Pandas analysis; Power BI reporting." },
            ],
            Projects = ["KYC document entity extraction (F1 0.91)"]
        },
        new()
        {
            Id = 7, FullName = "Vikram Singh", Email = "vikram.singh@mail.example", Phone = "+91 98720 66110", Location = "Chandigarh", Headline = "ML Engineer",
            ExperienceYears = 3.0, ParsingConfidence = 88, ResumeFileName = "Vikram_Singh_ML.pdf", ResumeSizeKb = 122, Portfolio = "github.com/vikram-ml",
            Skills = ["Python", "Machine Learning", "SQL", "scikit-learn", "Pandas", "Tableau", "AWS"],
            Education = ["B.Tech, ECE — Punjab Engineering College (2022)"], Certifications = ["AWS Certified Cloud Practitioner"],
            WorkHistory = [new() { Role = "ML Engineer", Company = "Agrinova", Period = "Jul 2022 – Present", Summary = "Built scikit-learn crop-yield models in Python; deployed on AWS; SQL data pipelines." }],
            Projects = ["Sentiment analysis of farmer feedback (open-source)"]
        },
        new()
        {
            Id = 8, FullName = "Neha Gupta", Email = "neha.gupta@mail.example", Phone = "+91 99990 12121", Location = "Delhi NCR", Headline = "Senior Data Scientist",
            ExperienceYears = 7.0, ParsingConfidence = 93, ResumeFileName = "NehaGupta_Resume.docx", ResumeSizeKb = 88,
            Skills = ["Python", "NLP", "PyTorch", "Transformers", "MLOps", "AWS", "Docker", "SQL"],
            Education = ["M.Tech, CSE — IIIT Delhi (2019)"], Certifications = [],
            WorkHistory = [new() { Role = "Senior Data Scientist", Company = "Textsense AI", Period = "Jan 2019 – Present", Summary = "Leads NLP model development in PyTorch and Transformers; built MLOps pipelines on AWS with Docker." }],
            Projects = ["Multilingual intent classifier (Hindi/English)"]
        },
        new()
        {
            Id = 9, FullName = "Arjun Nair", Email = "arjun.nair@mail.example", Phone = "+91 94470 33221", Location = "Kochi", Headline = "—",
            ResumeFileName = "Arjun_Nair.pdf", ResumeSizeKb = 205
        },
        new()
        {
            Id = 10, FullName = "Pooja Joshi", Email = "pooja.joshi@mail.example", Phone = "+91 98900 45678", Location = "Bengaluru", Headline = "Product Designer",
            ExperienceYears = 4.0, ParsingConfidence = 92, ResumeFileName = "Pooja_Joshi_Design.pdf", ResumeSizeKb = 1460, Portfolio = "behance.net/poojajoshi",
            Skills = ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility", "Adobe XD"],
            Education = ["B.Des — NID Ahmedabad (2022)"], Certifications = ["Google UX Design Certificate"],
            WorkHistory = [new() { Role = "Product Designer", Company = "Shopnest", Period = "Jun 2022 – Present", Summary = "Ran User Research with 40+ merchants; built Figma Prototyping flows and contributed 60 components to the Design Systems library with Accessibility audits." }],
            Projects = ["Checkout redesign (+11% conversion)"]
        },
        new()
        {
            Id = 11, FullName = "Siddharth Rao", Email = "sid.rao@mail.example", Phone = "+91 99000 88776", Location = "Bengaluru", Headline = "Senior UX Designer",
            ExperienceYears = 6.0, ParsingConfidence = 90, ResumeFileName = "Siddharth_Rao_UX.pdf", ResumeSizeKb = 980, Portfolio = "sidrao.design",
            Skills = ["Figma", "Sketch", "Wireframing", "Usability Testing", "Design Systems", "Accessibility", "HTML/CSS"],
            Education = ["M.Des, Interaction Design — IIT Bombay (2020)"], Certifications = [],
            WorkHistory = [new() { Role = "Senior UX Designer", Company = "Travelloop", Period = "Jul 2020 – Present", Summary = "Owns Design Systems in Figma; runs Usability Testing and Wireframing for mobile booking flows; ships HTML/CSS prototypes." }],
            Projects = ["Accessible booking flow (WCAG 2.2 AA)"]
        },
        new()
        {
            Id = 12, FullName = "Meera Pillai", Email = "meera.pillai@mail.example", Phone = "+91 94000 12345", Location = "Thiruvananthapuram", Headline = "—",
            ResumeFileName = "Meera_Pillai_Portfolio.docx", ResumeSizeKb = 4120
        },
        new()
        {
            Id = 13, FullName = "Karan Malhotra", Email = "karan.m@mail.example", Phone = "+91 98100 99887", Location = "Hyderabad", Headline = "SDET",
            ExperienceYears = 5.0, ParsingConfidence = 94, ResumeFileName = "Karan_Malhotra_SDET.pdf", ResumeSizeKb = 132,
            Skills = ["Selenium", "C#", "SpecFlow", "API Testing", "Postman", "Azure DevOps", "Test Automation"],
            Education = ["B.Tech, IT — JNTU Hyderabad (2020)"], Certifications = ["ISTQB Foundation"],
            WorkHistory = [new() { Role = "SDET", Company = "Banksoft", Period = "Jul 2020 – Present", Summary = "Built Selenium + SpecFlow suites in C#; API Testing with Postman; integrated Test Automation into Azure DevOps." }],
            Projects = []
        },
        new()
        {
            Id = 14, FullName = "Tanvi Shah", Email = "tanvi.shah@mail.example", Phone = "+91 98250 11009", Location = "Ahmedabad", Headline = "QA Engineer",
            ExperienceYears = 3.0, ParsingConfidence = 86, ResumeFileName = "Tanvi_Shah_QA.pdf", ResumeSizeKb = 110,
            Skills = ["Selenium", "Java", "TestNG", "Jira", "Postman"],
            Education = ["B.E., Computer — Gujarat University (2023)"], Certifications = [],
            WorkHistory = [new() { Role = "QA Engineer", Company = "Cloudmint", Period = "Jun 2023 – Present", Summary = "Writes Selenium tests in Java with TestNG; manual API checks in Postman." }],
            Projects = []
        },
        new()
        {
            Id = 15, FullName = "Rahul Khanna", Email = "rahul.khanna@mail.example", Phone = "+91 98860 22113", Location = "Bengaluru", Headline = "HR Generalist",
            ExperienceYears = 2.0, ParsingConfidence = 92, ResumeFileName = "Rahul_Khanna_HR.pdf", ResumeSizeKb = 90,
            Skills = ["Talent Acquisition", "HRMS", "MS Excel", "Employee Engagement"],
            Education = ["MBA, HR — Christ University (2024)"], Certifications = [],
            WorkHistory = [new() { Role = "HR Associate", Company = "Peoplefirst", Period = "Jun 2024 – Present", Summary = "End-to-end Talent Acquisition for 30+ roles; maintained HRMS records; ran Employee Engagement surveys in MS Excel." }],
            Projects = []
        },
        new()
        {
            Id = 16, FullName = "Divya Menon", Email = "divya.menon@mail.example", Phone = "+91 97890 33445", Location = "Bengaluru", Headline = "HR Coordinator",
            ExperienceYears = 1.5, ParsingConfidence = 90, ResumeFileName = "Divya_Menon.pdf", ResumeSizeKb = 76,
            Skills = ["Recruitment", "HR Operations", "MS Excel"],
            Education = ["MBA, HR — Symbiosis (2025)"], Certifications = [],
            WorkHistory = [new() { Role = "HR Coordinator", Company = "Staffly", Period = "Apr 2025 – Present", Summary = "Coordinated Recruitment drives and HR Operations; MS Excel trackers." }],
            Projects = []
        },
        new()
        {
            Id = 17, FullName = "Ankit Saxena", Email = "ankit.saxena@mail.example", Phone = "+91 98390 77665", Location = "Lucknow", Headline = "Java Developer",
            ExperienceYears = 6.0, ParsingConfidence = 93, ResumeFileName = "Ankit_Saxena.pdf", ResumeSizeKb = 150,
            Skills = ["Java", "Spring Boot", "SQL", "REST APIs", "Docker", "Microservices"],
            Education = ["B.Tech — AKTU (2019)"], Certifications = ["Oracle Certified Professional, Java SE 17"],
            WorkHistory = [new() { Role = "Senior Java Developer", Company = "Telenet Systems", Period = "Jul 2019 – Present", Summary = "Spring Boot Microservices with REST APIs, Docker deployments and SQL databases." }],
            Projects = []
        },
        new()
        {
            Id = 18, FullName = "Riya Chatterjee", Email = "riya.c@mail.example", Phone = "+91 98310 66554", Location = "Kolkata", Headline = "—",
            ResumeFileName = "Riya_Chatterjee_CV.pdf", ResumeSizeKb = 174
        },
    ];

    private static List<Application> SeedApplications(DateTime t) =>
    [
        new() { Id = 1, CandidateId = 1, JobId = 1, AppliedOn = t.AddDays(-14).AddHours(10.2), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Interview, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-7K2Q9" },
        new() { Id = 2, CandidateId = 2, JobId = 1, AppliedOn = t.AddDays(-11).AddHours(14.5), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Shortlisted, AssignedRecruiter = "Rahul Verma", Source = "LinkedIn", TrackingCode = "ZF-3M8D1" },
        new() { Id = 3, CandidateId = 3, JobId = 1, AppliedOn = t.AddDays(-9).AddHours(9.1), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Interview, AssignedRecruiter = "Rahul Verma", Source = "Referral", TrackingCode = "ZF-9P4T6" },
        new() { Id = 4, CandidateId = 4, JobId = 1, AppliedOn = t.AddDays(-7).AddHours(18.3), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.OnHold, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-2H7L5", StageReason = "Below experience band; reconsider for mid-level opening" },
        new() { Id = 5, CandidateId = 5, JobId = 1, AppliedOn = t.AddDays(-2).AddHours(11.4), Processing = ProcessingStatus.NeedsReview, Stage = ApplicationStage.New, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-6R1N3" },
        new() { Id = 6, CandidateId = 17, JobId = 1, AppliedOn = t.AddDays(-12).AddHours(12.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Rejected, AssignedRecruiter = "Rahul Verma", Source = "Naukri", TrackingCode = "ZF-8J5W2", StageReason = "No production .NET experience — confirmed in phone screen" },
        new() { Id = 7, CandidateId = 6, JobId = 2, AppliedOn = t.AddDays(-26).AddHours(10.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Offer, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-4C9X7" },
        new() { Id = 8, CandidateId = 7, JobId = 2, AppliedOn = t.AddDays(-10).AddHours(16.2), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Shortlisted, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-1B6V8", StageReason = "AI score overridden: portfolio shows NLP project (see note)" },
        new() { Id = 9, CandidateId = 8, JobId = 2, AppliedOn = t.AddDays(-8).AddHours(9.7), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Interview, AssignedRecruiter = "Simran Kaur", Source = "LinkedIn", TrackingCode = "ZF-5F3K4" },
        new() { Id = 10, CandidateId = 9, JobId = 2, AppliedOn = t.AddHours(9.3), Processing = ProcessingStatus.Processing, Stage = ApplicationStage.New, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-0D2Y6" },
        new() { Id = 11, CandidateId = 18, JobId = 2, AppliedOn = t.AddHours(9.35), Processing = ProcessingStatus.Queued, Stage = ApplicationStage.New, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-7G8H1" },
        new() { Id = 12, CandidateId = 10, JobId = 3, AppliedOn = t.AddDays(-13).AddHours(13.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Interview, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-3T5R9" },
        new() { Id = 13, CandidateId = 11, JobId = 3, AppliedOn = t.AddDays(-20).AddHours(11.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Offer, AssignedRecruiter = "Rahul Verma", Source = "Referral", TrackingCode = "ZF-9K1M2" },
        new() { Id = 14, CandidateId = 12, JobId = 3, AppliedOn = t.AddHours(8.2), Processing = ProcessingStatus.Failed, ProcessingError = "File is corrupted or password-protected", Stage = ApplicationStage.New, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-2W4Q8" },
        new() { Id = 15, CandidateId = 4, JobId = 3, AppliedOn = t.AddDays(-5).AddHours(19.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Screening, AssignedRecruiter = "Rahul Verma", Source = "Careers page", TrackingCode = "ZF-6N7P3" },
        new() { Id = 16, CandidateId = 13, JobId = 4, AppliedOn = t.AddDays(-21).AddHours(10.5), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.OnHold, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-8X2C5", StageReason = "Requisition paused by hiring manager" },
        new() { Id = 17, CandidateId = 15, JobId = 6, AppliedOn = t.AddDays(-55).AddHours(10.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Hired, AssignedRecruiter = "Priya Sharma", Source = "Careers page", TrackingCode = "ZF-1L9S4" },
        new() { Id = 18, CandidateId = 16, JobId = 6, AppliedOn = t.AddDays(-57).AddHours(15.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Withdrawn, AssignedRecruiter = "Priya Sharma", Source = "Naukri", TrackingCode = "ZF-4V6B7", StageReason = "Offer declined — accepted another offer" },
        new() { Id = 19, CandidateId = 14, JobId = 4, AppliedOn = t.AddDays(-18).AddHours(12.5), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.InfoRequested, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-5Q3E1", StageReason = "Asked for C# automation samples" },
        new() { Id = 20, CandidateId = 2, JobId = 4, AppliedOn = t.AddDays(-6).AddHours(17.0), Processing = ProcessingStatus.Completed, Stage = ApplicationStage.Screening, AssignedRecruiter = "Simran Kaur", Source = "Careers page", TrackingCode = "ZF-0R8T2" },
    ];

    private static List<Interview> SeedInterviews(DateTime t) =>
    [
        new()
        {
            Id = 1, ApplicationId = 1, Round = 1, Title = "Technical — APIs & data", Type = "Video", StartsAt = t.AddDays(-4).AddHours(11), DurationMinutes = 60,
            Location = "Google Meet", Interviewers = ["Ananya Iyer"], Status = InterviewStatus.Completed,
            Feedback = new() { By = "Ananya Iyer", TechnicalSkills = 4, ProblemSolving = 4, Communication = 5, RoleKnowledge = 4, Recommendation = "Advance",
                               Evidence = "Designed an idempotent payment API end-to-end, explained EF Core tracking vs no-tracking trade-offs correctly. Minor gaps on distributed caching.", SubmittedOn = t.AddDays(-3).AddHours(16) }
        },
        new() { Id = 2, ApplicationId = 1, Round = 2, Title = "System design", Type = "Video", StartsAt = t.AddDays(2).AddHours(15), DurationMinutes = 75, Location = "Google Meet", Interviewers = ["Ananya Iyer", "Priya Sharma"], Status = InterviewStatus.Scheduled },
        new() { Id = 3, ApplicationId = 3, Round = 1, Title = "Technical — APIs & data", Type = "Video", StartsAt = t.AddDays(1).AddHours(11.5), DurationMinutes = 60, Location = "Microsoft Teams", Interviewers = ["Ananya Iyer"], Status = InterviewStatus.Scheduled },
        new()
        {
            Id = 4, ApplicationId = 7, Round = 1, Title = "ML case study", Type = "Video", StartsAt = t.AddDays(-15).AddHours(14), DurationMinutes = 60, Location = "Google Meet",
            Interviewers = ["Karthik Subramanian"], Status = InterviewStatus.Completed,
            Feedback = new() { By = "Karthik Subramanian", TechnicalSkills = 5, ProblemSolving = 5, Communication = 4, RoleKnowledge = 5, Recommendation = "Strong advance",
                               Evidence = "Walked through KYC extraction project with clear evaluation methodology; proposed sensible approach for class imbalance.", SubmittedOn = t.AddDays(-15).AddHours(17) }
        },
        new() { Id = 5, ApplicationId = 9, Round = 1, Title = "ML case study", Type = "Video", StartsAt = t.AddHours(16), DurationMinutes = 60, Location = "Google Meet", Interviewers = ["Karthik Subramanian"], Status = InterviewStatus.Scheduled },
        new() { Id = 6, ApplicationId = 12, Round = 1, Title = "Portfolio review", Type = "On-site", StartsAt = t.AddDays(3).AddHours(12), DurationMinutes = 90, Location = "Zenith HQ, Koramangala — Room 4B", Interviewers = ["Leena D'Souza", "Rahul Verma"], Status = InterviewStatus.Scheduled },
        new()
        {
            Id = 7, ApplicationId = 13, Round = 1, Title = "Portfolio review", Type = "On-site", StartsAt = t.AddDays(-12).AddHours(12), DurationMinutes = 90, Location = "Zenith HQ, Koramangala — Room 4B",
            Interviewers = ["Leena D'Souza"], Status = InterviewStatus.Completed,
            Feedback = new() { By = "Leena D'Souza", TechnicalSkills = 4, ProblemSolving = 5, Communication = 4, RoleKnowledge = 4, Recommendation = "Advance",
                               Evidence = "Strong accessibility rationale in booking-flow case study; clear research-to-design traceability.", SubmittedOn = t.AddDays(-12).AddHours(15) }
        },
        new() { Id = 8, ApplicationId = 16, Round = 1, Title = "Automation walkthrough", Type = "Phone", StartsAt = t.AddDays(-9).AddHours(10), DurationMinutes = 45, Location = "Phone", Interviewers = ["Ananya Iyer"], Status = InterviewStatus.Cancelled },
        new()
        {
            Id = 9, ApplicationId = 17, Round = 1, Title = "HR panel", Type = "On-site", StartsAt = t.AddDays(-40).AddHours(11), DurationMinutes = 45, Location = "Zenith HQ", Interviewers = ["Priya Sharma"], Status = InterviewStatus.Completed,
            Feedback = new() { By = "Priya Sharma", TechnicalSkills = 4, ProblemSolving = 4, Communication = 5, RoleKnowledge = 4, Recommendation = "Advance", Evidence = "Clear examples of high-volume hiring coordination and HRMS data hygiene.", SubmittedOn = t.AddDays(-40).AddHours(13) }
        },
        new() { Id = 10, ApplicationId = 18, Round = 1, Title = "HR panel", Type = "On-site", StartsAt = t.AddDays(-41).AddHours(15), DurationMinutes = 45, Location = "Zenith HQ", Interviewers = ["Priya Sharma"], Status = InterviewStatus.Completed,
              Feedback = new() { By = "Priya Sharma", TechnicalSkills = 3, ProblemSolving = 4, Communication = 4, RoleKnowledge = 3, Recommendation = "Advance", Evidence = "Good coordination experience; lighter on HRMS administration.", SubmittedOn = t.AddDays(-41).AddHours(17) } },
    ];
}
