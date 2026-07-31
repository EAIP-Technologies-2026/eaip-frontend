import Link from "next/link";
import { EnterpriseIcon } from "@eaip/icons";

export default function UnauthorizedPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 text-center overflow-hidden bg-atmosphere-animated">
      <div className="orb-glow bg-danger/10 absolute -top-20 -left-20 h-80 w-80" aria-hidden="true" />
      <div className="orb-glow bg-accent-glow/10 absolute -bottom-32 -right-20 h-96 w-96" aria-hidden="true" />
      <div className="relative page-enter">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger mx-auto">
          <EnterpriseIcon name="shield" size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text">Access Denied</h1>
        <p className="mt-3 max-w-md text-base text-text-secondary leading-relaxed mx-auto">
          You do not have permission to access this resource. Contact your administrator if you believe this is an error.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-button bg-primary px-5 py-2.5 text-sm font-medium text-text-inverse shadow-sm transition-smooth hover:bg-primary-hover press-feedback"
        >
          <EnterpriseIcon name="arrowLeft" size={16} />
          Return to Dashboard
        </Link>
        <p className="mt-6 text-xs text-text-muted">
          Enterprise Authentication & Identity Platform
        </p>
      </div>
    </main>
  );
}
