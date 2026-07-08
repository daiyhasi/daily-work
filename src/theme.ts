import { MD3DarkTheme } from "react-native-paper";

export const palette = {
  canvas: "#090B0D",
  surface: "#11161A",
  surfaceRaised: "#182025",
  surfaceGlass: "rgba(24,32,37,0.84)",
  ink: "#F3F7EF",
  muted: "#89949A",
  quiet: "#5D676C",
  line: "#2A3439",
  lime: "#C7F64D",
  cyan: "#56D8F5",
  ember: "#FF7B3D",
  violet: "#A58BFF",
  danger: "#FF5D6C",
  charcoal: "#0E1114",
  black: "#090B0D",
};

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.lime,
    secondary: palette.ember,
    tertiary: palette.cyan,
    background: palette.canvas,
    surface: palette.surfaceRaised,
    surfaceVariant: palette.surface,
    outline: palette.line,
    onSurface: palette.ink,
    onSurfaceVariant: palette.muted,
    onPrimary: palette.black,
  },
};
