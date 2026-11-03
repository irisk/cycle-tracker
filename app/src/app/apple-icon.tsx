import { ImageResponse } from "next/og";

/**
 * Apple touch icon — same cycle wheel but with more padding for iOS.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cream,
          borderRadius: 40,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 200 200">
          <path
            d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z"
            fill={colors.winter}
          />
          <path
            d="M 100 100 L 180 100 A 80 80 0 0 1 100 180 Z"
            fill={colors.spring}
          />
          <path
            d="M 100 100 L 100 180 A 80 80 0 0 1 20 100 Z"
            fill={colors.summer}
          />
          <path
            d="M 100 100 L 20 100 A 80 80 0 0 1 100 20 Z"
            fill={colors.autumn}
          />
          <circle cx="100" cy="100" r="38" fill={cream} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
