import { useEffect, useState } from "react";
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
import { TaskItem } from "../App";

// The sheer number of @ts-ignore here is just embarrasing.
// but there is no other choice to shut the TypeScript warnings
// Poor TS doesn't know that the subTasks checks will never run
// because the button that runs the subTasks array check, will be hidden when there are no sub tasks.

type types = {
  mainTask: {
    title: string;
    completed: boolean;
    subTasks?: Array<{ title: string; completed: boolean }>;
  };
  onPress: ({
    title,
    completed,
    subTasks,
  }: {
    title: string;
    completed: boolean;
    subTasks?: Array<{ title: string; completed: boolean }>;
  }) => void;
  onDelete: () => void;
  index: number;
  onCheck: ({ title, completed, subTasks }: TaskItem) => void
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Task({ mainTask, onPress, onDelete, index, onCheck }: types) {
  const [selected, setSelected] = useState<boolean | null>(false);
  const [completed, setCompleted] = useState(mainTask.completed);
  const [subTasks, setSubTask] = useState(mainTask.subTasks);
  const taskHeight = useSharedValue(75);

  useEffect(() => {
    setSubTask(mainTask.subTasks);
  }, [mainTask]);

  useEffect(() => {
    onCheck({
      title: mainTask.title,
      completed,
      subTasks,
    });

    if (subTasks === undefined) {
      setSelected(false) 
    }
  }, [completed, subTasks]);

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
      }
    );
    return {
      //@ts-ignore
      height: taskHeight.value,
    };
  }, [selected, subTasks, taskHeight]);

  const dropdownAn = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withDelay(
            100,
            withTiming(selected ? "180deg" : "0deg", { duration: 150 })
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

  return (
    <Swipeable
      onSwipeableOpenStartDrag={() => setSelected(false)}
      renderRightActions={(p, x) => {
        return RightAction(p, x, () => {
          setSelected(null);
          setTimeout(() => {
            onDelete();
          }, 100);
        });
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
          {/* @ts-ignore */}
          {mainTask.subTasks?.length > 0 ? (
            <AnimatedPressable
              hitSlop={25}
              style={[styles.dropdown, dropdownAn]}
              onPress={() => {
                setSelected((p) => !p);
              }}
            >
              <AntDesign
                name="circledown"
                color={color.ter}
                size={25}
                style={{
                  filter: "drop-shadow(0px 0px 5px " + color.pri + ");",
                }}
              />
            </AnimatedPressable>
          ) : null}
        </Pressable>
        {selected ? (
          <Animated.View style={[{ margin: 20, marginTop: 5 }, subTasksAn]}>
            {/* @ts-ignore */}
            {mainTask.subTasks.map((item, idx) => {
              const handleSubTaskToggle = (id: number): void => {
                // "Man, I hate AI."
                // *Proceeds to use AI to write the following code:*
                setSubTask((prev) =>
                  prev?.map((subTask, index) =>
                    index === id
                      ? { ...subTask, completed: !subTask.completed }
                      : subTask
                  )
                );
              };

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
    margin: 10,
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

function RightAction(
  _progress: SharedValue<number>,
  _dragX: SharedValue<number>,
  onDelete: () => void
) {
  const anStyle = useAnimatedStyle(() => {
    return { left: _dragX.value / 2 };
  }, [_dragX]);

  return (
    <View
      style={{
        width: 75,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        margin: 10,
        outlineWidth: 1,
      }}
    >
      <AnimatedPressable
        style={[
          {
            backgroundColor: "red",
            borderRadius: 50,
            width: 40,
            aspectRatio: 1,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
          },
          anStyle,
        ]}
        hitSlop={10}
        onPress={onDelete}
      >
        <MaterialIcons name="delete" color={color.font} size={20} />
      </AnimatedPressable>
    </View>
  );
}
