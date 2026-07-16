import type { Metadata } from "next";

/**
 * Metadata wrapper for /join. The page itself is a Client Component and cannot
 * export metadata, so this server layout supplies it. The existing
 * join/opengraph-image.tsx + twitter-image.tsx continue to provide share cards.
 */
export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "Get early access to ScrewIt Pros — furniture assembly and white-glove delivery in the Houston metro. Join the private-beta waitlist and start earning points from your first build.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join the Waitlist | ScrewIt Pros",
    description:
      "Get early access to ScrewIt Pros furniture assembly and white-glove delivery in Houston.",
    url: "/join",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
