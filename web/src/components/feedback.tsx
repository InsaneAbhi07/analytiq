import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import clsx from "clsx";
import { Modal } from "./ui";

type ToastTone = "success" | "info" | "warning" | "danger";
interface Toast { id: number; text: string; tone: ToastTone }

interface ConfirmOptions {
  title: string;
  message?: string;
  ok?: string;
  danger?: boolean;
  /** Require a written reason (recorded in the audit trail). */
  reason?: boolean;
}

interface Feedback {
  toast: (text: string, tone?: ToastTone) => void;
  confirm: (o: ConfirmOptions) => Promise<{ reason: string } | null>;
}

const Ctx = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const [reason, setReason] = useState("");
  const [invalid, setInvalid] = useState(false);
  const resolver = useRef<(v: { reason: string } | null) => void>();

  const toast = useCallback((text: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const confirm = useCallback((o: ConfirmOptions) => {
    setReason("");
    setInvalid(false);
    setDialog(o);
    return new Promise<{ reason: string } | null>((res) => (resolver.current = res));
  }, []);

  const close = (result: { reason: string } | null) => {
    resolver.current?.(result);
    setDialog(null);
  };

  const submit = () => {
    if (dialog?.reason && !reason.trim()) { setInvalid(true); return; }
    close({ reason: reason.trim() });
  };

  const icons = { success: <CheckCircle2 size={18} className="text-emerald-600" />, info: <Info size={18} className="text-brand-600" />, warning: <AlertTriangle size={18} className="text-amber-600" />, danger: <XCircle size={18} className="text-rose-600" /> };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <Modal open={!!dialog} onClose={() => close(null)} title={dialog?.title ?? ""}
        footer={<>
          <button className="btn btn-secondary" onClick={() => close(null)}>Cancel</button>
          <button className={clsx("btn", dialog?.danger ? "btn-danger" : "btn-primary")} onClick={submit}>{dialog?.ok ?? "Confirm"}</button>
        </>}>
        {dialog?.message && <p className="text-sm text-ink-600">{dialog.message}</p>}
        {dialog?.reason && (
          <div className="mt-3">
            <label className="label req" htmlFor="confirm-reason">Reason (recorded in the audit trail)</label>
            <textarea id="confirm-reason" rows={3} className={clsx("input", invalid && "border-rose-400 ring-4 ring-rose-500/10")} value={reason}
              onChange={(e) => { setReason(e.target.value); setInvalid(false); }} placeholder="e.g. Verified in phone screen that…" />
            {invalid && <p className="mt-1 text-xs text-rose-600">A reason is required for this action.</p>}
          </div>
        )}
      </Modal>
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex animate-slide-in items-start gap-2.5 rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm shadow-pop">
            <span className="mt-px">{icons[t.tone]}</span>
            <span className="flex-1 text-ink-800">{t.text}</span>
            <button className="text-ink-400 hover:text-ink-700" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useFeedback() {
  const f = useContext(Ctx);
  if (!f) throw new Error("useFeedback must be used inside FeedbackProvider");
  return f;
}
