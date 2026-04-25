import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { BlurView } from "expo-blur";
import { AntDesign } from "@expo/vector-icons";

import type { MinifiedTaskItem } from "@/types";

import CheckBox from "@/components/checkbox";
import color from "@/constants/colors";

type SharedTaskPromptTypes = {
	visible: boolean;
	taskToAdd: MinifiedTaskItem;
	onRequestClose: () => void;
	onAccept: () => void;
};

export function SharedTaskPrompt({
	visible,
	taskToAdd,
	onRequestClose,
	onAccept,
}: SharedTaskPromptTypes) {
	return (
		<Modal
			visible={visible}
			onRequestClose={() => onRequestClose()}
			animationType="fade"
			transparent
			hardwareAccelerated
			statusBarTranslucent
			navigationBarTranslucent
		>
			<Pressable onPress={() => onRequestClose()} style={{ flex: 1 }}>
				<BlurView
					blurMethod="none"
					tint="systemMaterialDark"
					style={{ flex: 1 }}
				/>
			</Pressable>
			<View
				style={[
					StyleSheet.absoluteFill,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<View style={styles.popupContainer}>
					<Pressable
						style={styles.closeButton}
						onPress={() => onRequestClose()}
						hitSlop={50}
					>
						<AntDesign name="close" size={25} color={color.ter} />
					</Pressable>
					<Text style={styles.title}>Add task</Text>
					<Text style={styles.subTitle}>
						You just recieved a task from a link
					</Text>
					<ScrollView
						style={[
							styles.taskScrollView,
							{
								maxHeight: Math.min(
									Array.isArray(taskToAdd.s)
										? taskToAdd.s.length * 100 + 115
										: 100,
									250
								),
							},
						]}
						contentContainerStyle={styles.taskScrollViewContainer}
					>
						<View style={styles.taskBody}>
							<View style={styles.taskTitleBody}>
								<CheckBox checked={taskToAdd.c} disabled />
								<Text
									style={styles.taskTitle}
									ellipsizeMode="tail"
									numberOfLines={3}
									textBreakStrategy="highQuality"
								>
									{taskToAdd.t}
								</Text>
							</View>
							<View style={{ margin: 20, marginTop: 5 }}>
								{Array.isArray(taskToAdd.s) &&
									taskToAdd.s.map((val, index) => (
										<View style={styles.subTaskBody} key={index.toString()}>
											<CheckBox
												checked={val.c}
												disabled
												additionalStyles={{ alignSelf: "center", margin: 20 }}
											/>
											<Text
												style={styles.subTaskTitle}
												ellipsizeMode="tail"
												numberOfLines={3}
												textBreakStrategy="highQuality"
											>
												{val.t}
											</Text>
										</View>
									))}
							</View>
						</View>
					</ScrollView>
					<Pressable onPress={onAccept} style={styles.acceptButton}>
						<Text style={styles.acceptButtonText}>Add task</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	popupContainer: {
		backgroundColor: color.pri,
		padding: 20,
		borderRadius: 20,
		boxShadow: "0px 0px 25px black",
	},
	closeButton: { position: "absolute", top: 0, right: 0, margin: 20 },
	title: {
		fontSize: 30,
		fontWeight: "bold",
		textAlign: "center",
		color: color.ter,
		padding: 20,
	},
	subTitle: {
		fontWeight: "300",
		textAlign: "center",
		color: color.font,
		margin: 20,
	},
	taskScrollView: {
		backgroundColor: "black",
		margin: 20,
		boxShadow: `0px 0px 25px ${color.pri} inset`,
	},
	taskScrollViewContainer: {
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	taskBody: {
		backgroundColor: color.sec,
		borderRadius: 10,
	},
	taskTitleBody: {
		width: "100%",
		height: 75,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	taskTitle: {
		paddingTop: 10,
		paddingBottom: 10,
		flex: 1,
		color: color.font,
		fontSize: 20,
		fontWeight: "bold",
		textAlignVertical: "center",
	},
	subTaskBody: {
		height: 75,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	subTaskTitle: {
		paddingTop: 10,
		paddingBottom: 10,
		flex: 1,
		color: color.font,
		fontSize: 18,
		fontWeight: "300",
		textAlignVertical: "center",
	},
	dropdown: {
		justifyContent: "center",
		alignItems: "center",
		marginRight: 25,
	},
	acceptButton: {
		backgroundColor: color.sec,
		boxShadow: "0px 0px 15px black",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
	},
	acceptButtonText: {
		color: color.ter,
		padding: 20,
		fontSize: 20,
		fontWeight: "bold",
	},
});
