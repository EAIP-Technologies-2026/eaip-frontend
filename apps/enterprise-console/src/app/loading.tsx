"use client";

import { PageSkeleton } from "@eaip/ui-primitives";

export default function RootLoading() {
  return (
    <div className="bg-surface-secondary/50 flex min-h-screen flex-col justify-start p-6">
      <PageSkeleton title statCards={4} />
    </div>
  );
}
