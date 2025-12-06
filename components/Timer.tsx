import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, ProgressBar, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TimerProps {
  initialDuration?: number; // in seconds
  onFinish?: () => void;
}

export const Timer = React.forwardRef<
  { start: (duration: number) => void },
  TimerProps
>(({ onFinish, initialDuration }, ref) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [initialized, setInitialized] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  const clampPosition = useCallback(
    (x: number, y: number) => {
      const maxX = Math.max(12, width - cardSize.width - 12);
      const maxY = Math.max(insets.top + 12, height - cardSize.height - 12);

      return {
        x: Math.min(Math.max(x, 12), maxX),
        y: Math.min(Math.max(y, insets.top + 12), maxY),
      };
    },
    [cardSize.height, cardSize.width, height, insets.top, width]
  );

  const getPositionValue = useCallback(
    () => (position as any).__getValue() as { x: number; y: number },
    [position]
  );

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
    if (!cardSize.width || initialized) return;
    const centeredX = (width - cardSize.width) / 2;
    const startY = insets.top + 12;
    const { x, y } = clampPosition(centeredX, startY);
    position.setValue({ x, y });
    setInitialized(true);
  }, [cardSize, width, insets.top, position, initialized, clampPosition]);

  useEffect(() => {
    if (!cardSize.width || !initialized) return;
    const current = getPositionValue();
    const { x, y } = clampPosition(current.x ?? 0, current.y ?? 0);
    position.setValue({ x, y });
  }, [
    width,
    height,
    cardSize,
    initialized,
    position,
    clampPosition,
    getPositionValue,
  ]);

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const current = getPositionValue();
        position.setOffset(current);
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
        const current = getPositionValue();
        const { x, y } = clampPosition(current.x, current.y);
        Animated.spring(position, {
          toValue: { x, y },
          useNativeDriver: false,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  if (!isActive && timeLeft === 0) return null;

  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  return (
    <Animated.View
      onLayout={(e) =>
        setCardSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
      style={[
        styles.container,
        {
          transform: position.getTranslateTransform(),
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={[
          theme.colors.surfaceVariant || "#2c2c2c",
          theme.colors.primaryContainer || theme.colors.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text
          variant="headlineSmall"
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
          color={theme.colors.onSurface}
          style={styles.progressBar}
        />
        <View style={styles.controls}>
          <Button
            mode="outlined"
            onPress={() => setTimeLeft((prev) => Math.max(0, prev - 10))}
            style={styles.button}
            contentStyle={{ height: 38, paddingHorizontal: 8 }}
            labelStyle={styles.buttonLabel}
            textColor={theme.colors.onSurface}
            rippleColor="rgba(0,0,0,0.12)"
          >
            -10
          </Button>
          <Button
            mode="contained-tonal"
            onPress={() => {
              setIsActive(false);
              setTimeLeft(0);
              if (onFinish) onFinish();
            }}
            style={styles.button}
            contentStyle={{ height: 38, paddingHorizontal: 8 }}
            labelStyle={styles.buttonLabel}
            buttonColor="rgba(0,0,0,0.08)"
            textColor={theme.colors.onSurface}
          >
            Skip
          </Button>
          <Button
            mode="outlined"
            onPress={() => setTimeLeft((prev) => prev + 10)}
            style={styles.button}
            contentStyle={{ height: 38, paddingHorizontal: 8 }}
            labelStyle={styles.buttonLabel}
            textColor={theme.colors.onSurface}
            rippleColor="rgba(0,0,0,0.12)"
          >
            +10
          </Button>
        </View>
      </LinearGradient>
    </Animated.View>
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
    position: "absolute",
    zIndex: 20,
    alignItems: "center",
    borderRadius: 24,
  },
  gradient: {
    width: "90%",
    maxWidth: 380,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  timerText: {
    marginBottom: 12,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
    fontSize: 24,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    marginBottom: 10,
    backgroundColor: "#E0E0E0",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    flexWrap: "nowrap",
    alignItems: "center",
  },
  button: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
  },
  buttonLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
});
