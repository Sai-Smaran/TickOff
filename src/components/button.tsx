import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { FontAwesome6 } from "@expo/vector-icons";
import color from "../constants/colors";

export default function Button({
	style,
	onPress,
}: {
	style?: ViewStyle;
	onPress: () => void;
}) {
	const scale = useSharedValue(1);

	const anStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});

	const gesture = Gesture.Tap()
		.onBegin(() => {
			scale.value = withTiming(0.9, { duration: 100 });
		})
		.onFinalize(() => {
			scale.value = withSpring(1, {
				mass: 15,
				damping: 15,
				stiffness: 500,
				overshootClamping: false,
			});
			scheduleOnRN(onPress);
		});

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={[styles.buttonStyle, style, anStyle]} hitSlop={10}>
				<FontAwesome6 name="plus" size={40} color={color.font} />
			</Animated.View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	buttonStyle: {
		backgroundColor: color.sec,
		width: 75,
		height: 75,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		boxShadow: "0px 0px 10px 5px black",
	},
	textStyle: {
		color: color.quat,
		fontSize: 20,
		fontWeight: "bold",
	},
});
