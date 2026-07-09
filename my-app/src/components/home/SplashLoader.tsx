"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function SplashLoader({
  progress,
  exiting,
}: {
  progress: number;
  exiting: boolean;
}) {
  const { t } = useLocale();
  return (
    <div
      className={exiting ? "splash splash-exiting" : "splash"}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="splash-inner">
        <Image
          className="splash-mark"
          src={ASSETS.logoS}
          alt="ScrewIt Pros"
          width={92}
          height={92}
          priority
        />
        <div className="splash-track">
          <div className="splash-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="splash-cap">{t("splash.caption")}</div>
      </div>
    </div>
  );
}
