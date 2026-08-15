"use client";

import { ConductorWidget } from "@eaip/ui-enterprise";
import { useAuth } from "@eaip/auth";
import { useConductor } from "../hooks/use-conductor";

export function Conductor() {
  const { user } = useAuth();
  const { messages, loading, pending, approvingId, send, decide } = useConductor();

  if (!user) return null;

  return (
    <ConductorWidget
      messages={messages}
      onSend={(message) => {
        void send(message);
      }}
      loading={loading}
      approvals={pending}
      approvingId={approvingId}
      onApprove={(id) => {
        void decide(id, true);
      }}
      onReject={(id) => {
        void decide(id, false);
      }}
    />
  );
}
