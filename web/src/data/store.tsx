import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { candidateById, currentUser, initialApplications, interviews, jobById, offers } from "./seed";
import type { Application, Candidate, Job, Stage } from "./types";
import { stageLabel } from "../lib/ui";

/**
 * In-memory store for the prototype. Stage changes and notes persist while the tab is open
 * and reset on reload — the real build replaces this with API calls that enforce
 * authorization and tenant isolation on the server.
 */
export interface AppView extends Application {
  candidate: Candidate;
  job: Job;
}

interface Store {
  applications: AppView[];
  changeStage: (id: number, stage: Stage, reason?: string) => void;
  addNote: (id: number, text: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<Application[]>(initialApplications);

  const changeStage = useCallback((id: number, stage: Stage, reason?: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id !== id ? a : {
          ...a,
          stage,
          stageReason: reason ?? a.stageReason,
          history: [...a.history, {
            on: new Date(), title: stageLabel(stage), by: currentUser.name, reason,
            kind: stage === "Rejected" ? "danger" : stage === "Hired" ? "success" : ["OnHold", "InfoRequested", "Withdrawn"].includes(stage) ? "warning" : "primary",
          }],
        }
      )
    );
  }, []);

  const addNote = useCallback((id: number, text: string) => {
    setApps((prev) => prev.map((a) => (a.id !== id ? a : { ...a, notes: [{ on: new Date(), by: currentUser.name, text }, ...a.notes] })));
  }, []);

  const value = useMemo<Store>(() => ({
    applications: apps.map((a) => ({ ...a, candidate: candidateById(a.candidateId), job: jobById(a.jobId) })),
    changeStage,
    addNote,
  }), [apps, changeStage, addNote]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export const interviewsFor = (appId: number) => interviews.filter((i) => i.applicationId === appId).sort((a, b) => a.round - b.round);
export const offerFor = (appId: number) => offers.find((o) => o.applicationId === appId);

export const reached = (a: Application, stage: Stage) => a.stage === stage || a.history.some((h) => h.title === stageLabel(stage));
export const awaitsReview = (a: Application) => a.stage === "New" && ["Completed", "NeedsReview", "Failed"].includes(a.processing);

export function funnel(apps: Application[]) {
  return [
    { label: "Applied", count: apps.length },
    { label: "Screened", count: apps.filter((a) => a.screening).length },
    { label: "Shortlisted", count: apps.filter((a) => reached(a, "Shortlisted")).length },
    { label: "Interviewed", count: apps.filter((a) => reached(a, "Interview")).length },
    { label: "Offered", count: apps.filter((a) => reached(a, "Offer")).length },
    { label: "Hired", count: apps.filter((a) => a.stage === "Hired").length },
  ];
}
