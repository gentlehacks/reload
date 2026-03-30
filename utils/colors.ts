/**
 * App theme — blue as primary. Use these tokens everywhere for consistent UI.
 */
export const colors = {
  /** Main brand blue */
  primary: "#2563EB",
  primaryLight: "#3B82F6",
  primarySoft: "#EFF6FF",
  primaryMuted: "#DBEAFE",
  primaryDark: "#1D4ED8",
  primaryDeep: "#1E3A8A",

  /** Surfaces */
  background: "#F1F5F9",
  surface: "#FFFFFF",
  surfaceGlass: "rgba(255, 255, 255, 0.94)",
  surfaceSubtle: "rgba(255, 255, 255, 0.88)",

  /** Text */
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textOnPrimary: "#FFFFFF",

  /** Borders & dividers */
  border: "rgba(15, 23, 42, 0.10)",
  borderStrong: "rgba(37, 99, 235, 0.22)",
  borderSubtle: "rgba(15, 23, 42, 0.06)",

  /** Shadows (iOS) */
  shadow: "#0F172A",

  /** Accents */
  success: "#22C55E",
  successMuted: "rgba(34, 197, 94, 0.45)",

  /** Gradients (LinearGradient) */
  gradientHero: ["#DBEAFE", "#F8FAFC"] as [string, string],
  gradientHeroAlt: ["#BFDBFE", "#FFFFFF"] as [string, string],
  gradientPermission: ["#1E3A8A", "#172554"] as [string, string],

  /** Scan / camera */
  cameraBg: "#020617",
  scanOverlay: ["rgba(15, 23, 42, 0.92)", "rgba(30, 58, 138, 0.35)", "rgba(15, 23, 42, 0.92)"] as [
    string,
    string,
    string,
  ],
  scanFrameBorder: "rgba(255, 255, 255, 0.22)",
  scanLine: "rgba(59, 130, 246, 0.65)",
  scanCorner: "rgba(255, 255, 255, 0.92)",
  controlGlass: "rgba(255, 255, 255, 0.14)",
  controlBorder: "rgba(255, 255, 255, 0.18)",
  torchActiveBg: "rgba(37, 99, 235, 0.45)",
  torchActiveBorder: "rgba(147, 197, 253, 0.55)",

  /** Misc */
  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof colors;
