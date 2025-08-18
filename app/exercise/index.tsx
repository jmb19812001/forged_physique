import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { LinearGradient } from "expo-linear-gradient";

export default function ExerciseScreen() {
  const { exercises, getExercisesByMuscleGroup } = useExerciseStore();
  const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Arms"];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#2a2a2a", "#1e1e1e"]}
        style={styles.header}
      >
        <Text style={styles.title}>Exercises</Text>
      </LinearGradient>

      {muscleGroups.map((muscleGroup) => (
        <View key={muscleGroup} style={styles.muscleGroupSection}>
          <Text style={styles.muscleGroupTitle}>{muscleGroup}</Text>
          {getExercisesByMuscleGroup(muscleGroup).map((exercise) => (
            <View key={exercise.exercise_id} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
  },
  muscleGroupSection: {
    padding: 20,
  },
  muscleGroupTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  exerciseEquipment: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});
