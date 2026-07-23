"use client";

import { useEffect, useState } from "react";
import { Archive } from "lucide-react";

/**
 * Single thumb for order surfaces (summary, confirmation).
 * Prefer item imageUrl (IKEA/Target CDN or upload); fall back to archive tile.
 */
export default function OrderItemThumb({
  imageUrl,
  name,
  size = 44,
}: {
  imageUrl?: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  // New URL (snapshot hydrates after mount) must reset prior load failure.
  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const show = Boolean(imageUrl) && !failed;

  if (show && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- retailer CDN URLs; not next/image hosts
      <img
        src={imageUrl}
        alt={name}
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          objectFit: "cover",
          background: "var(--gray-50)",
          border: "1px solid var(--border-default)",
          flex: `0 0 ${size}px`,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: "var(--blue-50)",
        display: "grid",
        placeItems: "center",
        flex: `0 0 ${size}px`,
      }}
    >
      <Archive size={Math.round(size * 0.45)} color="var(--blue-electric)" strokeWidth={2} />
    </div>
  );
}
