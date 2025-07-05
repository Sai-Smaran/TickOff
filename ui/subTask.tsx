import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import color from "../constants/colors";
import CheckBox from "../components/checkbox";

export default function SubTask({
	title,
	completed,
	id: idx,
	onToggle,
}: {
	title: string;
	completed: boolean;
	id: number;
	onToggle: (id: number) => void;
}) {
	const [complete, setComplete] = useState(completed);

	const handlePress = () => {
		setComplete((prev) => !prev);
		onToggle(idx);
	};

	return (
		<View
			style={{
				width: "100%",
				height: 75,
				flexDirection: "row",
				justifyContent: "space-between",
				padding: 5,
			}}
		>
			<CheckBox
				onPress={handlePress}
				checked={complete}
				additionalStyles={{ alignSelf: "center", margin: 20 }}
			/>
			<Text
				style={styles.title}
				ellipsizeMode="tail"
				numberOfLines={3}
				textBreakStrategy="highQuality"
			>
				{title}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	title: {
		flex: 1,
		color: color.font,
		fontSize: 18,
		fontWeight: "500",
		textAlignVertical: "center",
	},
});
