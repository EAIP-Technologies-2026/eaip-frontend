import { IconPlaceholder } from "@eaip/icons";

export interface EnterpriseIconProps {
  name?: string;
  className?: string;
}

export function EnterpriseIcon({ name, className }: EnterpriseIconProps) {
  return <IconPlaceholder className={className} aria-label={name ?? "icon"} />;
}
