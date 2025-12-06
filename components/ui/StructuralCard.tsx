import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Card, useTheme } from "react-native-paper";

interface StructuralCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  active?: boolean;
  bordered?: boolean;
}

export function StructuralCard({
  children,
  style,
  contentStyle,
  onPress,
  active,
  bordered = true,
}: StructuralCardProps) {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: bordered ? 2 : 0,
        },
        style,
      ]}
      onPress={onPress}
      mode="contained" // We handle borders manually
    >
      <Card.Content style={[styles.content, contentStyle]}>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0, // Sharp corners
    marginBottom: 16,
    elevation: 0, // Flat
  },
  content: {
    padding: 16,
  },
});
