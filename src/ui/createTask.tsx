import { useRef, useState } from "react";
import {
	View,
	Text,
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CheckBox from "../components/checkbox";
import color from "../constants/colors";
import { TaskItem } from "@/types";
import { BlurView } from "expo-blur";

type createTaskProps = {
	visibility?: boolean;
	onRequestClose: () => void;
	onSubmitEditing: (
		index: number | undefined,
		{
			title,
			completed,
			subTasks,
		}: {
			title: string;
			completed: boolean;
			subTasks?: { title: string; completed: boolean }[];
		},
	) => void;
	taskToEdit?: number;
	tasks: TaskItem[] | undefined;
};

export default function CreateTask({
	visibility,
	onRequestClose,
	onSubmitEditing,
	taskToEdit,
	tasks,
}: createTaskProps) {
	const [title, setTitle] = useState("");
	const [subTasks, setSubTasks] = useState<
		{ title: string; completed: boolean }[] | undefined
	>();
	const inputRef = useRef<TextInput>(null);

	return (
		<Modal
			visible={visibility}
			onRequestClose={() => {
				setTitle("");
				setSubTasks(undefined);
				onRequestClose();
			}}
			animationType="fade"
			transparent
			hardwareAccelerated
			onShow={() => {
				// console.log("[CreateTask] -> editing task of index", taskToEdit);
				// console.log("[CreateTask] ->", tasks !== undefined && taskToEdit !== undefined ? tasks[taskToEdit].title : null);
				// console.log("[CreateTask] ->","Title: "+ title,"Sub-tasks: "+ subTasks);
				setTimeout(() => inputRef.current?.focus(), 50);

				if (taskToEdit !== undefined) {
					const loadedTitle =
						tasks !== undefined && taskToEdit !== undefined
							? tasks[taskToEdit].title
							: "";
					const loadedSubTasks =
						tasks !== undefined && taskToEdit !== undefined
							? tasks[taskToEdit].subTasks
							: undefined;

					setTitle(loadedTitle);
					setSubTasks(loadedSubTasks);
				}
			}}
		>
			<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Pressable
						onPress={() => {
							onRequestClose();
							setTitle("");
							setSubTasks(undefined);
						}}
						style={styles.background}
					>
						<BlurView
							experimentalBlurMethod="dimezisBlurView"
							tint="systemMaterialDark"
							style={{ width: "100%", height: "100%" }}
						/>
					</Pressable>

					<ScrollView style={styles.popup}>
						<View style={{ flexDirection: "row", width: "100%" }}>
							<TextInput
								style={[
									styles.textinput,
									{ margin: 20, marginBottom: 0, fontWeight: "bold" },
								]}
								numberOfLines={2}
								multiline
								cursorColor={color.font}
								submitBehavior="submit"
								selectionHandleColor={color.ter}
								onChangeText={(text) => setTitle(text)}
								enterKeyHint="enter"
								textBreakStrategy="highQuality"
								value={title}
								placeholderTextColor={color.font}
								//@ts-ignore
								color={color.font}
								maxLength={50}
								onSubmitEditing={() => {
									if (title !== "") {
										setSubTasks((prev) =>
											prev
												? [...prev, { title: "", completed: false }]
												: [{ title: "", completed: false }],
										);
									}
								}}
								ref={inputRef}
							/>
						</View>
						<View style={{ margin: 20, marginTop: 5 }}>
							{subTasks?.map((task, idx) => {
								return (
									<View
										key={idx}
										style={{
											flexDirection: "row",
											width: "100%",
											marginTop: 10,
										}}
									>
										<View style={{ padding: 17 }}>
											<CheckBox
												checked={task.completed}
												onPress={() => {
													setSubTasks((prev) =>
														prev
															? prev.map((sTask, id) =>
																	id === idx
																		? { ...sTask, completed: !sTask.completed }
																		: sTask,
																)
															: undefined,
													);
												}}
												additionalStyles={{ margin: 10 }}
											/>
										</View>
										<TextInput
											style={styles.textinput}
											multiline
											numberOfLines={3}
											cursorColor={color.font}
											enterKeyHint="enter"
											submitBehavior="submit"
											//@ts-ignore
											color={color.font}
											selectionHandleColor={color.ter}
											autoFocus
											value={task.title}
											maxLength={60}
											textBreakStrategy="highQuality"
											onChangeText={(text) => {
												setSubTasks((pre) =>
													pre
														? pre.map((sTask, id) =>
																id === idx ? { ...task, title: text } : sTask,
															)
														: undefined,
												);
											}}
											onEndEditing={() => {
												if (task.title.length === 0) {
													setSubTasks([
														...subTasks.slice(0, idx),
														...subTasks.slice(idx + 1),
													]);
												}
											}}
											onSubmitEditing={() => {
												if (task.title !== "") {
													setSubTasks((prev) =>
														prev
															? [...prev, { title: "", completed: false }]
															: [{ title: "", completed: false }],
													);
												}
											}}
										/>
									</View>
								);
							})}
						</View>
						<TouchableOpacity
							onPress={async () => {
								if (title?.length !== 0) {
									const editedTask =
										subTasks !== undefined
											? {
													title,
													subTasks: subTasks,
													completed: false,
												}
											: { title, completed: false };

									onSubmitEditing(taskToEdit, editedTask);

									// Cleanup
									setTitle("");
									setSubTasks(undefined);
								}
							}}
							hitSlop={25}
							style={{
								padding: 10,
								flexDirection: "row-reverse",
							}}
						>
							<Text style={styles.doneTxt}>Done</Text>
						</TouchableOpacity>
					</ScrollView>
				</GestureHandlerRootView>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	background: { flex: 1 },
	popup: {
		position: "absolute",
		bottom: 0,
		width: "90%",
		padding: 10,
		margin: "5%",
		backgroundColor: color.pri,
		borderRadius: 10,
		boxShadow: "0px 0px 10px 0px black",
		maxHeight: 500,
	},
	checkbox: {
		width: 25,
		height: 25,
		borderWidth: 2,
		margin: 17,
		borderColor: color.ter,
		borderRadius: 5,
	},
	textinput: {
		flex: 1,
		fontSize: 20,
	},
	doneTxt: {
		color: color.ter,
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		textAlignVertical: "center",
	},
});
