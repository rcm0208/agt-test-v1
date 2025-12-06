import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { WorkoutProvider } from "../context/WorkoutContext";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: "#000000", // Deep Black
    onPrimary: "#64B5F6", // Muted Light Blue text on black
    primaryContainer: "#64B5F6", // Muted Light Blue container
    onPrimaryContainer: "#000000", // Black text on blue
    secondary: "#121212", // Dark Grey
    onSecondary: "#FFFFFF",
    secondaryContainer: "#F2F2F2", // Light Grey
    onSecondaryContainer: "#000000",
    tertiary: "#FF4500", // International Orange (Accent)
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFE0D6",
    onTertiaryContainer: "#330E00",
    background: "#FFFFFF", // Stark White
    surface: "#FFFFFF",
    surfaceVariant: "#EEEEEE",
    onSurface: "#000000",
    onSurfaceVariant: "#444444",
    outline: "#000000", // Black borders
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FFFFFF",
      level3: "#FFFFFF",
      level4: "#FFFFFF",
      level5: "#FFFFFF",
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // We would ideally load a custom font here, but for now we'll rely on weight
  },
  roundness: 0, // Sharp corners for Brutalist feel
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: "#64B5F6", // Muted Light Blue
    onPrimary: "#000000",
    primaryContainer: "#000000",
    onPrimaryContainer: "#64B5F6",
    secondary: "#FFFFFF",
    onSecondary: "#000000",
    secondaryContainer: "#333333",
    onSecondaryContainer: "#FFFFFF",
    tertiary: "#FF4500",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#521400",
    onTertiaryContainer: "#FFDCCF",
    background: "#000000", // True Black
    surface: "#121212",
    surfaceVariant: "#333333",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#CCCCCC",
    outline: "#FFFFFF", // White borders
    elevation: {
      level0: "transparent",
      level1: "#121212",
      level2: "#121212",
      level3: "#121212",
      level4: "#121212",
      level5: "#121212",
    },
  },
  fonts: MD3DarkTheme.fonts,
  roundness: 0,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme as any}>
          <ThemeProvider value={theme as any}>
            <WorkoutProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="exercise/[id]"
                  options={{ title: "Record Workout" }}
                />
                <Stack.Screen
                  name="plan/editor"
                  options={{ title: "Plan Editor", headerBackTitle: "Plans" }}
                />
                <Stack.Screen
                  name="workout/[id]"
                  options={{
                    title: "Workout Session",
                    headerBackTitle: "Exercises",
                  }}
                />
              </Stack>
            </WorkoutProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
