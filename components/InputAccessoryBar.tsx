import { Platform, InputAccessoryView, View, Text, StyleSheet, Keyboard } from "react-native";
import { Button, ButtonText } from "@gluestack-ui/themed";

export const ACCESSORY_ID = "globalAccessory";

export default function InputAccessoryBar() {
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={ACCESSORY_ID} backgroundColor="#1a1a1a">
      <View style={styles.bar}>
        <Button accessibilityLabel="Hide keyboard" onPress={() => Keyboard.dismiss()} style={styles.button}>
          <ButtonText style={styles.buttonText}>Hide Keyboard</ButtonText>
        </Button>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderTopColor: "#333",
    borderTopWidth: 1,
  },
  button: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

