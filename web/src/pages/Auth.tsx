import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFeedback } from "../components/feedback";

export function Login() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    toast("Signed in (prototype, no real authentication).");
    navigate("/app");
  };
  return (
    <>
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mb-6 mt-1 text-ink-500">Welcome back to Analytiq.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="email">Work email</label><input id="email" className="input" type="email" required autoComplete="username" defaultValue="abhishek.singh@zenithfintech.example" /></div>
        <div>
          <div className="flex justify-between"><label className="label" htmlFor="pw">Password</label><button type="button" className="text-xs text-brand-700 hover:underline" onClick={() => toast("If that email has an account, a reset link is on its way (prototype).", "info")}>Forgot password?</button></div>
          <input id="pw" className="input" type="password" autoComplete="current-password" placeholder="Not checked in the prototype" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-600" /> Keep me signed in on this device</label>
        <button className="btn btn-primary btn-lg w-full">Sign in</button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">New to Analytiq? <Link to="/register" className="font-medium text-brand-700 hover:underline">Register your company</Link></p>
    </>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [tried, setTried] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (!e.currentTarget.checkValidity()) return;
    const name = new FormData(e.currentTarget).get("company");
    toast(`Workspace for “${name}” created. A verification email would be sent (prototype).`);
    navigate("/app");
  };
  return (
    <>
      <h1 className="text-2xl font-bold">Register your company</h1>
      <p className="mb-6 mt-1 text-ink-500">Start a 14-day free trial. You'll be the Company Admin.</p>
      <form noValidate onSubmit={submit} className={`grid gap-4 sm:grid-cols-2 ${tried ? "[&_:invalid]:border-rose-400" : ""}`}>
        <div className="sm:col-span-2"><label className="label req" htmlFor="company">Company name</label><input id="company" name="company" className="input" required autoComplete="organization" /></div>
        <div><label className="label req" htmlFor="name">Your name</label><input id="name" className="input" required autoComplete="name" /></div>
        <div><label className="label req" htmlFor="phone">Phone</label><input id="phone" className="input" type="tel" required autoComplete="tel" /></div>
        <div className="sm:col-span-2"><label className="label req" htmlFor="remail">Business email</label><input id="remail" className="input" type="email" required autoComplete="email" /><p className="mt-1 text-xs text-ink-500">We'll send a verification link.</p></div>
        <div className="sm:col-span-2"><label className="label req" htmlFor="rpw">Password</label><input id="rpw" className="input" type="password" required minLength={10} autoComplete="new-password" /><p className="mt-1 text-xs text-ink-500">At least 10 characters.</p></div>
        <label className="flex gap-2 text-sm sm:col-span-2"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand-600" /> I agree to the Terms of Service and Data Processing Agreement.</label>
        {tried && <p className="text-sm text-rose-600 sm:col-span-2">Fill in the highlighted fields to continue.</p>}
        <button className="btn btn-primary btn-lg sm:col-span-2">Create workspace</button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link></p>
    </>
  );
}
