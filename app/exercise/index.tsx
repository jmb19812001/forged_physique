import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { LinearGradient } from "expo-linear-gradient";
import { Checkbox } from "expo-checkbox";

export default function ExerciseScreen() {
  const { muscleGroups: muscleGroupsJSON, selectedExercises: selectedExercisesJSON, dayName } = useLocalSearchParams<{muscleGroups: string, selectedExercises: string, dayName: string}>();
  const { getExercisesByMuscleGroup } = useExerciseStore();

  const muscleGroups = muscleGroupsJSON ? JSON.parse(muscleGroupsJSON) : [];
  const initialSelected = selectedExercisesJSON ? JSON.parse(selectedExercisesJSON) : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);

  const toggleExercise = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDone = () => {
    router.replace({
      pathname: "/mesocycle/create",
      params: {
        selectedExercises: JSON.stringify(selected),
        dayName: dayName,
        type: "custom"
      }
    });
  };

  const exercises = muscleGroups.flatMap((mg: string) => getExercisesByMuscleGroup(mg));

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#2a2a2a", "#1e1e1e"]}
          style={styles.header}
        >
          <Text style={styles.title}>Select Exercises for {dayName}</Text>
        </LinearGradient>

        {exercises.map((exercise) => (
          <Pressable key={exercise.exercise_id} style={styles.exerciseCard} onPress={() => toggleExercise(exercise.exercise_id)}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
            </View>
            <Checkbox
              value={selected.includes(exercise.exercise_id)}
              onValueChange={() => toggleExercise(exercise.exercise_id)}
              color="#e74c3c"
            />
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
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
  doneButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    margin: 20,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
