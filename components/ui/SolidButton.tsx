import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

interface SolidButtonProps {
  onPress: () => void;
  children: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  mode?: "primary" | "secondary" | "outline";
}

export function SolidButton({
  onPress,
  children,
  style,
  contentStyle,
  labelStyle,
  icon,
  loading,
  disabled,
  mode = "primary",
}: SolidButtonProps) {
  const theme = useTheme();

  let backgroundColor = theme.colors.primary;
  let textColor = theme.colors.onPrimary;
  let borderWidth = 0;
  let borderColor = "transparent";

  if (mode === "secondary") {
    backgroundColor = theme.colors.secondaryContainer;
    textColor = theme.colors.onSecondaryContainer;
  } else if (mode === "outline") {
    backgroundColor = "transparent";
    textColor = theme.colors.onSurface;
    borderWidth = 2;
    borderColor = theme.colors.outline;
  }

  if (disabled) {
    backgroundColor = theme.colors.surfaceVariant;
    textColor = theme.colors.onSurfaceVariant;
    borderColor = "transparent";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: theme.roundness,
        },
        style,
      ]}
      disabled={disabled || loading}
    >
      <View style={[styles.content, contentStyle]}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon}
            <Text
              variant="labelLarge"
              style={[styles.label, { color: textColor }, labelStyle]}
            >
              {children.toUpperCase()}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  label: {
    fontWeight: "900", // Extra bold
    letterSpacing: 1,
    fontSize: 14,
  },
});
