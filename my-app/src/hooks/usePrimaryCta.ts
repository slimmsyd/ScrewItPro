"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import {
  primaryCtaLabelKey,
  resolvePrimaryCtaAction,
  shareWaitlistInvite,
  waitlistInviteUrl,
  type PrimaryCtaAction,
  type ShareResult,
} from "@/lib/member";
import { isWaitlist, JOIN_PATH, QUOTE_PATH } from "@/lib/site";

/**
 * Site-wide primary CTA (Join / Share / Quote / Finish joining)
 * driven by membership state + SITE_MODE.
 *
 * In quote mode (develop / real site): always "Get a Free Quote" → /quote/where.
 * Share / join waitlist CTAs only apply when SITE_MODE is waitlist.
 */
export function usePrimaryCta(opts?: {
  /** Override quote navigation (default: /quote/where). */
  onQuote?: () => void;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const { status } = useMember();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const onQuoteRef = useRef(opts?.onQuote);
  onQuoteRef.current = opts?.onQuote;

  const action: PrimaryCtaAction = resolvePrimaryCtaAction(status, isWaitlist);
  const label = t(primaryCtaLabelKey(action));

  const clearFeedbackSoon = useCallback((msg: string) => {
    setShareFeedback(msg);
    window.setTimeout(() => setShareFeedback(null), 2800);
  }, []);

  const run = useCallback(async () => {
    if (action === "share") {
      setShareBusy(true);
      try {
        const result: ShareResult = await shareWaitlistInvite({
          title: t("share.title"),
          text: t("share.text"),
          url: waitlistInviteUrl(),
        });
        if (result === "copied") clearFeedbackSoon(t("common.linkCopied"));
        else if (result === "failed") clearFeedbackSoon(t("common.shareFailed"));
      } finally {
        setShareBusy(false);
      }
      return;
    }

    if (action === "quote") {
      if (onQuoteRef.current) onQuoteRef.current();
      else router.push(QUOTE_PATH);
      return;
    }

    // join | finish_join (waitlist mode only)
    router.push(JOIN_PATH);
  }, [action, clearFeedbackSoon, router, t]);

  return {
    action,
    label,
    run,
    shareFeedback,
    shareBusy,
    status,
  };
}
