import { MD3LightTheme } from "react-native-paper";

export const palette = {
  canvas: "#F2F0E8",
  surface: "#FBFAF5",
  surfaceRaised: "#FFFFFF",
  ink: "#20231F",
  muted: "#73766E",
  line: "#DBD6C9",
  moss: "#647A37",
  lime: "#D6F36A",
  clay: "#B8643D",
  steel: "#456C7B",
  amber: "#E3A93B",
  danger: "#B84D4D",
  charcoal: "#292E29",
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.moss,
    secondary: palette.clay,
    tertiary: palette.steel,
    background: palette.canvas,
    surface: palette.surfaceRaised,
    surfaceVariant: "#ECE8DC",
    outline: palette.line,
    onSurface: palette.ink,
    onSurfaceVariant: palette.muted,
  },
};
