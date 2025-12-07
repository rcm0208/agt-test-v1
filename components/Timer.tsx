import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import {
    Button,
    IconButton,
    ProgressBar,
    Text,
    useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TimerProps {
  initialDuration?: number; // in seconds
  onFinish?: () => void;
  boundaries?: {
    width: number;
    height: number;
    top?: number;
    bottom?: number;
  };
}

export const Timer = React.forwardRef<
  { start: (duration: number) => void },
  TimerProps
>(({ onFinish, initialDuration, boundaries }, ref) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();

  // effective constraints
  const boundaryWidth = boundaries?.width ?? window.width;
  const boundaryHeight = boundaries?.height ?? window.height;
  const boundaryTop = boundaries?.top ?? insets.top;
  const boundaryBottom = boundaries?.bottom ?? insets.bottom;

  // Calculate explicit width for the card to ensure layout consistency
  const desiredWidth = Math.min(380, boundaryWidth * 0.9);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [cardSize, setCardSize] = useState({ width: desiredWidth, height: 0 });
  const [initialized, setInitialized] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const dragStart = useRef({ x: 0, y: 0 });

  const clampPosition = useCallback(
    (x: number, y: number) => {
      // Use constrained width if available, fallback to desiredWidth
      const effectiveWidth = cardSize.width || desiredWidth;
      const effectiveHeight = cardSize.height || 140;
      const halfW = effectiveWidth / 2;
      const halfH = effectiveHeight / 2;

      // Increased margin to account for shadows and ensure it stays onscreen
      const margin = 24;

      const minX = margin + halfW;
      const maxX = boundaryWidth - margin - halfW;

      const minY = boundaryTop + margin + halfH;
      const maxY = boundaryHeight - boundaryBottom - margin - halfH;

      const clampedCenterX = Math.min(
        Math.max(x + halfW, minX),
        Math.max(minX, maxX)
      );
      const clampedCenterY = Math.min(
        Math.max(y + halfH, minY),
        Math.max(minY, maxY)
      );

      return {
        x: clampedCenterX - halfW,
        y: clampedCenterY - halfH,
      };
    },
    [
      cardSize.height,
      cardSize.width,
      desiredWidth,
      boundaryHeight,
      boundaryWidth,
      boundaryTop,
      boundaryBottom,
    ]
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
    if (initialized) return;
    // Initial center position
    const centeredX = (boundaryWidth - desiredWidth) / 2;
    const startY = boundaryTop + 24; // Increased top margin for initial placement
    const { x, y } = clampPosition(centeredX, startY);
    position.setValue({ x, y });
    setInitialized(true);
  }, [
    desiredWidth,
    boundaryWidth,
    boundaryTop,
    position,
    initialized,
    clampPosition,
  ]);

  // Re-clamp when boundaries change
  useEffect(() => {
    if (!initialized) return;
    const current = getPositionValue();
    const { x, y } = clampPosition(current.x ?? 0, current.y ?? 0);
    position.setValue({ x, y });
  }, [
    boundaryWidth,
    boundaryHeight,
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
        position.stopAnimation();
        const clamped = clampPosition(current.x, current.y);
        dragStart.current = clamped;
        position.setValue(clamped);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const next = clampPosition(
          dragStart.current.x + gestureState.dx,
          dragStart.current.y + gestureState.dy
        );
        position.setValue(next);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const target = clampPosition(
          dragStart.current.x + gestureState.dx,
          dragStart.current.y + gestureState.dy
        );
        Animated.spring(position, {
          toValue: target,
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
          width: desiredWidth,
          transform: position.getTranslateTransform(),
          backgroundColor: theme.dark
            ? theme.colors.elevation.level3
            : theme.colors.surface,
          shadowColor: "#000",
          shadowOpacity: theme.dark ? 0.5 : 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12, // Higher elevation for "Rich" feel
          borderColor: theme.dark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)", // Subtle border for Light mode sharpness
          borderWidth: 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Text
            variant="displayMedium"
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
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        </View>

        <View style={styles.controls}>
          <IconButton
            icon="minus"
            size={24}
            mode={theme.dark ? "outlined" : "contained-tonal"}
            onPress={() => setTimeLeft((prev) => Math.max(0, prev - 10))}
            iconColor={theme.colors.onSurface}
            style={styles.iconButton}
          />
          <Button
            mode="text"
            onPress={() => {
              setIsActive(false);
              setTimeLeft(0);
              if (onFinish) onFinish();
            }}
            contentStyle={{ height: 48 }}
            labelStyle={styles.skipLabel}
            textColor={theme.colors.onSurfaceVariant}
          >
            Skip
          </Button>
          <IconButton
            icon="plus"
            size={24}
            mode={theme.dark ? "outlined" : "contained-tonal"}
            onPress={() => setTimeLeft((prev) => prev + 10)}
            iconColor={theme.colors.onSurface}
            style={styles.iconButton}
          />
        </View>
      </View>
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
    borderRadius: 28, // More rounded for modern look
  },
  content: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  timeContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    marginBottom: 16,
    fontWeight: "800", // Thicker for "Rich" feel
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 999,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  iconButton: {
    margin: 0,
  },
  skipLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
