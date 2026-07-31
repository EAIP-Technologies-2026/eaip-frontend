"use client";

export function DevModeBanner() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-lg">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
      <div className="text-xs text-amber-800">
        <p className="font-medium">Development Mode</p>
        <p className="text-amber-600">Showing simulated data</p>
      </div>
    </div>
  );
}
