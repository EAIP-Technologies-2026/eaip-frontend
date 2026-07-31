import Link from "next/link";
import { EnterpriseIcon } from "@eaip/icons";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <EnterpriseIcon name="shield" size={48} className="mb-4 text-danger" />
      <h1 className="text-3xl font-semibold">Access Denied</h1>
      <p className="mt-2 max-w-md text-text-secondary">
        You do not have permission to access this resource. Contact your administrator if you believe this is an error.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-text-inverse transition-smooth hover:bg-primary/90"
      >
        <EnterpriseIcon name="arrowLeft" size={16} />
        Return to Dashboard
      </Link>
    </main>
  );
}
