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
import { isWaitlist, JOIN_PATH } from "@/lib/site";

/**
 * Site-wide primary CTA (Join / Share / Quote / Finish joining)
 * driven by membership state.
 */
export function usePrimaryCta(opts?: {
  /** Open quote dialog instead of navigating when action is quote. */
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
      else router.push(JOIN_PATH);
      return;
    }

    // join | finish_join
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
