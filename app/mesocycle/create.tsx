import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Switch, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { useWorkoutStore } from "@/hooks/useWorkoutStore";
import { ChevronDown, ChevronRight, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateMesocycleScreen() {
  const { type = "preset", selectedExercises, dayName: dayNameParam } = useLocalSearchParams<{selectedExercises?: string, dayName?: string, type?: string}>();
  const { createMesocycle } = useMesocycleStore();
  const { getMuscleGroups, getExerciseById } = useExerciseStore();
  const { createWorkoutDaysForMesocycle } = useWorkoutStore();
  
  const [mesoName, setMesoName] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [startDay, setStartDay] = useState("Monday");
  const [selectedPreset, setSelectedPreset] = useState("Full Body 3x");
  const [workoutDays, setWorkoutDays] = useState<{ dayName: string, enabled: boolean, muscleGroups: { name: string, enabled: boolean }[], exercise_ids: string[] }[]>([
    { dayName: "Monday", enabled: true, muscleGroups: [], exercise_ids: [] },
    { dayName: "Wednesday", enabled: true, muscleGroups: [], exercise_ids: [] },
    { dayName: "Friday", enabled: true, muscleGroups: [], exercise_ids: [] },
  ]);
  
  const muscleGroups = getMuscleGroups();

  useEffect(() => {
    // Initialize muscle groups for each day
    const updatedDays = workoutDays.map(day => ({
      ...day,
      muscleGroups: muscleGroups.map(mg => ({
        name: mg,
        enabled: day.enabled && (mg === "Chest" || mg === "Back" || mg === "Legs")
      }))
    }));
    setWorkoutDays(updatedDays);
  }, []);

  useEffect(() => {
    if (selectedExercises && dayNameParam) {
      const newExerciseIds = JSON.parse(selectedExercises);
      setWorkoutDays(prev =>
        prev.map(day =>
          day.dayName === dayNameParam ? { ...day, exercise_ids: newExerciseIds } : day
        )
      );
    }
  }, [selectedExercises, dayNameParam]);

  const handleCreateMesocycle = async () => {
    if (!mesoName) {
      Alert.alert("Error", "Please enter a name for your mesocycle");
      return;
    }
    
    try {
      const params = {
        meso_name: mesoName,
        duration_weeks: parseInt(durationWeeks),
        days_per_week: parseInt(daysPerWeek),
        start_day: startDay,
        preset: type === "preset" ? selectedPreset : undefined,
      };
      
      const newMesocycle = await createMesocycle(params);
      
      // Create workout days for the new mesocycle
      await createWorkoutDaysForMesocycle(newMesocycle, workoutDays, params);
      
      Alert.alert(
        "Success",
        "Mesocycle created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/mesocycles")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create mesocycle. Please try again.");
    }
  };

  const toggleDayEnabled = (index: number) => {
    setWorkoutDays(prev => {
      const updated = [...prev];
      updated[index].enabled = !updated[index].enabled;
      return updated;
    });
  };

  const toggleMuscleGroup = (dayIndex: number, muscleIndex: number) => {
    setWorkoutDays(prev => {
      const updated = [...prev];
      updated[dayIndex].muscleGroups[muscleIndex].enabled = !updated[dayIndex].muscleGroups[muscleIndex].enabled;
      return updated;
    });
  };

  const addNewDay = () => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const usedDays = workoutDays.map(d => d.dayName);
    const nextAvailableDay = daysOfWeek.find(day => !usedDays.includes(day)) || `Day ${workoutDays.length + 1}`;
    
    const newDay = { dayName: nextAvailableDay, enabled: true, muscleGroups: muscleGroups.map(mg => ({ name: mg, enabled: false })), exercise_ids: [] };

    const sortedDays = [...workoutDays, newDay].sort((a, b) => {
      const dayAIndex = daysOfWeek.indexOf(a.dayName);
      const dayBIndex = daysOfWeek.indexOf(b.dayName);

      // Handle cases where dayName is not in daysOfWeek (e.g., "Day 5")
      if (dayAIndex === -1) return 1;
      if (dayBIndex === -1) return -1;

      return dayAIndex - dayBIndex;
    });

    setWorkoutDays(sortedDays);
    setDaysPerWeek((parseInt(daysPerWeek) + 1).toString());
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#2a2a2a", "#1e1e1e"]}
        style={styles.header}
      >
        <Text style={styles.title}>Plan a mesocycle</Text>
        <Text style={styles.subtitle}>
          Choose from a preset or design your own from the ground up!
        </Text>
        
        <View style={styles.tabContainer}>
          <Pressable 
            style={[
              styles.tabButton,
              type === "preset" && styles.activeTabButton
            ]}
            onPress={() => router.replace("/mesocycle/create?type=preset")}
          >
            <Text style={[
              styles.tabButtonText,
              type === "preset" && styles.activeTabButtonText
            ]}>Preset</Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.tabButton,
              type === "custom" && styles.activeTabButton
            ]}
            onPress={() => router.replace("/mesocycle/create?type=custom")}
          >
            <Text style={[
              styles.tabButtonText,
              type === "custom" && styles.activeTabButtonText
            ]}>Custom</Text>
          </Pressable>
          
          <Pressable style={styles.tabButton}>
            <Text style={styles.tabButtonText}>Copy</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {type === "preset" ? "Preset meso" : "Custom meso"}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What is your sex?</Text>
          <View style={styles.sexToggleContainer}>
            <Pressable 
              style={[
                styles.sexToggleButton,
                sex === "male" && styles.activeSexToggleButton
              ]}
              onPress={() => setSex("male")}
            >
              <Text style={[
                styles.sexToggleText,
                sex === "male" && styles.activeSexToggleText
              ]}>MALE</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.sexToggleButton,
                sex === "female" && styles.activeSexToggleButton
              ]}
              onPress={() => setSex("female")}
            >
              <Text style={[
                styles.sexToggleText,
                sex === "female" && styles.activeSexToggleText
              ]}>FEMALE</Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What day of the week will you begin your meso?</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>{startDay}</Text>
            <ChevronDown size={20} color="#888" />
          </Pressable>
        </View>
        
        {type === "preset" && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preset</Text>
            <Pressable style={styles.dropdown}>
              <Text style={styles.dropdownText}>{selectedPreset}</Text>
              <ChevronDown size={20} color="#888" />
            </Pressable>
          </View>
        )}
        
        {type === "custom" && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>How many days per week?</Text>
            <TextInput
              style={styles.input}
              value={daysPerWeek}
              onChangeText={setDaysPerWeek}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="#888"
            />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mesocycle Name</Text>
          <TextInput
            style={styles.input}
            value={mesoName}
            onChangeText={setMesoName}
            placeholder="My 5-Day Split"
            placeholderTextColor="#888"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Duration (weeks)</Text>
          <TextInput
            style={styles.input}
            value={durationWeeks}
            onChangeText={setDurationWeeks}
            keyboardType="numeric"
            placeholder="4"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {type === "custom" && (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Workout Days</Text>
          
          {workoutDays.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayCardTitle}>{day.dayName}</Text>
                <Switch
                  value={day.enabled}
                  onValueChange={() => toggleDayEnabled(dayIndex)}
                  trackColor={{ false: "#333", true: "#e74c3c" }}
                  thumbColor="#fff"
                />
              </View>
              
              {day.enabled && (
                <View style={styles.muscleGroupsContainer}>
                  {day.muscleGroups.map((group, muscleIndex) => (
                    <View key={group.name} style={styles.muscleGroupRow}>
                      <Text style={styles.muscleGroupName}>{group.name}</Text>
                      <Switch
                        value={group.enabled}
                        onValueChange={() => toggleMuscleGroup(dayIndex, muscleIndex)}
                        trackColor={{ false: "#333", true: "#e74c3c" }}
                        thumbColor="#fff"
                      />
                    </View>
                  ))}
                  
                  <Pressable
                    style={styles.viewExercisesButton}
                    onPress={() => {
                      const enabledMuscleGroups = day.muscleGroups
                        .filter(mg => mg.enabled)
                        .map(mg => mg.name);

                      router.push({
                        pathname: "/exercise",
                        params: {
                          muscleGroups: JSON.stringify(enabledMuscleGroups),
                          selectedExercises: JSON.stringify(day.exercise_ids),
                          dayName: day.dayName
                        }
                      });
                    }}
                  >
                    <Text style={styles.viewExercisesText}>View Exercises</Text>
                    <ChevronRight size={16} color="#888" />
                  </Pressable>

                  {day.exercise_ids.length > 0 && (
                    <View style={styles.selectedExercisesContainer}>
                      <Text style={styles.selectedExercisesTitle}>Selected Exercises:</Text>
                      {day.exercise_ids.map(exerciseId => {
                        const exercise = getExerciseById(exerciseId);
                        return (
                          <Text key={exerciseId} style={styles.selectedExerciseName}>
                            - {exercise?.name}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
          
          <Pressable style={styles.addDayButton} onPress={addNewDay}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addDayButtonText}>ADD DAY</Text>
          </Pressable>
        </View>
      )}

      <Pressable 
        style={styles.continueButton}
        onPress={handleCreateMesocycle}
      >
        <Text style={styles.continueButtonText}>CONTINUE</Text>
      </Pressable>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#e74c3c",
  },
  tabButtonText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
  activeTabButtonText: {
    color: "#fff",
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 15,
    color: "#fff",
    fontSize: 16,
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
  sexToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    overflow: "hidden",
  },
  sexToggleButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeSexToggleButton: {
    backgroundColor: "#e74c3c",
  },
  sexToggleText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
  activeSexToggleText: {
    color: "#fff",
  },
  dayCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  dayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  muscleGroupsContainer: {
    padding: 15,
  },
  muscleGroupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  muscleGroupName: {
    fontSize: 16,
    color: "#fff",
  },
  viewExercisesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  viewExercisesText: {
    color: "#888",
    fontSize: 14,
    marginRight: 5,
  },
  addDayButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  addDayButtonText: {
    color: "#fff",
    fontWeight: "700" as const,
    marginLeft: 5,
  },
  continueButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    margin: 20,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  selectedExercisesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  selectedExercisesTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  selectedExerciseName: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 5,
  },
});