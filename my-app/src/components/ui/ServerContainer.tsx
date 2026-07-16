import type { CSSProperties, ReactNode } from "react";

/**
 * Client-free counterpart to ui/Container.
 *
 * Container reads useIsMobile, which returns false on the server and on first
 * client render — so it always emits desktop padding into the initial HTML and
 * corrects only after hydration. clamp() gets the same 20px→32px gutters with
 * no JS and no layout shift, keeping the whole subtree a Server Component.
 */
export default function ServerContainer({
  children,
  style,
  maxWidth = "var(--container-max)",
}: {
  children: ReactNode;
  style?: CSSProperties;
  maxWidth?: string | number;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto",
        padding: "0 clamp(20px, 5vw, 32px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
