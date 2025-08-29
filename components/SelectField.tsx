import { useState } from "react";
import { Modal, StyleSheet, Text, View, Platform, ScrollView } from "react-native";
import { Pressable, Button, ButtonText, Card } from "@gluestack-ui/themed";
import { ChevronDown, Check } from "lucide-react-native";

type Props = {
  label?: string;
  value?: string;
  placeholder?: string;
  options: string[];
  onSelect: (value: string) => void;
};

export default function SelectField({ label, value, placeholder = "Select", options, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <Pressable
        style={styles.dropdown}
        onPress={() => setOpen(true)}
        accessibilityLabel={label || placeholder}
      >
        <Text style={styles.dropdownText}>{value || placeholder}</Text>
        <ChevronDown size={20} color="#888" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label || placeholder}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((opt) => {
                const selected = opt === value;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => {
                      onSelect(opt);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                    {selected ? <Check size={18} color="#fff" /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Button style={styles.cancelButton} onPress={() => setOpen(false)}>
                <ButtonText style={styles.cancelText}>Close</ButtonText>
              </Button>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    width: "100%",
    maxWidth: 420,
    padding: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: "#2a2a2a",
  },
  optionText: {
    color: "#fff",
    fontSize: 14,
  },
  modalActions: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: "#e74c3c",
    fontWeight: "700",
  },
});

