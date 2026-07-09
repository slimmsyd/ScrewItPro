"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";
import { collapse } from "@/lib/motion";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useLocale();

  const faqs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        title: t(`faq.q${i + 1}`),
        content: t(`faq.a${i + 1}`),
      })),
    [t]
  );

  return (
    <Reveal
      as="section"
      id="faq"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container style={{ maxWidth: 820 }}>
        <Eyebrow>{t("faq.eyebrow")}</Eyebrow>
        <SectionTitle>{t("faq.title")}</SectionTitle>
        <div style={{ marginTop: 32 }}>
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.title}
                style={{ borderBottom: "1px solid var(--gray-100)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "18px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-body)",
                    fontSize: 16.5,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                  }}
                >
                  {faq.title}
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-flex", flexShrink: 0 }}
                  >
                    <ChevronDown size={20} color="var(--ink-500)" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={collapse}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        style={{
                          margin: "0 0 18px",
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          lineHeight: "var(--leading-body)",
                          color: "var(--text-muted)",
                          maxWidth: "58ch",
                        }}
                      >
                        {faq.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </Reveal>
  );
}
