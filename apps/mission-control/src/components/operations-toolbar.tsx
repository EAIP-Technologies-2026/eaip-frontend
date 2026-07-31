"use client";

import { Button } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export interface OperationsToolbarProps {
  onRefresh?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  isPaused?: boolean;
  isFullscreen?: boolean;
  children?: React.ReactNode;
}

export function OperationsToolbar({
  onRefresh,
  onPause,
  onResume,
  onExport,
  onFullscreen,
  isPaused,
  isFullscreen,
  children,
}: OperationsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2">
      {onRefresh ? (
        <Button variant="secondary" size="sm" iconLeft="refresh" onClick={onRefresh}>
          Refresh
        </Button>
      ) : null}
      {isPaused && onResume ? (
        <Button variant="secondary" size="sm" iconLeft="play" onClick={onResume}>
          Resume
        </Button>
      ) : null}
      {!isPaused && onPause ? (
        <Button variant="secondary" size="sm" iconLeft="pause" onClick={onPause}>
          Pause
        </Button>
      ) : null}
      {onExport ? (
        <Button variant="secondary" size="sm" onClick={onExport}>
          <EnterpriseIcon name="download" size={14} />
          <span className="ml-1">Export</span>
        </Button>
      ) : null}
      {onFullscreen ? (
        <Button variant="secondary" size="sm" onClick={onFullscreen}>
          <EnterpriseIcon name={isFullscreen ? "x" : "menu"} size={14} />
          <span className="ml-1">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </Button>
      ) : null}
      {children}
    </div>
  );
}
