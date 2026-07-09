import { type ReactNode, type HTMLAttributes } from "react";

// Card
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={["rounded-xl border border-gray-200 bg-white shadow-sm", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return <div className={["border-b border-gray-200 px-6 py-4", className].filter(Boolean).join(" ")} {...props}>{children}</div>;
}

export function CardContent({ children, className, ...props }: CardProps) {
  return <div className={["px-6 py-4", className].filter(Boolean).join(" ")} {...props}>{children}</div>;
}

// Dialog
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}