/** Placeholder for photography drop-zones from the design handoff. */
export default function ImageSlot({
  label,
  className,
  style,
}: {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gray-100)",
        color: "var(--ink-300)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        textAlign: "center",
        padding: 24,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
