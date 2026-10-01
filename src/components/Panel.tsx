import type { ReactNode } from "react";

export type PanelName = "about" | "contact";

/** The shared black slab. `align` decides which columns it spans. */
export function Panel({
  name,
  open,
  children,
}: {
  name: PanelName;
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div className="panel" data-panel={name} data-align={name} data-open={open} inert={!open}>
      <div className="panel-clip">
        <div className="panel-inner">{children}</div>
      </div>
    </div>
  );
}

/** One staggered block inside a panel. */
export function Item({
  delay,
  className = "",
  children,
}: {
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`panel-item ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="dim pb-2 text-[9px] uppercase tracking-[0.11em]">*{children}</h2>
  );
}
