import type { Metadata } from "next";

/**
 * Customer portal segment — never index (auth-gated UX).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
