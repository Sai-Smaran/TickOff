import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import color from "../constants/colors";

type CheckBoxProps = {
  checked: boolean;
  onPress: () => void;
  additionalStyles?: StyleProp<ViewStyle>;
};

export default function CheckBox({
  checked: completed,
  onPress,
  additionalStyles,
}: CheckBoxProps) {
  const scale = useSharedValue(1);
  const colour = useSharedValue(completed ? 0 : 1);

  const anStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        colour.value,
        [0, 1],
        [color.ter, "transparent"],
        "RGB"
      ),
    };
  }, [scale, colour]);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.75, { duration: 125 });
    })
    .onFinalize(() => {
      colour.value = withTiming(completed ? 1 : 0, { duration: 200 });
      scale.value = withTiming(1, {
        duration: 175,
        easing: Easing.in(Easing.cubic),
      });

      runOnJS(onPress)();
    });

  return (
    <Pressable>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.container, additionalStyles, anStyle]}
          hitSlop={25}
        >
          {completed && <FontAwesome6 name="check" size={15} />}
        </Animated.View>
      </GestureDetector>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 25,
    height: 25,
    margin: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 5,
    borderColor: color.ter,
    filter: "drop-shadow(0px 0px 10px black);",
  },
});
