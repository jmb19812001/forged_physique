import { useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

export default function KeyboardDismissOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return; // not needed on web

    const showSub = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable accessibilityLabel="Hide keyboard" style={styles.button} onPress={() => Keyboard.dismiss()}>
        <ChevronDown size={18} color="#fff" />
        <Text style={styles.label}>Hide Keyboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: "#e74c3c",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },
});

