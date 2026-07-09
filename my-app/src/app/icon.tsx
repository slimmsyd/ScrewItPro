import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab favicon - white S on ScrewIt deep blue */
export default async function Icon() {
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
          borderRadius: 6,
        }}
      >
        <img
          src={logoSrc}
          width={24}
          height={24}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
