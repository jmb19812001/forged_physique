import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { LinearGradient } from "expo-linear-gradient";

export default function CustomExerciseScreen() {
  const { customExercises, deleteCustomExercise } = useExerciseStore();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#2a2a2a", "#1e1e1e"]} style={styles.header}>
          <Text style={styles.title}>Custom Exercises</Text>
        </LinearGradient>

        <Link href="/exercise/form" style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Exercise</Text>
        </Link>

        {customExercises.map((exercise) => (
          <View key={exercise.exercise_id} style={styles.exerciseCard}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
            </View>
            <View style={styles.actions}>
              <Link href={{ pathname: "/exercise/form", params: { exerciseId: exercise.exercise_id } }} asChild>
                <Pressable style={styles.editButton}>
                  <Text style={styles.buttonText}>Edit</Text>
                </Pressable>
              </Link>
              <Pressable style={styles.deleteButton} onPress={() => deleteCustomExercise(exercise.exercise_id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  addButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    margin: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
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
  actions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600" as const,
  },
});
