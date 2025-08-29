import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmBar({ visible, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <View style={styles.buttons}>
          <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
            <Text style={styles.buttonText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.confirm]} onPress={onConfirm}>
            <Text style={styles.buttonText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    padding: 12,
  },
  bar: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    maxWidth: 720,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  buttons: {
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancel: {
    backgroundColor: "#333",
  },
  confirm: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

