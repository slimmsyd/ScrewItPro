import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon - white S on ScrewIt deep blue */
export default async function AppleIcon() {
  const logoData = await readFile(
    join(process.cwd(), "public/assets/logo-s-white.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#04209B",
        }}
      >
        <img
          src={logoSrc}
          width={120}
          height={120}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
