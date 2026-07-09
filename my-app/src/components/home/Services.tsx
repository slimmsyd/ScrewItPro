"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";

const services = [
  { title: "Furniture Assembly", sub: "Starting at $49" },
  { title: "Pickup & Delivery", sub: "We handle the transport" },
  { title: "Large Furniture Assembly", sub: "Starting at $129" },
  { title: "Office Furniture Assembly", sub: "Desks, tables & workstations" },
  { title: "Senior Convenience Service", sub: "Zero physical effort required" },
  { title: "White Glove Delivery", sub: "Placed, unpacked & inspected" },
  { title: "Membership Plans", sub: "Starting at $29/month" },
];

function ServiceRow({
  title,
  sub,
  last,
}: {
  title: string;
  sub: string;
  last: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        padding: "22px 4px",
        cursor: "pointer",
        borderBottom: last ? "none" : "1px solid var(--gray-100)",
      }}
    >
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-body)",
          fontSize: "clamp(17px, 4.6vw, 20px)",
          fontWeight: 600,
          color: h ? "var(--blue-electric)" : "var(--text-heading)",
          transition: "color var(--duration-fast) var(--ease-out)",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(12.5px, 3.4vw, 15px)",
          color: "var(--text-muted)",
          flex: "none",
          textAlign: "right",
        }}
      >
        {sub}
      </span>
      <ArrowRight
        size={18}
        color={h ? "var(--blue-electric)" : "var(--ink-300)"}
      />
    </div>
  );
}

export default function Services() {
  return (
    <Reveal
      as="section"
      id="services"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container>
        <Eyebrow>Services</Eyebrow>
        <SectionTitle>
          Everything Between the Store and Your Living Room
        </SectionTitle>
        <div style={{ marginTop: 40 }}>
          {services.map((s, i) => (
            <ServiceRow
              key={s.title}
              title={s.title}
              sub={s.sub}
              last={i === services.length - 1}
            />
          ))}
        </div>
      </Container>
    </Reveal>
  );
}
