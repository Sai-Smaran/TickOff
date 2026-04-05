import { memo, useEffect, useState } from "react";
import { Text, StyleSheet, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
	withDelay,
	useSharedValue,
	SharedValue,
} from "react-native-reanimated";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SubTask from "./subTask";
import CheckBox from "../components/checkbox";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import color from "../constants/colors";
import type { TaskItem } from "@/types";
import { scheduleOnRN } from "react-native-worklets";

type TaskTypes = {
	mainTask: TaskItem;
	onPress: ({ title, completed, subTasks }: TaskItem) => void;
	onDelete: () => void;
	index: number;
	onCheck: ({ title, completed, subTasks }: TaskItem) => void;
	onShare: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Task({ mainTask, onPress, onDelete, onCheck, onShare }: TaskTypes) {
	const [selected, setSelected] = useState<boolean | null>(false);
	const [completed, setCompleted] = useState(mainTask.completed);
	const [subTasks, setSubTask] = useState(mainTask.subTasks);
	const taskHeight = useSharedValue(75);
	const opacity = useSharedValue(1);

	useEffect(() => {
		setSubTask(mainTask.subTasks);
	}, [mainTask]);

	useEffect(() => {
		onCheck({
			title: mainTask.title,
			completed,
			subTasks,
		});

		if (subTasks === undefined || subTasks.length === 0) {
			setSelected(false);
		}
	}, [completed, subTasks]);

	/*
		The sheer number of @ts-ignore here is just embarrasing.
		but there is no other choice to shut the TypeScript warnings
		Poor TS doesn't know that the subTasks checks will never run
		because the button that runs the subTasks array check, will be hidden when there are no sub tasks.
	*/

	const anStyle = useAnimatedStyle(() => {
		taskHeight.value = withTiming(
			selected === true
				? //@ts-ignore
					subTasks.length * 75 + 90
				: selected === false
					? 75
					: 0,
			{
				duration: 100,
			},
		);

		opacity.value = withTiming(selected === null ? 0 : 1, { duration: 100 });
		return {
			//@ts-ignore
			height: taskHeight.value,
			opacity: opacity.value,
			marginTop: withTiming(selected !== null ? 10 : 0, { duration: 100 }),
			marginBottom: withTiming(selected !== null ? 10 : 0, { duration: 100 }),
		};
	}, [selected]);

	const dropdownAn = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: withDelay(
						100,
						withTiming(selected ? "180deg" : "0deg", { duration: 150 }),
					),
				},
			],
		};
	}, [selected]);

	const subTasksAn = useAnimatedStyle(() => {
		return {
			opacity: withDelay(150, withTiming(selected ? 1 : 0, { duration: 100 })),
		};
	}, [selected]);

	const handleSubTaskToggle = (id: number): void => {
		// "Man, I hate AI."
		// *Proceeds to use AI to write the following abysmal code:*
		setSubTask((prev) =>
			prev?.map((subTask, index) =>
				index === id ? { ...subTask, completed: !subTask.completed } : subTask,
			),
		);
	};

	return (
		<Swipeable
			onSwipeableOpenStartDrag={() => setSelected(false)}
			renderRightActions={(p, x) => {
				return (
					<RightAction
						_dragX={x}
						_progress={p}
						onDelete={() => {
							setSelected(null);
							scheduleOnRN(onDelete);
						}}
						onShare={() => scheduleOnRN(onShare)}
					/>
				);
			}}
		>
			<Animated.View style={[styles.main, anStyle]}>
				<Pressable
					onPress={() => {
						onPress(mainTask);
					}}
					style={{
						width: "100%",
						height: 75,
						flexDirection: "row",
						justifyContent: "space-between",
					}}
				>
					<CheckBox
						onPress={() => setCompleted((prev) => !prev)}
						checked={completed}
					/>
					<Text
						style={styles.title}
						numberOfLines={2}
						textBreakStrategy="highQuality"
					>
						{mainTask.title}
					</Text>
					{subTasks && subTasks.length > 0 ? (
						<AnimatedPressable
							hitSlop={25}
							style={[styles.dropdown, dropdownAn]}
							onPress={() => {
								setSelected((p) => !p);
							}}
							renderToHardwareTextureAndroid
						>
							<AntDesign name="down" color={color.ter} size={25} />
						</AnimatedPressable>
					) : null}
				</Pressable>
				{selected && subTasks ? (
					<Animated.View style={[{ margin: 20, marginTop: 5 }, subTasksAn]}>
						{/* @ts-ignore */}
						{subTasks.map((item, idx) => {
							return (
								<SubTask
									title={item.title}
									completed={item.completed}
									//@ts-ignore
									subTask={mainTask?.subTasks}
									key={idx}
									id={idx}
									onToggle={handleSubTaskToggle}
								/>
							);
						})}
					</Animated.View>
				) : null}
			</Animated.View>
		</Swipeable>
	);
}

const styles = StyleSheet.create({
	main: {
		backgroundColor: color.sec,
		borderRadius: 10,
		marginLeft: 10,
		marginRight: 10,
	},
	title: {
		paddingTop: 10,
		paddingBottom: 10,
		flex: 1,
		color: color.font,
		fontSize: 20,
		fontWeight: "bold",
		textAlignVertical: "center",
	},
	dropdown: {
		justifyContent: "center",
		alignItems: "center",
		marginRight: 25,
	},
});

function RightAction({
	_progress,
	_dragX,
	onDelete,
	onShare,
}: {
	_progress: SharedValue<number>;
	_dragX: SharedValue<number>;
	onDelete: () => void;
	onShare: () => void;
}) {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: -_dragX.value,
			right: -(_progress.value * 100) + 100,
		};
	}, [_progress]);

	return (
		<View
			style={{
				width: 150,
				height: 100,
			}}
		>
			<Animated.View
				style={[
					{
						height: 100,
						justifyContent: "space-evenly",
						alignItems: "center",
						flexDirection: "row",
					},
					animatedStyle,
				]}
			>
				<AnimatedPressable
					style={[
						{
							backgroundColor: color.ter,
							borderRadius: 50,
							width: 50,
							aspectRatio: 1,
							padding: 10,
							justifyContent: "center",
							alignItems: "center",
						},
					]}
					hitSlop={10}
					onPress={onShare}
				>
					<MaterialIcons name="share" color={color.font} size={25} />
				</AnimatedPressable>
				<AnimatedPressable
					style={[
						{
							backgroundColor: "red",
							borderRadius: 50,
							width: 50,
							aspectRatio: 1,
							padding: 10,
							justifyContent: "center",
							alignItems: "center",
						},
					]}
					hitSlop={10}
					onPress={onDelete}
				>
					<MaterialIcons name="delete" color={color.font} size={25} />
				</AnimatedPressable>
			</Animated.View>
		</View>
	);
}

export default memo(Task);
