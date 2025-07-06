import "expo-dev-client";
import { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "./components/button";
import color from "./constants/colors";
import Task from "./ui/task";
import CreateTask from "./ui/createTask";
import NoTasks from "./ui/NoTasks";

// Anyone knows how to cut down on these imports?
// Oh wait, it's just me here, alone...

import { ExpoDevMenuItem, registerDevMenuItems } from "expo-dev-menu";
import AsyncStorage, { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useAsyncStorageDevTools } from "@dev-plugins/async-storage";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	fade: true,
	duration: 250,
});

export type TaskItem = {
	title: string;
	completed: boolean;
	subTasks?: {
		title: string;
		completed: boolean;
	}[]
}

export default function App() {
	useAsyncStorageDevTools({ errorHandler: (e) => { console.log("[App.js] -> Error:", e) } });

	const { getItem, removeItem, setItem } = useAsyncStorage("tasks");
	const [loaded, setLoaded] = useState(false);
	const [tasks, setTasks] = useState<TaskItem[] | undefined>(undefined);
	const [taskToEdit, setTaskToEdit] = useState<number | undefined>();
	const [creationModalVisible, setCreationModalVisible] = useState(false);

	async function fetchTasks() {
		await getItem().then((e) => {
			if (e !== null) {
				setTasks(JSON.parse(e));
			}
			setLoaded(true);
		}).catch((err) => console.log("[App.tsx] -> Something went wrong: ", err))
	}

	async function saveTasks() {
		await setItem(JSON.stringify(tasks));
	}

	function createTask(t: TaskItem) {
		setTasks(() => tasks ? [...tasks, t] : [t]);
	}

	function updateTask(id: number, replacement: TaskItem) {
		setTasks(prevTasks => prevTasks?.map((prev, idx) => id === idx ? replacement : prev))
	}

	function deleteTask(id: number) {
		setTasks((prevTasks) => prevTasks?.filter((_, idx) => id !== idx));
	}

	useEffect(() => {
		fetchTasks();
	}, [])

	useEffect(() => {
		const devMenuItems: ExpoDevMenuItem[] = [
			{
				name: "Clear tasks",
				callback: () => {
					removeItem().then(() => console.log("Wiped local store successfully"));
					setTasks(undefined)
				},
				shouldCollapse: true,
			},
			{
				name: "Dump locally stored task list in logs",
				callback: () => {
					AsyncStorage.getItem("tasks").then((e) => console.log(e && JSON.parse(e)))
				},
				shouldCollapse: false,
			}, {
				name: "Dump state stored task list in logs",
				callback: () => {
					console.log(tasks);
				},
				shouldCollapse: false,
			},
			{
				name: "Generate 25 random tasks",
				callback: () => {
					const Arr = Array.from({ length: 25 }, () => {
						return {
							title: Math.random().toString(),
							completed: Math.random() > 0.5 ? true : false,
						}
					})
					setTasks(() => tasks !== undefined ? [...tasks, ...Arr] : [...Arr])
				},
				shouldCollapse: true,
			}
		];
		registerDevMenuItems(devMenuItems).then(() => console.log("Registered dev menu items successfully"));

		saveTasks();
	}, [tasks]);

	const RI = ({ item, index }: { item: any; index: number }) => {
		return (
			<Task
				mainTask={item}
				key={index}
				index={index}
				onPress={() => {
					setTaskToEdit(index);
					setCreationModalVisible(true);
				}}
				onDelete={() => {
					deleteTask(index);
				}}
				onCheck={(task) => { updateTask(index, task) }}
			/>
		);
	};

	const onLayoutRootView = useCallback(() => {
		if (loaded) {
			SplashScreen.hide();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		// <SafeAreaProvider initialMetrics={initialWindowMetrics}>
		<GestureHandlerRootView
			onLayout={onLayoutRootView}
			style={styles.container}
		>

			{/* this doohickey is to force the modal to rerender again so that the taskToEdit actually goes through */}

			{/* creationModalVisible  */}
			<CreateTask
				onRequestClose={() => {
					setCreationModalVisible(false);
					setTaskToEdit(() => undefined);
				}}
				visibility={creationModalVisible}
				onSubmitEditing={(i, newTask) => {
					if (i !== undefined) {
						updateTask(i, newTask);
					} else {
						createTask(newTask);
					}
					setCreationModalVisible(() => false);
					setTaskToEdit(() => undefined);
				}}
				taskToEdit={taskToEdit}
				tasks={tasks}
			/>

			<View style={{ flexGrow: 1 }}>
				<FlatList
					contentContainerStyle={{ flexGrow: 1 }}
					data={tasks}
					renderItem={RI}
					keyExtractor={(_, idx) => idx.toString()}
					ListEmptyComponent={NoTasks}
					ListHeaderComponent={ListHeader}
					ListHeaderComponentStyle={{ width: "100%" }}
					// StickyHeaderComponent={ListHeader}
					// stickyHeaderHiddenOnScroll
					stickyHeaderIndices={[0]}
				/>
			</View>
			<Button
				style={{
					position: "absolute",
					bottom: 0,
					right: 0,
					margin: 50,
				}}
				onPress={() => {
					setCreationModalVisible(true);
				}}
			/>

		</GestureHandlerRootView>
		// </SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: color.pri,
	},
});

function ListHeader() {
	return (
		<View style={{ padding: 30, experimental_backgroundImage: [{ type: "linearGradient", colorStops: [{ color: color.sec }, { color: "transparent" }] }] }}>
			<Text style={{ color: color.font, fontSize: 30, fontWeight: "100" }}>Tasks</Text>
		</View>
	)
}