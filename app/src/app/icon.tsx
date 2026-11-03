import { ImageResponse } from "next/og";

/**
 * Dynamic favicon — a cycle wheel icon using the four season colors.
 * Generated at build time by Next.js (no static file needed).
 */
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  // Season colors from cycle.ts PHASES (v2 palette)
  const colors = {
    winter: "#3E4F6B",
    spring: "#5C9362",
    summer: "#D69327",
    autumn: "#B85D3E",
  };
  const cream = "#F4EFE7";

  return new ImageResponse(
    (
      <div
        style={{
          width: 256,
          height: 256,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cream,
          borderRadius: 52,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Four quarter-circle arcs forming a cycle wheel */}
          {/* Winter (top-right) */}
          <path
            d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z"
            fill={colors.winter}
          />
          {/* Spring (bottom-right) */}
          <path
            d="M 100 100 L 180 100 A 80 80 0 0 1 100 180 Z"
            fill={colors.spring}
          />
          {/* Summer (bottom-left) */}
          <path
            d="M 100 100 L 100 180 A 80 80 0 0 1 20 100 Z"
            fill={colors.summer}
          />
          {/* Autumn (top-left) */}
          <path
            d="M 100 100 L 20 100 A 80 80 0 0 1 100 20 Z"
            fill={colors.autumn}
          />
          {/* Inner circle (cream) — smaller to give color ring more presence */}
          <circle cx="100" cy="100" r="38" fill={cream} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
