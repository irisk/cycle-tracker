/**
 * Shared flow intensity constants used across Log, Calendar, and Timeline views.
 *
 * Single source of truth — avoids duplicating color/label maps in each component.
 */

export type FlowIntensity = "none" | "spotting" | "light" | "medium" | "heavy";

/** CSS variable names for flow colors (defined in globals.css @theme) */
export const FLOW_COLORS: Record<string, string> = {
  heavy: "var(--flow-heavy)",
  medium: "var(--flow-medium)",
  light: "var(--flow-light)",
  spotting: "var(--flow-spotting)",
  none: "var(--bg-muted)",
};

/** Raw hex values for flow colors (needed for inline SVG/canvas where CSS vars don't work) */
export const FLOW_HEX: Record<string, string> = {
  heavy: "#8B2723",
  medium: "#B43E38",
  light: "#D46F75",
  spotting: "#EFC8CA",
  none: "#E8E2D6",
};

export const FLOW_LABELS: Record<string, string> = {
  heavy: "Heavy",
  medium: "Medium",
  light: "Light",
  spotting: "Spotting",
  none: "None",
};

/** Prediction styling for calendar view. Period uses flow-heavy red, ovulation uses summer gold. */
export const PREDICTION_COLORS = {
  period: "#8B2723",    // flow-heavy red
  ovulation: "#D69327", // summer gold
} as const;

/** Flow options for the log form — includes indicator dot sizes for visual hierarchy */
export const FLOW_OPTIONS: readonly {
  value: FlowIntensity;
  label: string;
  size: number;
}[] = [
  { value: "none", label: "None", size: 20 },
  { value: "spotting", label: "Spotting", size: 20 },
  { value: "light", label: "Light", size: 20 },
  { value: "medium", label: "Medium", size: 24 },
  { value: "heavy", label: "Heavy", size: 28 },
] as const;
