import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppDataProvider } from "../src/state/AppDataContext";
import { palette, paperTheme } from "../src/theme";

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <AppDataProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: palette.canvas,
              },
            }}
          />
        </AppDataProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
