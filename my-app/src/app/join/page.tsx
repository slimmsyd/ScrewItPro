"use client";

import { Suspense } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { JoinForm } from "@/components/join/JoinForm";

export default function JoinPage() {
  const { t } = useLocale();
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-body)",
            color: "var(--ink-500)",
          }}
        >
          {t("common.loading")}
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
