import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { useWorkoutStore } from "@/hooks/useWorkoutStore";
import { MesoCycle, WorkoutDay } from "@/types/workout";
import { Calendar, ChevronRight, Edit2, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MesocycleDetailScreen() {
  const { mesoId } = useLocalSearchParams();
  const { getMesocycleById, deleteMesocycle, setActiveMesocycle } = useMesocycleStore();
  const { getWorkoutDaysForMesocycle } = useWorkoutStore();
  
  const [mesocycle, setMesocycle] = useState<MesoCycle | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    if (mesoId) {
      const meso = getMesocycleById(mesoId as string);
      if (meso) {
        setMesocycle(meso);
        const days = getWorkoutDaysForMesocycle(mesoId as string);
        setWorkoutDays(days);
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

  const handleDelete = () => {
    Alert.alert(
      "Delete Mesocycle",
      "Are you sure you want to delete this mesocycle? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            if (mesocycle) {
              deleteMesocycle(mesocycle.meso_id);
              router.replace("/mesocycles");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!mesocycle) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mesocycle not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#2a2a2a", "#1e1e1e"]}
        style={styles.header}
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

      <View style={styles.section}>
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
                {day.exercises?.length || 0} exercises
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deload Week</Text>
        <View style={styles.deloadCard}>
          <Text style={styles.deloadText}>
            Your deload week is scheduled for week {mesocycle.duration_weeks}.
            During this week, weights will be reduced by 40% and total sets by 30%.
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {}}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
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
});