import { IconButton } from "./icon-button";
import { Divider } from "./divider";
import { Tabs } from "./tabs";
import { Tooltip } from "./tooltip";
import { Popover } from "./popover";
import { Skeleton, EmptyState, LoadingState, ErrorState } from "./states";
import { LinearProgress, CircularProgress } from "./progress";
import { Input } from "./index";
import { EnterpriseIcon } from "@eaip/icons";

export default {
  title: "Primitives/Foundation",
};

export const IconButtons = () => (
  <div className="flex flex-wrap gap-3 p-4">
    <IconButton aria-label="Search" variant="primary">
      <EnterpriseIcon name="search" size={18} />
    </IconButton>
    <IconButton aria-label="Settings" variant="secondary">
      <EnterpriseIcon name="settings" size={18} />
    </IconButton>
    <IconButton aria-label="Delete" variant="destructive">
      <EnterpriseIcon name="trash" size={18} />
    </IconButton>
    <IconButton aria-label="Ghost" variant="ghost">
      <EnterpriseIcon name="moreVertical" size={18} />
    </IconButton>
    <IconButton aria-label="Loading" variant="primary" isLoading>
      <EnterpriseIcon name="search" size={18} />
    </IconButton>
    <IconButton aria-label="Disabled" variant="secondary" disabled>
      <EnterpriseIcon name="user" size={18} />
    </IconButton>
  </div>
);

export const Dividers = () => (
  <div className="max-w-md space-y-4 p-4">
    <Divider />
    <Divider variant="dashed" label="OR CONTINUE WITH" />
    <Divider variant="dotted" label="END OF LIST" labelPosition="start" />
  </div>
);

export const CompoundTabs = () => (
  <div className="max-w-md p-4">
    <Tabs defaultValue="account">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="security">Security</Tabs.Trigger>
        <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">Account Settings Panel</Tabs.Content>
      <Tabs.Content value="security">Security Settings Panel</Tabs.Content>
      <Tabs.Content value="notifications">Notification Preferences</Tabs.Content>
    </Tabs>
  </div>
);

export const CompoundTooltip = () => (
  <div className="flex justify-center p-12">
    <Tooltip side="top">
      <Tooltip.Trigger>
        <span className="rounded-button bg-surface border p-2 text-sm">Hover for Tooltip</span>
      </Tooltip.Trigger>
      <Tooltip.Content>Detailed tooltip explanation</Tooltip.Content>
    </Tooltip>
  </div>
);

export const CompoundPopover = () => (
  <div className="flex justify-center p-12">
    <Popover side="bottom">
      <Popover.Trigger>
        <span className="rounded-button bg-primary p-2 text-sm text-white">Open Popover</span>
      </Popover.Trigger>
      <Popover.Content>
        <h4 className="text-sm font-semibold">Popover Title</h4>
        <p className="text-text-secondary mt-1 text-xs">Popover content body with options.</p>
      </Popover.Content>
    </Popover>
  </div>
);

export const ComponentStates = () => (
  <div className="max-w-lg space-y-6 p-4">
    <Skeleton width="100%" height="40px" />
    <LoadingState message="Fetching analytics data..." />
    <EmptyState title="No items found" description="Get started by creating your first entry." />
    <ErrorState title="Connection failed" onRetry={() => {}} />
  </div>
);

export const ProgressIndicators = () => (
  <div className="max-w-md space-y-4 p-4">
    <LinearProgress value={65} showLabel />
    <LinearProgress value={85} variant="success" showLabel />
    <CircularProgress value={45} showLabel />
  </div>
);

export const InputTypes = () => (
  <div className="max-w-md space-y-4 p-4">
    <Input label="Email Address" type="email" placeholder="user@eaip.internal" />
    <Input label="Password Input" type="password" placeholder="••••••••" />
    <Input
      label="Search Bar"
      type="search"
      placeholder="Type query..."
      value="Search string"
      onClear={() => {}}
    />
  </div>
);
