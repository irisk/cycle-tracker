import type { Season } from "@/lib/cycle";

interface PhaseGlyphProps {
  season: Season;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Custom SVG glyphs for each cycle phase / season.
 *
 * Winter = crescent moon (rest, dark phase)
 * Spring = sprout (emerging energy)
 * Summer = sun (peak, radiance)
 * Autumn = leaf (turning, winding down)
 *
 * Uses currentColor, so color is set via CSS text color on the parent.
 */
export default function PhaseGlyph({
  season,
  size = 24,
  strokeWidth = 1.5,
  className,
}: PhaseGlyphProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (season) {
    case "winter":
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      );
    case "spring":
      return (
        <svg {...common}>
          <path d="M12 21V11" />
          <path d="M12 11C12 11 7 7 4 10C3 13 7 15 12 14" />
          <path d="M12 11C12 11 17 6 20 9C21 12 17 14 12 13" />
        </svg>
      );
    case "summer":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2.5" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21.5" y2="12" />
          <line x1="5.3" y1="5.3" x2="7" y2="7" />
          <line x1="17" y1="17" x2="18.7" y2="18.7" />
          <line x1="5.3" y1="18.7" x2="7" y2="17" />
          <line x1="17" y1="7" x2="18.7" y2="5.3" />
        </svg>
      );
    case "autumn":
      return (
        <svg {...common}>
          <path d="M5 19C5 11 9 6 19 5C19 14 15 19 5 19Z" />
          <path d="M5 19L11 13" />
        </svg>
      );
  }
}
