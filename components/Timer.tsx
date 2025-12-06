import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, ProgressBar, Text, useTheme } from "react-native-paper";

interface TimerProps {
  initialDuration?: number; // in seconds
  onFinish?: () => void;
}

export const Timer = React.forwardRef<
  { start: (duration: number) => void },
  TimerProps
>(({ onFinish, initialDuration }, ref) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  React.useImperativeHandle(ref, () => ({
    start: (duration: number) => {
      setTotalDuration(duration);
      setTimeLeft(duration);
      setIsActive(true);
    },
  }));

  useEffect(() => {
    if (initialDuration && initialDuration > 0) {
      setTotalDuration(initialDuration);
      setTimeLeft(initialDuration);
      setIsActive(true);
    }
  }, [initialDuration]);

  useEffect(() => {
    let interval: any;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onFinish) onFinish();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFinish]);

  if (!isActive && timeLeft === 0) return null;

  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.elevation?.level2 || theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text
        variant="displaySmall"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.timerText,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        {formatTime(timeLeft)}
      </Text>
      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      <View style={styles.controls}>
        <Button
          mode="outlined"
          onPress={() => setTimeLeft((prev) => Math.max(0, prev - 10))}
          style={styles.button}
          contentStyle={{ height: 48 }}
          textColor={theme.colors.onSurface}
        >
          -10s
        </Button>
        <Button
          mode="outlined"
          onPress={() => setTimeLeft((prev) => prev + 10)}
          style={styles.button}
          contentStyle={{ height: 48 }}
          textColor={theme.colors.onSurface}
        >
          +10s
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            setIsActive(false);
            setTimeLeft(0);
            if (onFinish) onFinish();
          }}
          style={styles.button}
          contentStyle={{ height: 48 }}
        >
          Skip
        </Button>
      </View>
    </View>
  );
});
Timer.displayName = "Timer";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 520,
    padding: 16,
    borderRadius: 16,
  },
  timerText: {
    marginBottom: 16,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
    fontSize: 40,
  },
  progressBar: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    marginBottom: 24,
    backgroundColor: "#E0E0E0",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 100,
    borderRadius: 12,
  },
});
