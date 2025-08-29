import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Modal, TextInput, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { useWorkoutStore } from "@/hooks/useWorkoutStore";
import { MesoCycle, WorkoutDay } from "@/types/workout";
import { Calendar, ChevronRight, Edit2, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ACCESSORY_ID } from "@/components/InputAccessoryBar";
import ConfirmBar from "@/components/ConfirmBar";

export default function MesocycleDetailScreen() {
  const { mesoId } = useLocalSearchParams();
  const { getMesocycleById, deleteMesocycle, setActiveMesocycle, updateMesocycle, mesocycles } = useMesocycleStore();
  const { getWorkoutDaysForMesocycle } = useWorkoutStore();
  
  const [mesocycle, setMesocycle] = useState<MesoCycle | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  const getSuggestedName = (base: string) => {
    const list = mesocycles
      .filter((m) => m.meso_id !== mesocycle?.meso_id)
      .map((m) => m.meso_name.trim().toLowerCase());
    const b = base.trim();
    if (!b) return "";
    const lower = b.toLowerCase();
    if (!list.includes(lower)) return b;
    let n = 2;
    while (list.includes(`${lower} (${n})`)) n++;
    return `${b} (${n})`;
  };

  useEffect(() => {
    if (mesoId) {
      const meso = getMesocycleById(mesoId as string);
      if (meso) {
        setMesocycle(meso);
        const days = getWorkoutDaysForMesocycle(mesoId as string);
        setWorkoutDays(days);
        setEditName(meso.meso_name);
        setEditDuration(String(meso.duration_weeks));
      }
    }
  }, [mesoId]);

  const handleActivate = () => {
    if (mesocycle) {
      setActiveMesocycle(mesocycle.meso_id);
      Alert.alert(
        "Mesocycle Activated",
        `${mesocycle.meso_name} is now your active mesocycle.`,
        [{ text: "OK" }]
      );
    }
  };

  const handleDelete = () => setConfirmVisible(true);
  const performDelete = async () => {
    setConfirmVisible(false);
    if (mesocycle) {
      await deleteMesocycle(mesocycle.meso_id);
      router.replace("/mesocycles");
    }
  };

  const openEdit = () => setEditVisible(true);
  const saveEdit = async () => {
    if (!mesocycle) return;
    const duration = parseInt(editDuration || "0");
    if (!editName.trim() || !duration || duration < 1) {
      Alert.alert("Invalid Input", "Please enter a valid name and duration.");
      return;
    }
    try {
      const updated = await updateMesocycle(mesocycle.meso_id, { meso_name: editName.trim(), duration_weeks: duration });
      setMesocycle(updated);
      setEditVisible(false);
    } catch (e:any) {
      Alert.alert("Error", e?.message || "Failed to update mesocycle");
    }
  };

  if (!mesocycle) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mesocycle not found</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={["#2a2a2a", "#1e1e1e"]}
        style={[styles.header, styles.maxWidth]}
      >
        <View style={styles.headerContent}>
          {mesocycle.is_active && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          )}
          
          <Text style={styles.title}>{mesocycle.meso_name}</Text>
          <Text style={styles.subtitle}>
            {mesocycle.duration_weeks} weeks • {workoutDays.length} workout days
          </Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Week 2 of {mesocycle.duration_weeks}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "50%" }]} />
            </View>
          </View>
          
          {!mesocycle.is_active && (
            <Pressable 
              style={styles.activateButton}
              onPress={handleActivate}
            >
              <Text style={styles.activateButtonText}>ACTIVATE MESOCYCLE</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <View style={[styles.section, styles.maxWidth]}>
        <Text style={styles.sectionTitle}>Workout Days</Text>
        
        {workoutDays.map((day) => (
          <Pressable 
            key={day.day_id}
            style={styles.dayCard}
            onPress={() => router.push(`/workout/${day.day_id}`)}
          >
            <View style={styles.dayCardContent}>
              <Text style={styles.dayCardTitle}>{day.day_name}</Text>
              <Text style={styles.dayCardSubtitle}>
                {day.exercise_ids?.length || 0} exercises
              </Text>
            </View>
            <ChevronRight size={20} color="#888" />
          </Pressable>
        ))}
        
        {workoutDays.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={40} color="#888" />
            <Text style={styles.emptyStateText}>No workout days configured</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, styles.maxWidth]}>
        <Text style={styles.sectionTitle}>Deload Week</Text>
        <View style={styles.deloadCard}>
          <Text style={styles.deloadText}>
            Your deload week is scheduled for week {mesocycle.duration_weeks}.
            During this week, weights will be reduced by 40% and total sets by 30%.
          </Text>
        </View>
      </View>

      <View style={[styles.actionButtons, styles.maxWidth]}>
        <Pressable 
          style={[styles.actionButton, styles.editButton]}
          onPress={openEdit}
        >
          <Edit2 size={20} color="#fff" />
          <Text style={styles.actionButtonText}>EDIT</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#fff" />
          <Text style={styles.actionButtonText}>DELETE</Text>
        </Pressable>
      </View>
    </ScrollView>
    
    {/* Edit Modal */}
    <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.editModal}>
          <Text style={styles.editTitle}>Edit Mesocycle</Text>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="e.g., Push/Pull/Legs"
            placeholderTextColor="#888"
            inputAccessoryViewID={ACCESSORY_ID}
          />
          {!!editName.trim() && mesocycles.some(m => m.meso_id !== mesocycle.meso_id && m.meso_name.trim().toLowerCase() === editName.trim().toLowerCase()) && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: '#e74c3c', fontSize: 12 }}>Name already exists.</Text>
              <Pressable onPress={() => setEditName(getSuggestedName(editName))} style={{ backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Use "{getSuggestedName(editName)}"</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.inputLabel}>Duration (weeks)</Text>
          <TextInput
            style={styles.textInput}
            value={editDuration}
            onChangeText={setEditDuration}
            keyboardType="numeric"
            placeholder="4"
            placeholderTextColor="#888"
            inputAccessoryViewID={ACCESSORY_ID}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
            <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => setEditVisible(false)}>
              <Text style={styles.actionButtonText}>CANCEL</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.activateButton]} onPress={saveEdit}>
              <Text style={styles.actionButtonText}>SAVE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

    <ConfirmBar
      visible={confirmVisible}
      message={`Delete "${mesocycle?.meso_name}"? This cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={performDelete}
      onCancel={() => setConfirmVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  maxWidth: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },
  headerContent: {
    padding: 20,
  },
  activeBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#e74c3c",
  },
  activateButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  activateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 15,
  },
  dayCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dayCardContent: {
    flex: 1,
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  dayCardSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  emptyStateText: {
    color: "#888",
    fontSize: 16,
    marginTop: 15,
  },
  deloadCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
  },
  deloadText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "#333",
  },
  deleteButton: {
    backgroundColor: "#c0392b",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModal: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    width: "90%",
    padding: 16,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  inputLabel: {
    color: "#fff",
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
  },
});





