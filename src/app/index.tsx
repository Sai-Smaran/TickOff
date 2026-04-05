import "expo-dev-client";
import { useCallback, useState, useMemo, memo } from "react";
import { registerRootComponent } from "expo";
import {
	ActivityIndicator,
	FlatList,
	Share,
	StyleSheet,
	Text,
	ToastAndroid,
	View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Base64 from "base-64";
import * as UTF8 from "utf8";

import Button from "@/components/button";
import color from "@/constants/colors";
import Task from "@/ui/task";
import CreateTask from "@/ui/createTask";
import NoTasks from "@/ui/NoTasks";

// Anyone knows how to cut down on these imports?
// Oh wait, it's just me here, alone...

import { ExpoDevMenuItem, registerDevMenuItems } from "expo-dev-menu";
import AsyncStorage, {
	useAsyncStorage,
} from "@react-native-async-storage/async-storage";
import {
	ExpoRoot,
	useFocusEffect,
	useLocalSearchParams,
	useRouter,
} from "expo-router";
import type { MinifiedTaskItem, TaskItem } from "@/types";
import { SharedTaskPrompt } from "@/ui/sharedTaskPrompt";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	fade: true,
	duration: 250,
});

export default function Index() {
	const router = useRouter();
	const { tasks: newSharedTasks } = useLocalSearchParams<{ tasks?: string }>();

	const { getItem, removeItem, setItem } = useAsyncStorage("tasks");
	const [loaded, setLoaded] = useState(false);
	const [tasks, setTasks] = useState<TaskItem[] | undefined>(undefined);
	const [taskToEdit, setTaskToEdit] = useState<number | undefined>();
	const [creationModalVisible, setCreationModalVisible] = useState(false);
	const [sharedTaskPromptVisible, setSharedTaskPromptVisible] = useState(false);
	const [URLsharedTask, setURLSharedTask] = useState<
		MinifiedTaskItem | undefined
	>();

	async function fetchTasks() {
		await getItem()
			.then((e) => {
				if (e !== null) {
					setTasks(() => JSON.parse(e));
				}
				setLoaded(true);
			})
			.catch((err) => console.log("[App.tsx] -> Something went wrong: ", err));
	}

	const saveTasks = useCallback(async () => {
		await setItem(JSON.stringify(tasks));
	}, [tasks]);

	function createTask(t?: TaskItem) {
		// t && setTasks(() => (tasks ? [...tasks, t] : [t]));
		t && setTasks(() => (tasks ? tasks.concat(t) : [t]));
	}

	function updateTask(id: number, replacement: TaskItem) {
		setTasks((prevTasks) =>
			prevTasks?.map((prev, idx) => (id === idx ? replacement : prev)),
		);
	}

	function deleteTask(id: number) {
		// setTasks((prevTasks) => prevTasks?.filter((_, idx) => id !== idx));
		setTasks((prevTasks) =>
			// Similar to [...prevTasks?.slice(0, id), ...prevTasks.slice(id + 1)]
			prevTasks?.slice(0, id).concat(prevTasks.slice(id + 1)),
		);
	}

	const parseTasks = useCallback((): MinifiedTaskItem | undefined => {
		// console.log("[parseTasks] ->",newSharedTasks);
		if (newSharedTasks === undefined || newSharedTasks === null) {
			return;
		}

		let decodedData: string;
		let sharedTask: MinifiedTaskItem;

		try {
			decodedData = Base64.decode(UTF8.decode(newSharedTasks));
			sharedTask = JSON.parse(decodedData);
		} catch (e) {
			console.warn(e);
			ToastAndroid.showWithGravity(
				"Unable to retrieve tasks from link.",
				ToastAndroid.LONG,
				1,
			);
			return;
		}

		// Making ABSOLUTELY sure that the data from the url is
		// actually according to the task structure
		if (typeof sharedTask.t === "string" && typeof sharedTask.c === "boolean") {
			if (sharedTask.s === undefined) {
				return sharedTask;
			} else if (Array.isArray(sharedTask.s)) {
				let subTasksValuationPassed = true;

				for (let i = 0, len = sharedTask.s.length; i < len; ++i) {
					if (
						!(
							typeof sharedTask.s[i].t === "string" &&
							typeof sharedTask.s[i].c === "boolean"
						)
					) {
						subTasksValuationPassed = false;
						break;
					}
				}
				if (subTasksValuationPassed) {
					return sharedTask;
				} else {
					ToastAndroid.showWithGravity(
						"Unable to retrieve tasks from link",
						ToastAndroid.LONG,
						1,
					);
				}
			} else {
				ToastAndroid.showWithGravity(
					"Unable to retrieve tasks from link",
					ToastAndroid.LONG,
					1,
				);
			}
		}

		router.setParams({ tasks: undefined });
	}, [newSharedTasks]);

	function handleTaskParams() {
		const newURLTasks = parseTasks();

		if (newURLTasks !== undefined) {
			setURLSharedTask(newURLTasks);
			setSharedTaskPromptVisible(true);
		}
	}

	const handleShare = ({ taskItem }: { taskItem: TaskItem }) => {
		console.log("Sharing");
		let subTasksMinified: { t: string; c: boolean }[] = [];
		const subTasks = taskItem.subTasks;

		// taskItem.subTasks?.forEach((val) => {
		// subTasksMinified.push({ t: val.title, c: val.completed });
		// });

		if (subTasks) {
			for (let i = 0, len = subTasks.length; i < len; i++) {
				subTasksMinified[i] = {
					t: subTasks[i].title,
					c: subTasks[i].completed,
				};
			}
		}

		let minifiedTask: MinifiedTaskItem = {
			t: taskItem.title,
			c: taskItem.completed,
			s: subTasksMinified,
		};
		const JSONTaskItem = JSON.stringify(minifiedTask);
		const encodedTaskItem = Base64.encode(UTF8.encode(JSONTaskItem));

		Share.share({
			message: "tickoff://?tasks=" + encodedTaskItem,
		});
	};

	const handleShareTaskConversion = (minifiedTask: MinifiedTaskItem) => {
		let restoredSubTasks: { title: string; completed: boolean }[] = [];
		const minifiedSubTask = minifiedTask.s;

		if (minifiedSubTask) {
			const minifiedSubTasklength = minifiedSubTask.length;

			for (let i = 0; i < minifiedSubTasklength; i++) {
				restoredSubTasks[i] = {
					title: minifiedSubTask[i].t,
					completed: minifiedSubTask[i].c,
				};
			}
		}

		// minifiedTask.s?.forEach((val) => {
		// restoredSubTasks.push({ title: val.t, completed: val.c });
		// });

		const finalSharedTask: TaskItem = {
			title: minifiedTask.t,
			completed: minifiedTask.c,
			subTasks: restoredSubTasks,
		};
		createTask(finalSharedTask);
		setSharedTaskPromptVisible(false);
	};

	useFocusEffect(
		useCallback(() => {
			fetchTasks();
			handleTaskParams();
		}, []),
	);

	useFocusEffect(useCallback(() => handleTaskParams(), [newSharedTasks]));

	useFocusEffect(
		useCallback(() => {
			tasks && saveTasks();

			// if (!__DEV__) return;
			const devMenuItems: ExpoDevMenuItem[] = [
				{
					name: "Clear tasks",
					callback: () => {
						removeItem().then(() =>
							console.log("Wiped local store successfully"),
						);
						setTasks(undefined);
					},
					shouldCollapse: true,
				},
				{
					name: "Dump locally stored task list in logs",
					callback: () => {
						AsyncStorage.getItem("tasks").then((e) =>
							console.log(e && JSON.parse(e)),
						);
					},
					shouldCollapse: false,
				},
				{
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
							};
						});
						setTasks(() => (tasks ? tasks.concat(Arr) : Arr));
					},
					shouldCollapse: true,
				},
				{
					name: "Generate 25 random tasks with sub tasks",
					callback: () => {
						const Arr = Array.from({ length: 25 }, () => {
							return {
								title: Math.random().toString(),
								completed: Math.random() > 0.5 ? true : false,
								subTasks: Array.from({ length: 5 }, () => {
									return {
										title: Math.random().toString(),
										completed: Math.random() > 0.5 ? true : false,
									};
								}),
							};
						});
						setTasks(() => (tasks ? tasks.concat(Arr) : Arr));
					},
					shouldCollapse: true,
				},
			];
			registerDevMenuItems(devMenuItems);
		}, [tasks]),
	);

	const RI = useCallback(
		({ item, index }: { item: any; index: number }) => (
			<Task
				mainTask={item}
				index={index}
				onPress={() => {
					setTaskToEdit(index);
					setCreationModalVisible(true);
				}}
				onDelete={() => {
					deleteTask(index);
				}}
				onShare={() => handleShare({ taskItem: item })}
				onCheck={(task) => {
					updateTask(index, task);
				}}
			/>
		),
		[],
	);

	const onLayoutRootView = useCallback(() => {
		if (loaded) {
			SplashScreen.hide();
		}
	}, [loaded]);

	if (!loaded) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: color.pri,
				}}
			>
				<ActivityIndicator color={color.sec} size="large" />
			</View>
		);
	}

	// Unable to memoise this function, as memoising this gives me an error
	// "Rendered more hooks than previous render"
	const keyExtractor = (item: TaskItem, index: number) =>
		`${index}-${item.title}`;

	return (
		<GestureHandlerRootView
			onLayout={onLayoutRootView}
			style={styles.container}
		>
			{creationModalVisible && (
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
			)}
			<SharedTaskPrompt
				visible={sharedTaskPromptVisible}
				taskToAdd={
					URLsharedTask !== undefined ? URLsharedTask : { t: "Test", c: false }
				}
				onRequestClose={() => setSharedTaskPromptVisible((prev) => !prev)}
				onAccept={() => {
					URLsharedTask && handleShareTaskConversion(URLsharedTask);
				}}
			/>
			<View style={{ flexGrow: 1 }}>
				<FlatList
					contentContainerStyle={{ flexGrow: 1 }}
					data={tasks}
					initialNumToRender={9}
					renderItem={RI}
					removeClippedSubviews
					keyExtractor={keyExtractor}
					ListEmptyComponent={NoTasks}
					ListHeaderComponent={ListHeader}
					ListHeaderComponentStyle={{ width: "100%" }}
					// StickyHeaderComponent={ListHeader}
					stickyHeaderHiddenOnScroll
					maxToRenderPerBatch={15}
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

const ListHeader = memo(() => (
	<View
		style={{
			padding: 50,
			paddingLeft: 30,
			experimental_backgroundImage: [
				{
					type: "linear-gradient",
					colorStops: [{ color: color.sec }, { color: "transparent" }],
				},
			],
		}}
	>
		<Text style={{ color: color.font, fontSize: 35, fontWeight: "100" }}>
			Tasks
		</Text>
	</View>
));

export function AppEntry() {
	// Dynamically get the app directory context for ExpoRoot
	const ctx = useCallback(() => {
		// For Metro bundler (React Native), require.context is polyfilled by expo-router
		// This will work for Expo SDK 49+
		// @ts-ignore
		return require.context("./app", true, /[jt]sx?$/);
	}, []);
	// @ts-ignore
	return <ExpoRoot context={ctx} />;
}

registerRootComponent(AppEntry);
