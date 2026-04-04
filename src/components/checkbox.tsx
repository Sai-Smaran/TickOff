import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import color from "@/constants/colors";

type CheckBoxProps = {
	checked: boolean;
	onPress?: () => void;
	additionalStyles?: StyleProp<ViewStyle>;
	disabled?: boolean;
};

export default function CheckBox({
	checked: completed,
	onPress,
	additionalStyles,
	disabled,
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
				"RGB",
			),
		};
	}, []);

	const gesture = Gesture.Tap()
		.onBegin(() => {
			if (!disabled) {
				// scale.value = withTiming(0.75, { duration: 125 });
			}
		})
		.onFinalize(() => {
			if (!disabled) {
				colour.value = withTiming(completed ? 1 : 0, { duration: 200 });
				// scale.value = withTiming(1, {
					// duration: 175,
					// easing: Easing.in(Easing.cubic),
				// });

				onPress !== undefined && scheduleOnRN(onPress);
			}
		});

	return (
		<Pressable renderToHardwareTextureAndroid>
			<GestureDetector gesture={gesture}>
				<Animated.View
					style={[styles.container, additionalStyles, !disabled && anStyle]}
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
		// filter: "drop-shadow(0px 0px 10px black);",
	},
});
