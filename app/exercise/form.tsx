import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { Exercise } from "@/types/workout";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

export default function ExerciseFormScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const {
    getExerciseById,
    addCustomExercise,
    editCustomExercise,
    getMuscleGroups,
  } = useExerciseStore();

  const [name, setName] = useState("");
  const [primaryMuscleGroup, setPrimaryMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const muscleGroups = getMuscleGroups();
  const isEditing = Boolean(exerciseId);

  useEffect(() => {
    if (isEditing) {
      const exercise = getExerciseById(exerciseId) as Exercise;
      if (exercise) {
        setName(exercise.name);
        setPrimaryMuscleGroup(exercise.primary_muscle_group);
        setEquipment(exercise.equipment || "");
        setInstructions(exercise.instructions || "");
        setVideoUrl(exercise.video_url || "");
      }
    } else {
        if (muscleGroups.length > 0) {
            setPrimaryMuscleGroup(muscleGroups[0]);
        }
    }
  }, [exerciseId]);

  const handleSubmit = () => {
    if (!name || !primaryMuscleGroup) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const exerciseData = {
      name,
      primary_muscle_group: primaryMuscleGroup,
      equipment,
      instructions,
      video_url: videoUrl,
    };

    if (isEditing) {
      editCustomExercise({ ...exerciseData, exercise_id: exerciseId });
    } else {
      addCustomExercise(exerciseData);
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#2a2a2a", "#1e1e1e"]} style={styles.header}>
        <Text style={styles.title}>{isEditing ? "Edit Exercise" : "Add Exercise"}</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Exercise Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Bench Press"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Primary Muscle Group</Text>
        <View style={styles.pickerContainer}>
            <Picker
            selectedValue={primaryMuscleGroup}
            onValueChange={(itemValue) => setPrimaryMuscleGroup(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
            >
            {muscleGroups.map((group) => (
                <Picker.Item key={group} label={group} value={group} color="#000"/>
            ))}
            </Picker>
        </View>

        <Text style={styles.label}>Equipment</Text>
        <TextInput
          style={styles.input}
          value={equipment}
          onChangeText={setEquipment}
          placeholder="e.g., Barbell"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Enter instructions..."
          placeholderTextColor="#888"
          multiline
        />

        <Text style={styles.label}>Video URL (Optional)</Text>
        <TextInput
          style={styles.input}
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="https://example.com/video.mp4"
          placeholderTextColor="#888"
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{isEditing ? "Save Changes" : "Add Exercise"}</Text>
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
    padding: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 15,
    color: "#fff",
    marginBottom: 20,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
