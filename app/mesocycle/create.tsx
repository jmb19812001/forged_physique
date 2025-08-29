import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Switch, Alert, Keyboard, useWindowDimensions, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { useWorkoutStore } from "@/hooks/useWorkoutStore";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import SelectField from "@/components/SelectField";
import { defaultWorkoutTemplates } from "@/data/workoutTemplates";
import { ACCESSORY_ID } from "@/components/InputAccessoryBar";
// Removed local draft persistence; using server-backed drafts via tRPC
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function CreateMesocycleScreen() {
  const { type = "preset", selectedExercises, dayName: dayNameParam } = useLocalSearchParams<{selectedExercises?: string, dayName?: string, type?: string}>();
  const { createMesocycle, mesocycles } = useMesocycleStore();
  const { getMuscleGroups, getExerciseById } = useExerciseStore();
  const { createWorkoutDaysForMesocycle } = useWorkoutStore();
  
  const [mesoName, setMesoName] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [startDay, setStartDay] = useState("Monday");
  const templateNames = defaultWorkoutTemplates.map(t => t.name);
  const [selectedPreset, setSelectedPreset] = useState(templateNames[0] || "");
  const [workoutDays, setWorkoutDays] = useState<{ dayName: string, enabled: boolean, muscleGroups: { name: string, enabled: boolean }[], exercise_ids: string[] }[]>([
    { dayName: "Monday", enabled: true, muscleGroups: [], exercise_ids: [] },
    { dayName: "Wednesday", enabled: true, muscleGroups: [], exercise_ids: [] },
    { dayName: "Friday", enabled: true, muscleGroups: [], exercise_ids: [] },
  ]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [serverDraftApplied, setServerDraftApplied] = useState(false);
  const { user } = useAuth();

  // Server draft hooks
  const draftsGet = trpc.drafts.get.useQuery(
    user ? { user_id: user.user_id } : (undefined as any),
    { enabled: !!user }
  );
  const draftsSet = trpc.drafts.set.useMutation();
  const draftsClear = trpc.drafts.clear.useMutation();
  const mesoCreate = trpc.mesocycles.create.useMutation();
  const saveDays = trpc.workoutDays.saveForMesocycle.useMutation();
  
  const muscleGroups = getMuscleGroups();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  // No local draft load

  // Load server draft once (or mark loaded if none)
  useEffect(() => {
    if (!user) return;
    if (serverDraftApplied) return;
    const row = draftsGet.data;
    if (!draftsGet.isFetched) return;
    try {
      if (row) {
        const draft = JSON.parse(row.draft);
        if (Array.isArray(draft.workoutDays)) setWorkoutDays(draft.workoutDays);
        if (typeof draft.mesoName === "string") setMesoName(draft.mesoName);
        if (typeof draft.durationWeeks === "string") setDurationWeeks(draft.durationWeeks);
        if (typeof draft.daysPerWeek === "string") setDaysPerWeek(draft.daysPerWeek);
        if (typeof draft.startDay === "string") setStartDay(draft.startDay);
        if (typeof draft.selectedPreset === "string") setSelectedPreset(draft.selectedPreset);
        if (draft.sex === "male" || draft.sex === "female") setSex(draft.sex);
      }
      setServerDraftApplied(true);
      setDraftLoaded(true);
    } catch {}
  }, [user, draftsGet.data, draftsGet.isFetched, serverDraftApplied]);

  const getSuggestedName = (base: string) => {
    const existing = mesocycles
      .map(m => (typeof m.meso_name === 'string' ? m.meso_name.trim().toLowerCase() : ''))
      .filter(Boolean);
    const b = base.trim();
    if (!b) return "";
    const lower = b.toLowerCase();
    if (!existing.includes(lower)) return b;
    let n = 2;
    while (existing.includes(`${lower} (${n})`)) n++;
    return `${b} (${n})`;
  };
  const nameExists = (() => {
    const n = mesoName.trim().toLowerCase();
    if (!n) return false;
    return mesocycles.some(m => {
      const name = typeof m.meso_name === 'string' ? m.meso_name.trim().toLowerCase() : '';
      return !!name && name === n;
    });
  })();

  const getNextAvailableDay = (usedDays: string[], start: string) => {
    const startIdx = daysOfWeek.indexOf(start as any);
    for (let i = 0; i < daysOfWeek.length; i++) {
      const name = daysOfWeek[(startIdx + i) % 7];
      if (!usedDays.includes(name)) return name;
    }
    return null;
  };

  useEffect(() => {
    if (!draftLoaded) return;
    setWorkoutDays(prev => prev.map(day => {
      const existing = new Map((day.muscleGroups || []).map(m => [m.name, m.enabled] as const));
      const merged = muscleGroups.map(mg => {
        const prevEnabled = existing.get(mg);
        if (prevEnabled !== undefined) {
          return { name: mg, enabled: prevEnabled };
        }
        // Defaults only for first-time init per day
        const defaultOn = day.enabled && (mg === "Chest" || mg === "Back" || mg === "Legs");
        return { name: mg, enabled: defaultOn };
      });
      // Avoid unnecessary state updates
      const changed = merged.length !== day.muscleGroups.length || merged.some((m, i) => {
        const d = day.muscleGroups[i];
        return !d || d.name !== m.name || d.enabled !== m.enabled;
      });
      return changed ? { ...day, muscleGroups: merged } : day;
    }));
  }, [draftLoaded, muscleGroups.join(",")]);
  // Persist draft to server when key fields change (after initial load)
  useEffect(() => {
    if (!draftLoaded) return;
    const draft = {
      workoutDays,
      mesoName,
      durationWeeks,
      daysPerWeek,
      startDay,
      selectedPreset,
      sex,
    };
    if (user) {
      draftsSet.mutate({ user_id: user.user_id, draft });
    }
  }, [draftLoaded, workoutDays, mesoName, durationWeeks, daysPerWeek, startDay, selectedPreset, sex]);

  // Apply selection returned from the exercise screen AFTER draft has loaded
  useEffect(() => {
    if (!draftLoaded) return;
    if (selectedExercises && dayNameParam) {
      const newExerciseIds = JSON.parse(selectedExercises);
      setWorkoutDays(prev =>
        prev.map(day =>
          day.dayName === dayNameParam ? { ...day, exercise_ids: newExerciseIds } : day
        )
      );
    }
  }, [draftLoaded, selectedExercises, dayNameParam]);

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
      
      // Keep local store updated for now
      const newMesocycle = await createMesocycle(params);
      // Save to server as well
      if (user) {
        const serverMeso = await mesoCreate.mutateAsync({
          user_id: user.user_id,
          meso_name: params.meso_name,
          duration_weeks: params.duration_weeks,
          start_date: new Date().toISOString(),
        });
        // Map workoutDays to server format
        const dayIndex = (name: string) => daysOfWeek.indexOf(name as any) + 1;
        const daysPayload = (workoutDays || []).map(d => ({
          // omit day_id to let backend assign UUIDs
          day_name: d.dayName,
          day_of_week: dayIndex(d.dayName),
          exercise_ids: d.exercise_ids || [],
        }));
        await saveDays.mutateAsync({ meso_id: serverMeso.meso_id, days: daysPayload });
        // Clear server draft
        await draftsClear.mutateAsync({ user_id: user.user_id });
      }
      
      // Create workout days for the new mesocycle
      await createWorkoutDaysForMesocycle(newMesocycle, workoutDays, params);
      
      // Clear server draft after successful creation
      if (user) { try { await draftsClear.mutateAsync({ user_id: user.user_id }); } catch {} }

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
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create mesocycle. Please try again.");
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
    const usedDays = workoutDays.map(d => d.dayName);
    if (usedDays.length >= 7) {
      Alert.alert("Limit Reached", "You already have 7 days. Remove one before adding more.");
      return;
    }
    const nextDay = getNextAvailableDay(usedDays, startDay);
    if (!nextDay) {
      Alert.alert("No Days Available", "All days of the week are already in use.");
      return;
    }

    const newDay = { dayName: nextDay, enabled: true, muscleGroups: muscleGroups.map(mg => ({ name: mg, enabled: false })), exercise_ids: [] };

    const sortedDays = [...workoutDays, newDay].sort((a, b) => {
      const aIdx = daysOfWeek.indexOf(a.dayName as any);
      const bIdx = daysOfWeek.indexOf(b.dayName as any);
      return aIdx - bIdx;
    });

    setWorkoutDays(sortedDays);
    const newCount = Math.min(7, parseInt(daysPerWeek) + 1);
    setDaysPerWeek(newCount.toString());
  };

  const handleStartDayChange = (newStartDay: string) => {
    setStartDay(newStartDay);

    const count = workoutDays.length;
    if (count === 0) return;

    const startIdx = daysOfWeek.indexOf(newStartDay as any);
    // Use current spacing between days and rebase to new start
    const sortedByCurrent = [...workoutDays].sort((a, b) => daysOfWeek.indexOf(a.dayName as any) - daysOfWeek.indexOf(b.dayName as any));
    const currentIndices = sortedByCurrent.map(d => daysOfWeek.indexOf(d.dayName as any)).filter(i => i >= 0);
    if (currentIndices.length === 0) return;
    const base = currentIndices[0];
    const offsets = currentIndices.map(i => (i - base + 7) % 7);
    const newNames = offsets.map(off => daysOfWeek[(startIdx + off) % 7]);

    const remapped = sortedByCurrent.map((day, i) => ({ ...day, dayName: newNames[i] }));
    setWorkoutDays(remapped);
  };

  const removeDay = (index: number) => {
    const performRemove = () => {
      setWorkoutDays(prev => prev.filter((_, i) => i !== index));
      const newCount = Math.max(0, parseInt(daysPerWeek) - 1);
      setDaysPerWeek(newCount.toString());
    };

    // On web, Alert actions are not reliable; remove immediately
    if (Platform.OS === "web") {
      performRemove();
      return;
    }

    const day = workoutDays[index];
    Alert.alert(
      "Remove Day",
      `Remove ${day.dayName} from your plan?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: performRemove }
      ]
    );
  };

  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={["#2a2a2a", "#1e1e1e"]}
        style={[styles.header, styles.maxWidth]}
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

      <View style={[styles.formSection, styles.maxWidth]}>
        <Text style={styles.sectionTitle}>
          {type === "preset" ? "Preset meso" : "Custom meso"}
        </Text>
        <View style={[styles.formGrid, isWide ? styles.formGridWide : undefined]}>
          <View style={[styles.inputContainer, isWide && styles.gridItem]}>
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

          <View style={[styles.inputContainer, isWide && styles.gridItem]}>
            <SelectField
              label="What day of the week will you begin your meso?"
              value={startDay}
              options={["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]}
              onSelect={handleStartDayChange}
            />
          </View>

          {type === "preset" && (
            <View style={[styles.inputContainer, isWide && styles.gridItem]}>
              <SelectField
                label="Preset"
                value={selectedPreset}
                options={templateNames}
                onSelect={setSelectedPreset}
              />
            </View>
          )}
        
          {type === "custom" && (
          <View style={[styles.inputContainer, isWide && styles.gridItem]}>
            <Text style={styles.inputLabel}>How many days per week?</Text>
            <TextInput
              style={styles.input}
              value={daysPerWeek}
              onChangeText={setDaysPerWeek}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="#888"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              inputAccessoryViewID={ACCESSORY_ID}
            />
          </View>
        )}
        
          <View style={[styles.inputContainer, isWide && styles.gridItem]}>
            <Text style={styles.inputLabel}>Mesocycle Name</Text>
            <TextInput
              style={styles.input}
              value={mesoName}
              onChangeText={setMesoName}
              placeholder="My 5-Day Split"
              placeholderTextColor="#888"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              inputAccessoryViewID={ACCESSORY_ID}
            />
            {nameExists && (
              <View style={styles.nameWarningRow}>
                <Text style={styles.nameWarning}>Name already exists.</Text>
                <Pressable onPress={() => setMesoName(getSuggestedName(mesoName))} style={styles.suggestButton}>
                  <Text style={styles.suggestText}>Use "{getSuggestedName(mesoName)}"</Text>
                </Pressable>
              </View>
            )}
          </View>
        
          <View style={[styles.inputContainer, isWide && styles.gridItem]}>
            <Text style={styles.inputLabel}>Duration (weeks)</Text>
            <TextInput
              style={styles.input}
              value={durationWeeks}
              onChangeText={setDurationWeeks}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor="#888"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              inputAccessoryViewID={ACCESSORY_ID}
            />
          </View>
        </View>
      </View>

      {type === "custom" && (
        <View style={[styles.formSection, styles.maxWidth]}>
          <Text style={styles.sectionTitle}>Workout Days</Text>
          
          {workoutDays.map((day, dayIndex) => (
            <View key={day.dayName} style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayCardTitle}>{day.dayName}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    accessibilityLabel={`Remove ${day.dayName}`}
                    onPress={() => removeDay(dayIndex)}
                    style={styles.removeDayButton}
                  >
                    <Trash2 size={16} color="#e74c3c" />
                  </Pressable>
                  <Switch
                    value={day.enabled}
                    onValueChange={() => toggleDayEnabled(dayIndex)}
                    trackColor={{ false: "#333", true: "#e74c3c" }}
                    thumbColor="#fff"
                  />
                </View>
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
                    onPress={async () => {
                      // Ensure latest draft is saved to server before navigating
                      if (user) {
                        const draft = {
                          workoutDays,
                          mesoName,
                          durationWeeks,
                          daysPerWeek,
                          startDay,
                          selectedPreset,
                          sex,
                        };
                        try { await draftsSet.mutateAsync({ user_id: user.user_id, draft }); } catch {}
                      }
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
          
          {workoutDays.length < 7 && (
            <Pressable style={styles.addDayButton} onPress={addNewDay}>
              <Plus size={20} color="#fff" />
              <Text style={styles.addDayButtonText}>ADD DAY</Text>
            </Pressable>
          )}
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 20,
  },
  maxWidth: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
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
  formGrid: {
    gap: 20,
  },
  formGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
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
  removeDayButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
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
  nameWarningRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameWarning: {
    color: "#e74c3c",
    fontSize: 12,
  },
  suggestButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  suggestText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
});


