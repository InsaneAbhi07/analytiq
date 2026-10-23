import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="font-display text-6xl font-extrabold text-ink-200">404</div>
      <h1 className="mt-2 text-xl font-bold">We couldn't find that page</h1>
      <p className="mt-1 text-sm text-ink-500">It may have moved, or you may not have access to it.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link to="/app" className="btn btn-primary">Go to dashboard</Link>
        <Link to="/careers" className="btn btn-secondary">Careers page</Link>
      </div>
    </div>
  );
}
