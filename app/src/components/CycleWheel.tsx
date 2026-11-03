"use client";

import { getPhaseBoundaries, PHASES, type Season } from "@/lib/cycle";

interface CycleWheelProps {
  cycleDay: number;
  cycleLength: number;
  /** Display size in pixels. Default 180 (compact); pass 240+ for hero. */
  displaySize?: number;
}

/**
 * SVG-based cycle wheel showing four colored phase bands with a position marker.
 *
 * How it works:
 * - The wheel is a circle divided into four arcs (one per season/phase)
 * - Each arc is drawn as an SVG path using the arc command
 * - A dark dot marks the current position on the ring
 * - The current day number is shown in the center
 *
 * SVG coordinate system: 0° = top (12 o'clock), angles go clockwise.
 * We use a viewBox of 200x200 with center at (100, 100).
 */
export default function CycleWheel({ cycleDay, cycleLength, displaySize = 180 }: CycleWheelProps) {
  const size = 200;
  // Scale the center number with the wheel — roughly 30% of display size
  const dayFontSize = Math.round(displaySize * 0.3);
  const center = size / 2;
  const outerRadius = 88;
  const innerRadius = 74;
  const markerRadius = (outerRadius + innerRadius) / 2; // center of the band

  const boundaries = getPhaseBoundaries(cycleLength);

  // Convert a fraction (0-1) to an angle in radians, starting from top, going clockwise
  const fractionToAngle = (fraction: number) => fraction * Math.PI * 2 - Math.PI / 2;

  // Convert angle to x,y coordinates
  const angleToPoint = (angle: number, radius: number) => ({
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  });

  // Create an arc path between two fractions
  const createArcPath = (startFraction: number, endFraction: number) => {
    const startAngle = fractionToAngle(startFraction);
    const endAngle = fractionToAngle(endFraction);
    const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;

    const outerStart = angleToPoint(startAngle, outerRadius);
    const outerEnd = angleToPoint(endAngle, outerRadius);
    const innerStart = angleToPoint(endAngle, innerRadius);
    const innerEnd = angleToPoint(startAngle, innerRadius);

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");
  };

  // Position marker: where is the current day on the ring?
  const dayFraction = cycleDay / cycleLength;
  const markerAngle = fractionToAngle(dayFraction);
  const markerPos = angleToPoint(markerAngle, markerRadius);

  // Phase arcs in order
  const phases: { season: Season; start: number; end: number }[] = [
    { season: "winter", ...boundaries.winter },
    { season: "spring", ...boundaries.spring },
    { season: "summer", ...boundaries.summer },
    { season: "autumn", ...boundaries.autumn },
  ];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: displaySize, height: displaySize }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={displaySize} height={displaySize}>
        {/* Phase arcs */}
        {phases.map((phase) => (
          <path
            key={phase.season}
            d={createArcPath(phase.start, phase.end)}
            fill={PHASES[phase.season].color}
          />
        ))}

        {/* Position marker - dark dot */}
        <circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={5}
          fill="var(--text-primary)"
        />
      </svg>

      {/* Center day number — Outfit Light for editorial display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-light tracking-[-0.05em] text-text-primary leading-none"
          style={{ fontSize: dayFontSize }}
        >
          {cycleDay}
        </span>
      </div>
    </div>
  );
}
