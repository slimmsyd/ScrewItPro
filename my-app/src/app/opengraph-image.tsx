import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "ScrewIt Pros - Furniture assembly without the hassle. Houston Metro.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Shared Open Graph / social share image - brand deep + electric blue + S mark.
 * Used site-wide via Next.js file-based metadata.
 */
export default async function OpenGraphImage() {
  const logoPath = join(
    process.cwd(),
    "public/assets/logo-s-white.png"
  );
  const logoData = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
          background: "#04209B",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft electric accent glow (top-right) */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "#1D6EFE",
            opacity: 0.35,
          }}
        />
        {/* Soft accent (bottom-left) */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -100,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#0A3BC0",
            opacity: 0.5,
          }}
        />

        {/* Brand mark */}
        <img
          src={logoSrc}
          width={200}
          height={200}
          alt=""
          style={{
            objectFit: "contain",
            marginBottom: 36,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "0 64px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            ScrewIt Pros
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#B3CCFF",
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: 820,
            }}
          >
            Furniture assembly without the hassle
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              fontWeight: 600,
              color: "#1D6EFE",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            If You Don&apos;t Want to Do It, ScrewIt!
          </div>
        </div>

        {/* Footer chip */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "10px 22px",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#1D6EFE",
            }}
          />
          <div style={{ fontSize: 18, color: "#DCE7FF", fontWeight: 600 }}>
            Houston Metro · Private Beta
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
