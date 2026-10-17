"use client";

import { useEffect, type AnchorHTMLAttributes, type Ref } from "react";
import { useRouter } from "next/navigation";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  ref?: Ref<HTMLAnchorElement>;
};

/**
 * A link with no href, so the browser does not print the URL in the bottom
 * corner every time the cursor passes over a picture. It still behaves like a
 * link: click, Enter, and cmd/ctrl/middle-click for a new tab.
 *
 * A caller's onClick runs first and can preventDefault to keep the click for
 * itself, which is how the reel turns a click on a side card into a nudge.
 */
export function QuietLink({ to, onClick, onKeyDown, ref, ...rest }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(to);
  }, [router, to]);

  const go = (newTab: boolean) => {
    if (newTab) window.open(to, "_blank", "noopener");
    else router.push(to);
  };

  return (
    <a
      ref={ref}
      role="link"
      tabIndex={0}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        go(e.metaKey || e.ctrlKey || e.shiftKey);
      }}
      onAuxClick={(e) => {
        if (e.button === 1) go(true);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented && e.key === "Enter") e.currentTarget.click();
      }}
    />
  );
}
