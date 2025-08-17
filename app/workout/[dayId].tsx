import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Modal, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useWorkoutStore } from "@/hooks/useWorkoutStore";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { useAuth } from "@/hooks/useAuth";
import { Exercise, SetLog, WorkoutDay } from "@/types/workout";
import { ChevronDown, ChevronUp, Info, Plus } from "lucide-react-native";
import * as Haptics from 'expo-haptics';

export default function WorkoutScreen() {
  const { dayId } = useLocalSearchParams();
  const { getWorkoutDay, logSet, completeWorkout } = useWorkoutStore();
  const { getExerciseById } = useExerciseStore();
  const { user } = useAuth();
  
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [exerciseSets, setExerciseSets] = useState<{[key: string]: SetLog[]}>({});
  const [expandedExercises, setExpandedExercises] = useState<{[key: string]: boolean}>({});
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState<string>("");
  const [feedback, setFeedback] = useState({
    jointPain: 1,
    pump: 2,
    difficulty: 2,
  });
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (dayId) {
      const workout = getWorkoutDay(dayId as string);
      if (workout) {
        setWorkoutDay(workout);
        
        // Initialize expanded state for all exercises
        const expanded: {[key: string]: boolean} = {};
        workout.exercises?.forEach(exercise => {
          expanded[exercise.exercise_id] = true;
        });
        setExpandedExercises(expanded);
        
        // Initialize sets for each exercise
        const initialSets: {[key: string]: SetLog[]} = {};
        workout.exercises?.forEach(exercise => {
          const targetSets = exercise.target_sets || 3;
          const sets: SetLog[] = [];
          
          for (let i = 0; i < targetSets; i++) {
            sets.push({
              log_id: `temp-${exercise.exercise_id}-${i}`,
              exercise_id: exercise.exercise_id,
              weight: 0,
              reps: 0,
              rir: 2,
            });
          }
          
          initialSets[exercise.exercise_id] = sets;
        });
        
        setExerciseSets(initialSets);
      }
    }
  }, [dayId]);

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const updateSetValue = (exerciseId: string, setIndex: number, field: keyof SetLog, value: number) => {
    setExerciseSets(prev => {
      const sets = [...prev[exerciseId]];
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: value
      };
      return {
        ...prev,
        [exerciseId]: sets
      };
    });
  };

  const handleLogSet = (exerciseId: string, setIndex: number) => {
    const set = exerciseSets[exerciseId][setIndex];
    
    if (set.weight <= 0 || set.reps <= 0) {
      Alert.alert("Invalid Input", "Please enter valid weight and reps values.");
      return;
    }
    
    // Log the set
    logSet({
      ...set,
      session_id: workoutDay?.session_id || "",
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Check if this was the last set for this exercise
    if (setIndex === exerciseSets[exerciseId].length - 1) {
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        // Check if this was the last exercise for this muscle group
        const muscleGroup = exercise.primary_muscle_group;
        const remainingExercisesForMuscleGroup = workoutDay?.exercises?.filter(
          e => getExerciseById(e.exercise_id)?.primary_muscle_group === muscleGroup && 
          exerciseSets[e.exercise_id].some(set => !set.completed)
        );
        
        if (!remainingExercisesForMuscleGroup || remainingExercisesForMuscleGroup.length === 0) {
          // Show feedback modal for this muscle group
          setCurrentMuscleGroup(muscleGroup);
          setFeedbackModalVisible(true);
        }
      }
    }
    
    // Mark the set as completed
    setExerciseSets(prev => {
      const sets = [...prev[exerciseId]];
      sets[setIndex] = {
        ...sets[setIndex],
        completed: true
      };
      return {
        ...prev,
        [exerciseId]: sets
      };
    });
  };

  const addSet = (exerciseId: string) => {
    setExerciseSets(prev => {
      const sets = [...prev[exerciseId]];
      const lastSet = sets[sets.length - 1];
      
      sets.push({
        log_id: `temp-${exerciseId}-${sets.length}`,
        exercise_id: exerciseId,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        rir: lastSet?.rir || 2,
      });
      
      return {
        ...prev,
        [exerciseId]: sets
      };
    });
    
    // Scroll to bottom after adding a set
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSaveFeedback = () => {
    // Save feedback
    // In a real app, this would be sent to the backend
    
    setFeedbackModalVisible(false);
    
    // Check if all exercises are completed
    const allCompleted = Object.values(exerciseSets).every(sets => 
      sets.every(set => set.completed)
    );
    
    if (allCompleted) {
      // Complete the workout
      completeWorkout(workoutDay?.day_id || "");
      
      Alert.alert(
        "Workout Completed",
        "Great job! Your workout has been logged.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/mesocycles")
          }
        ]
      );
    }
  };

  if (!workoutDay) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{workoutDay.day_name}</Text>
          <Text style={styles.subtitle}>
            {workoutDay.exercises?.length || 0} exercises
          </Text>
        </View>

        {workoutDay.exercises?.map((workoutExercise) => {
          const exercise = getExerciseById(workoutExercise.exercise_id);
          if (!exercise) return null;
          
          const isExpanded = expandedExercises[exercise.exercise_id];
          const sets = exerciseSets[exercise.exercise_id] || [];
          
          return (
            <View key={exercise.exercise_id} style={styles.exerciseCard}>
              <Pressable 
                style={styles.exerciseHeader}
                onPress={() => toggleExerciseExpanded(exercise.exercise_id)}
              >
                <View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseTarget}>
                    Target: {workoutExercise.target_sets} sets • {exercise.primary_muscle_group}
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronUp size={24} color="#888" />
                ) : (
                  <ChevronDown size={24} color="#888" />
                )}
              </Pressable>
              
              {isExpanded && (
                <View style={styles.exerciseContent}>
                  <View style={styles.setHeaderRow}>
                    <Text style={styles.setHeaderCell}>SET</Text>
                    <Text style={styles.setHeaderCell}>WEIGHT</Text>
                    <Text style={styles.setHeaderCell}>REPS</Text>
                    <Text style={styles.setHeaderCell}>RIR</Text>
                    <Text style={styles.setHeaderCell}></Text>
                  </View>
                  
                  {sets.map((set, index) => (
                    <View 
                      key={`${exercise.exercise_id}-set-${index}`} 
                      style={[
                        styles.setRow,
                        set.completed && styles.completedSetRow
                      ]}
                    >
                      <Text style={styles.setNumberCell}>{index + 1}</Text>
                      
                      <View style={styles.inputCell}>
                        <TextInput
                          style={styles.input}
                          value={set.weight ? set.weight.toString() : ""}
                          onChangeText={(text) => updateSetValue(
                            exercise.exercise_id, 
                            index, 
                            "weight", 
                            text ? parseFloat(text) : 0
                          )}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#666"
                          editable={!set.completed}
                        />
                        <Text style={styles.unitText}>
                          {user?.unit_preference || "lbs"}
                        </Text>
                      </View>
                      
                      <View style={styles.inputCell}>
                        <TextInput
                          style={styles.input}
                          value={set.reps ? set.reps.toString() : ""}
                          onChangeText={(text) => updateSetValue(
                            exercise.exercise_id, 
                            index, 
                            "reps", 
                            text ? parseInt(text) : 0
                          )}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#666"
                          editable={!set.completed}
                        />
                      </View>
                      
                      <View style={styles.inputCell}>
                        <TextInput
                          style={styles.input}
                          value={set.rir !== undefined ? set.rir.toString() : ""}
                          onChangeText={(text) => updateSetValue(
                            exercise.exercise_id, 
                            index, 
                            "rir", 
                            text ? parseInt(text) : 0
                          )}
                          keyboardType="numeric"
                          placeholder="2"
                          placeholderTextColor="#666"
                          editable={!set.completed}
                        />
                      </View>
                      
                      <View style={styles.buttonCell}>
                        {!set.completed ? (
                          <Pressable 
                            style={styles.logButton}
                            onPress={() => handleLogSet(exercise.exercise_id, index)}
                          >
                            <Text style={styles.logButtonText}>LOG</Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.completedText}>✓</Text>
                        )}
                      </View>
                    </View>
                  ))}
                  
                  <Pressable 
                    style={styles.addSetButton}
                    onPress={() => addSet(exercise.exercise_id)}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={styles.addSetButtonText}>ADD SET</Text>
                  </Pressable>
                  
                  <Pressable style={styles.infoButton}>
                    <Info size={16} color="#888" />
                    <Text style={styles.infoButtonText}>View Exercise Info</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <Text style={styles.feedbackTitle}>FEEDBACK</Text>
            <Text style={styles.feedbackSubtitle}>{currentMuscleGroup}</Text>
            
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackQuestion}>JOINT PAIN</Text>
              <Text style={styles.feedbackDescription}>
                How did your joints feel during {currentMuscleGroup} exercises?
              </Text>
              
              <View style={styles.feedbackOptions}>
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.jointPain === 1 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, jointPain: 1 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.jointPain === 1 && styles.selectedFeedbackOptionText
                  ]}>NONE</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.jointPain === 2 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, jointPain: 2 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.jointPain === 2 && styles.selectedFeedbackOptionText
                  ]}>LOW PAIN</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.jointPain === 3 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, jointPain: 3 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.jointPain === 3 && styles.selectedFeedbackOptionText
                  ]}>MODERATE PAIN</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.jointPain === 4 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, jointPain: 4 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.jointPain === 4 && styles.selectedFeedbackOptionText
                  ]}>A LOT OF PAIN</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackQuestion}>BACK PUMP</Text>
              <Text style={styles.feedbackDescription}>
                How much of a pump did you get in your {currentMuscleGroup} today?
              </Text>
              
              <View style={styles.feedbackOptions}>
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.pump === 1 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, pump: 1 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.pump === 1 && styles.selectedFeedbackOptionText
                  ]}>LOW PUMP</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.pump === 2 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, pump: 2 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.pump === 2 && styles.selectedFeedbackOptionText
                  ]}>MODERATE</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.pump === 3 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, pump: 3 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.pump === 3 && styles.selectedFeedbackOptionText
                  ]}>AMAZING</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackQuestion}>BACK WORKLOAD</Text>
              <Text style={styles.feedbackDescription}>
                How would you rate the difficulty of the work you did for your {currentMuscleGroup}?
              </Text>
              
              <View style={styles.feedbackOptions}>
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.difficulty === 1 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, difficulty: 1 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.difficulty === 1 && styles.selectedFeedbackOptionText
                  ]}>EASY</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.difficulty === 2 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, difficulty: 2 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.difficulty === 2 && styles.selectedFeedbackOptionText
                  ]}>PRETTY GOOD</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.difficulty === 3 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, difficulty: 3 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.difficulty === 3 && styles.selectedFeedbackOptionText
                  ]}>PUSHED LIMITS</Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.feedbackOption,
                    feedback.difficulty === 4 && styles.selectedFeedbackOption
                  ]}
                  onPress={() => setFeedback(prev => ({ ...prev, difficulty: 4 }))}
                >
                  <Text style={[
                    styles.feedbackOptionText,
                    feedback.difficulty === 4 && styles.selectedFeedbackOptionText
                  ]}>TOO MUCH</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
              
              <Pressable 
                style={styles.saveButton}
                onPress={handleSaveFeedback}
              >
                <Text style={styles.saveButtonText}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: "hidden",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  exerciseTarget: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  exerciseContent: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 15,
  },
  setHeaderRow: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  setHeaderCell: {
    flex: 1,
    color: "#888",
    fontSize: 12,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  completedSetRow: {
    backgroundColor: "#1a1a1a",
  },
  setNumberCell: {
    flex: 1,
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  inputCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 5,
    padding: 8,
    width: 60,
    textAlign: "center",
  },
  unitText: {
    color: "#888",
    fontSize: 12,
    marginLeft: 5,
  },
  buttonCell: {
    flex: 1,
    alignItems: "center",
  },
  logButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  completedText: {
    color: "#4cd964",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  addSetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
    marginLeft: 5,
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: 10,
  },
  infoButtonText: {
    color: "#888",
    fontSize: 14,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackModal: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    width: "90%",
    padding: 20,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  feedbackSubtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackQuestion: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#e74c3c",
    marginBottom: 5,
  },
  feedbackDescription: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 10,
  },
  feedbackOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  feedbackOption: {
    backgroundColor: "#2a2a2a",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  selectedFeedbackOption: {
    backgroundColor: "#e74c3c",
  },
  feedbackOptionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  selectedFeedbackOptionText: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  saveButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
  },
});
