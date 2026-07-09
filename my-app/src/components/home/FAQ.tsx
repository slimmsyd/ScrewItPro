"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";
import { collapse } from "@/lib/motion";

const faqs = [
  {
    title: "How much does furniture assembly cost?",
    content:
      "Pricing starts at $49 and varies based on size, complexity, and delivery requirements. Contact us for a free quote.",
  },
  {
    title: "How long does the process take?",
    content:
      "Most projects are completed within 24 to 72 hours from pickup to delivery.",
  },
  {
    title: "What types of furniture do you assemble?",
    content:
      "We assemble beds, desks, dressers, tables, shelving, entertainment centers, office furniture, outdoor furniture, and more.",
  },
  {
    title: "Do you pick up furniture from stores?",
    content:
      "Yes. We can pick up furniture from participating retailers or receive shipments directly at our assembly hub.",
  },
  {
    title: "What if my furniture arrives damaged?",
    content:
      "We inspect all items upon receipt and notify you immediately if damage is found before assembly begins.",
  },
  {
    title: "Is my furniture insured while in your care?",
    content:
      "Yes. We take every precaution to protect your furniture during pickup, assembly, storage, and delivery.",
  },
  {
    title: "Do you remove packaging materials?",
    content:
      "Yes. We dispose of boxes and packaging materials as part of our white glove service.",
  },
  {
    title: "Can I schedule a specific delivery time?",
    content:
      "Absolutely. We’ll coordinate delivery windows that fit your schedule.",
  },
  {
    title: "Will I receive updates on my order?",
    content:
      "Yes. You’ll receive status updates throughout the pickup, assembly, and delivery process.",
  },
  {
    title: "Do you offer recurring or membership services?",
    content:
      "Yes. Our membership plans provide discounted assembly services, priority scheduling, and added convenience.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Reveal
      as="section"
      id="faq"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container style={{ maxWidth: 820 }}>
        <Eyebrow>FAQ</Eyebrow>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <div style={{ marginTop: 32 }}>
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.title}
                style={{
                  borderBottom: "1px solid var(--gray-100)",
                }}
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
