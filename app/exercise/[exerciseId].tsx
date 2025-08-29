import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { Exercise } from "@/types/workout";
import { Dumbbell, Info, Target } from "lucide-react-native";

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams();
  const { getExerciseById } = useExerciseStore();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (exerciseId) {
      const ex = getExerciseById(exerciseId as string);
      if (ex) {
        setExercise(ex);
      }
    }
  }, [exerciseId]);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: exercise.video_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" }} 
          style={styles.exerciseImage} 
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{exercise.name}</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Dumbbell size={14} color="#e74c3c" />
              <Text style={styles.tagText}>{exercise.equipment}</Text>
            </View>
            <View style={styles.tag}>
              <Info size={14} color="#e74c3c" />
              <Text style={styles.tagText}>{exercise.primary_muscle_group}</Text>
            </View>
            {Array.isArray(exercise.target_muscles) && exercise.target_muscles.length > 0 && (
              <View style={styles.tag}>
                <Target size={14} color="#e74c3c" />
                <Text style={styles.tagText} numberOfLines={1}>
                  {exercise.target_muscles.join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{exercise.instructions}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Keep your back straight and core engaged throughout the movement
            </Text>
            <Text style={styles.tipText}>
              • Focus on the mind-muscle connection with the target muscle
            </Text>
            <Text style={styles.tipText}>
              • Control the eccentric (lowering) portion of the movement
            </Text>
            <Text style={styles.tipText}>
              • Breathe out during the concentric (lifting) phase
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={styles.historyDate}>July 10, 2025</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyWeight}>225 lbs</Text>
                <Text style={styles.historyReps}>8 reps @ 2 RIR</Text>
              </View>
            </View>
            
            <View style={styles.historyRow}>
              <Text style={styles.historyDate}>July 3, 2025</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyWeight}>215 lbs</Text>
                <Text style={styles.historyReps}>10 reps @ 1 RIR</Text>
              </View>
            </View>
            
            <View style={styles.historyRow}>
              <Text style={styles.historyDate}>June 26, 2025</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyWeight}>205 lbs</Text>
                <Text style={styles.historyReps}>8 reps @ 2 RIR</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable style={styles.watchVideoButton}>
          <Text style={styles.watchVideoButtonText}>WATCH DEMONSTRATION</Text>
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
  imageContainer: {
    height: 250,
    width: "100%",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  instructionsText: {
    color: "#aaa",
    fontSize: 16,
    lineHeight: 24,
  },
  tipCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
  },
  tipText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  historyDate: {
    color: "#888",
    fontSize: 14,
  },
  historyDetails: {
    alignItems: "flex-end",
  },
  historyWeight: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  historyReps: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },
  watchVideoButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  watchVideoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
