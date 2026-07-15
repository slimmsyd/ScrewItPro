"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Crew photo band that melts into the gray section below it.
 * Extracted from the old Audiences section so it can sit after WhyUs in V2.
 */
export default function AudiencesPhoto() {
  const { t } = useLocale();
  return (
    <section
      style={{
        background: "var(--white)",
        paddingTop: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
        <Image
          src={ASSETS.audiencesCrew}
          alt={t("audiences.photoAlt")}
          width={1080}
          height={600}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 240,
          background:
            "linear-gradient(to bottom, rgba(244,246,251,0) 0%, var(--gray-50) 90%)",
          pointerEvents: "none",
        }}
      />
    </section>
  );
}
