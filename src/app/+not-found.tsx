import { useCallback } from "react";
import { ToastAndroid } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

export default function InvalidLink() {
	const router = useRouter();

	useFocusEffect(useCallback(() => {
		ToastAndroid.show("Invalid link", 1000);
		setTimeout(() => router.navigate("/"), 500);
	},[]));
}
