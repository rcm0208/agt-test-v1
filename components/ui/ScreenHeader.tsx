import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="displaySmall"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.secondary }]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60, // More top padding
    paddingBottom: 32,
  },
  title: {
    fontWeight: "900", // Black weight
    fontSize: 42, // Massive
    lineHeight: 48,
    letterSpacing: -1,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
