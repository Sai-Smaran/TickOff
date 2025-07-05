import { StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import color from "../constants/colors";

export default function NoTasks() {
  return (
    <View style={styles.container}>
      <FontAwesome
        name="check-square"
        size={100}
        color={color.ter}
        style={{
          margin: 10,
          filter: "drop-shadow(0px 0px 20px "+color.sec+");"
        }}
      />
      <Text style={styles.text}>No tasks for today!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    outlineColor: color.font,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: color.font,
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 25,
    width: 1000,
    textAlign: "center"
  },
});
