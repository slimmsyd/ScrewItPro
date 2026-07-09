import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "ScrewIt Pros logo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Shareable Open Graph image - brand LOGO only (not community photo).
 * Full-color wordmark centered on clean white + soft blue brand field.
 */
export default async function OpenGraphImage() {
  const assets = join(process.cwd(), "public/assets");

  const [wordmarkData, markData] = await Promise.all([
    readFile(join(assets, "logo-primary-full-color.jpg")),
    readFile(join(assets, "logo-icon-deep-blue.png")),
  ]);

  const wordmarkSrc = `data:image/jpeg;base64,${wordmarkData.toString("base64")}`;
  const markSrc = `data:image/png;base64,${markData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft brand wash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#EEF3FF",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "#1D6EFE",
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -90,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "#04209B",
            opacity: 0.1,
          }}
        />

        {/* Primary logo lockup - the shareable brand mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            padding: "0 80px",
          }}
        >
          <img
            src={markSrc}
            width={120}
            height={120}
            alt=""
            style={{ objectFit: "contain" }}
          />
          <img
            src={wordmarkSrc}
            width={720}
            height={160}
            alt="ScrewIt Pros"
            style={{
              objectFit: "contain",
              width: 720,
              height: 160,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
