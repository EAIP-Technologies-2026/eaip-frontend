import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Badge } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export interface KeyValuePair {
  key: string;
  label: string;
  value: ReactNode;
  type?: "text" | "badge" | "link" | "code";
}

export interface PropertyListProps extends HTMLAttributes<HTMLDListElement> {
  items: KeyValuePair[];
  layout?: "grid" | "stack";
  labelWidth?: "sm" | "md" | "lg";
}

export function PropertyList({ items, layout = "grid", labelWidth = "md", className, ...props }: PropertyListProps) {
  const labelWidths = { sm: "w-24", md: "w-32", lg: "w-40" };
  return (
    <dl className={cn(layout === "grid" ? "grid grid-cols-2 gap-x-6 gap-y-3" : "space-y-3", className)} {...props}>
      {items.map((item) => (
        <div key={item.key} className={cn("flex", layout === "grid" ? "flex-col gap-0.5" : "items-start gap-3")}>
          <dt className={cn("text-sm font-medium text-text-secondary shrink-0", layout === "stack" && labelWidths[labelWidth])}>
            {item.label}
          </dt>
          <dd className="text-sm text-text">
            {item.type === "badge" ? (
              <Badge>{item.value}</Badge>
            ) : item.type === "code" ? (
              <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs font-mono">{item.value}</code>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface DetailSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  defaultOpen?: boolean;
}

export function DetailSection({ title, children, action, className, ...props }: DetailSectionProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export interface TreeViewProps {
  items: TreeNodeItem[];
  expandedIds?: string[];
  selectedId?: string;
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
  className?: string;
}

export interface TreeNodeItem {
  id: string;
  label: ReactNode;
  icon?: string;
  children?: TreeNodeItem[];
  disabled?: boolean;
}

function TreeNode({ item, depth, expandedIds, selectedId, onToggle, onSelect }: {
  item: TreeNodeItem;
  depth: number;
  expandedIds: string[];
  selectedId?: string;
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.includes(item.id);
  const isSelected = selectedId === item.id;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 rounded-button px-2 py-1.5 text-sm transition-smooth cursor-pointer",
          isSelected ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
          item.disabled && "opacity-50 pointer-events-none",
        )}
        style={{ paddingLeft: `${String(depth * 16 + 8)}px` }}
        onClick={() => { onSelect?.(item.id); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(item.id); } }}
        role="treeitem"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle?.(item.id); }}
            className="shrink-0 rounded p-0.5 text-text-muted hover:text-text"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={cn("transition-transform", isExpanded && "rotate-90")} aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        {item.icon && <EnterpriseIcon name={item.icon as never} size={16} className="shrink-0 text-text-muted" />}
        <span className="truncate">{item.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul role="group">
          {item.children?.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({ items, expandedIds = [], selectedId, onToggle, onSelect, className, ...props }: TreeViewProps) {
  return (
    <ul className={cn("space-y-0.5", className)} role="tree" {...props}>
      {items.map((item) => (
        <TreeNode key={item.id} item={item} depth={0} expandedIds={expandedIds} selectedId={selectedId} onToggle={onToggle} onSelect={onSelect} />
      ))}
    </ul>
  );
}

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
}

export function CodeBlock({ code, language, showLineNumbers = false, copyable = true, className, ...props }: CodeBlockProps) {
  const lines = code.split("\n");
  return (
    <div className={cn("group relative rounded-card border border-border bg-surface-secondary overflow-hidden", className)}>
      {language && (
        <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
          <span className="text-xs font-medium text-text-muted">{language}</span>
          {copyable && (
            <button
              type="button"
              onClick={() => { void navigator.clipboard.writeText(code); }}
              className="rounded-button px-2 py-0.5 text-xs text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text"
            >
              Copy
            </button>
          )}
        </div>
      )}
      <pre className={cn("overflow-x-auto p-4 text-sm leading-relaxed", className)} {...props}>
        <code className="font-mono text-text">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {showLineNumbers && (
                <span className="inline-block w-8 text-right text-text-muted select-none mr-4">{i + 1}</span>
              )}
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}