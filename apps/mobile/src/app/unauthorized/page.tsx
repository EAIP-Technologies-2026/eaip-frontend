import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-semibold">Unauthorized</h1>
      <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      <Link href="/dashboard" className="mt-6 text-blue-600 hover:underline">
        Return to dashboard
      </Link>
    </main>
  );
}
