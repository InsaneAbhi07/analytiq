import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { StoreProvider } from "./data/store";
import { FeedbackProvider } from "./components/feedback";
import { AppShell, AuthLayout, PublicLayout } from "./components/layouts";
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import JobForm from "./pages/JobForm";
import Candidates from "./pages/Candidates";
import CandidateProfile from "./pages/CandidateProfile";
import Interviews from "./pages/Interviews";
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import { Apply, CareerJob, Careers, Confirmation, Status } from "./pages/Careers";
import NotFound from "./pages/NotFound";
import Offers from "./pages/Offers";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import { Feedback, MyInterviews, Schedule } from "./pages/InterviewForms";
import { AdminAudit, AdminCompanies, AdminOverview, AdminPlans, AdminProcessing, AdminShell, AdminSystem } from "./pages/Admin";

// HashRouter: GitHub Pages serves static files only, so deep links must not hit the server.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <FeedbackProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/new" element={<JobForm />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="candidates/compare" element={<Compare />} />
              <Route path="candidates/:id" element={<CandidateProfile />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="interviews/schedule" element={<Schedule />} />
              <Route path="interviews/:id/feedback" element={<Feedback />} />
              <Route path="my-interviews" element={<MyInterviews />} />
              <Route path="offers" element={<Offers />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="billing" element={<Billing />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminOverview />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="processing" element={<AdminProcessing />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="system" element={<AdminSystem />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/careers" element={<PublicLayout careers />}>
              <Route index element={<Careers />} />
              <Route path="jobs/:id" element={<CareerJob />} />
              <Route path="jobs/:id/apply" element={<Apply />} />
              <Route path="confirmation" element={<Confirmation />} />
              <Route path="status" element={<Status />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </FeedbackProvider>
      </StoreProvider>
    </HashRouter>
  </StrictMode>
);
