import { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, useWindowDimensions } from "react-native";
import { ACCESSORY_ID } from "@/components/InputAccessoryBar";
import { useLocalSearchParams, router } from "expo-router";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { LinearGradient } from "expo-linear-gradient";
import { Checkbox } from "expo-checkbox";
import { Exercise } from "@/types/workout";

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
  maxWidth: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1e1e1e",
  },
  chipActive: {
    backgroundColor: "#e74c3c",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    minWidth: 280,
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
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
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
  selectionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    borderTopColor: "#333",
    borderTopWidth: 1,
    padding: 12,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#333",
    borderRadius: 6,
    marginRight: 10,
  },
  clearText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
});

export default function ExerciseScreen() {
  const { muscleGroups: muscleGroupsJSON, selectedExercises: selectedExercisesJSON, dayName } = useLocalSearchParams<{muscleGroups: string, selectedExercises: string, dayName: string}>();
  const { getExercisesByMuscleGroup } = useExerciseStore();

  const muscleGroups = muscleGroupsJSON ? JSON.parse(muscleGroupsJSON) : [];
  const initialSelected = selectedExercisesJSON ? JSON.parse(selectedExercisesJSON) : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | "All">("All");
  const [equipmentFilter, setEquipmentFilter] = useState<string | "All">("All");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

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

  const allExercises = useMemo(() => muscleGroups.flatMap((mg: string) => getExercisesByMuscleGroup(mg)), [muscleGroups]);
  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    allExercises.forEach((e: Exercise) => { if (e.equipment) set.add(e.equipment); });
    return ["All", ...Array.from(set).sort()];
  }, [allExercises]);
  const filtered = useMemo(() => {
    let list: Exercise[] = allExercises;
    if (activeGroup !== "All") list = list.filter((e: Exercise) => e.primary_muscle_group === activeGroup);
    if (equipmentFilter !== "All") list = list.filter((e: Exercise) => (e.equipment || "") === equipmentFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e: Exercise) => e.name.toLowerCase().includes(q) || (e.equipment || "").toLowerCase().includes(q));
    }
    return list;
  }, [allExercises, activeGroup, equipmentFilter, query]);
  const groupsToRender = useMemo((): { group: string; items: Exercise[] }[] => {
    const groups = new Map<string, Exercise[]>();
    filtered.forEach((e: Exercise) => {
      const key = e.primary_muscle_group;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    });
    const keys = activeGroup === "All" ? muscleGroups : [activeGroup];
    return keys.filter((k: string) => groups.has(k)).map((k: string) => ({ group: k, items: groups.get(k)! }));
  }, [filtered, activeGroup, muscleGroups]);

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
        <LinearGradient colors={["#2a2a2a", "#1e1e1e"]} style={[styles.header, styles.maxWidth]}>
          <Text style={styles.title}>Select Exercises for {dayName}</Text>
        </LinearGradient>
        <View style={[styles.controls, styles.maxWidth]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises or equipment"
            placeholderTextColor="#888"
            style={styles.searchInput}
            returnKeyType="search"
            inputAccessoryViewID={ACCESSORY_ID}
          />
          <View style={styles.chipsRow}>
            <Pressable
              style={[styles.chip, activeGroup === "All" && styles.chipActive]}
              onPress={() => setActiveGroup("All")}
            >
              <Text style={styles.chipText}>All</Text>
            </Pressable>
            {muscleGroups.map((mg: string) => (
              <Pressable
                key={mg}
                style={[styles.chip, activeGroup === mg && styles.chipActive]}
                onPress={() => setActiveGroup(mg)}
              >
                <Text style={styles.chipText}>{mg}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipsRow}>
            {equipmentOptions.map(opt => (
              <Pressable key={opt} style={[styles.chip, equipmentFilter === opt && styles.chipActive]} onPress={() => setEquipmentFilter(opt)}>
                <Text style={styles.chipText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.maxWidth, { paddingHorizontal: 10 }]}>
          {groupsToRender.map(({ group, items }) => {
            const isCollapsed = !!collapsed[group];
            const visibleItems = items; // already filtered
            const selectAll = () =>
              setSelected(prev =>
                Array.from(new Set([...prev, ...visibleItems.map((i: Exercise) => i.exercise_id)]))
              );
            const clearAll = () =>
              setSelected(prev =>
                prev.filter(id => !visibleItems.some((i: Exercise) => i.exercise_id === id))
              );
            return (
              <View key={group}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 8 }}>
                  <Pressable onPress={() => setCollapsed(prev => ({ ...prev, [group]: !prev[group] }))}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{group} • {items.length}</Text>
                  </Pressable>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable style={styles.clearButton} onPress={clearAll}><Text style={styles.clearText}>Clear</Text></Pressable>
                    <Pressable style={styles.doneButton} onPress={selectAll}><Text style={styles.doneButtonText}>Select All</Text></Pressable>
                  </View>
                </View>
                {!isCollapsed && (
                  <View style={[styles.list, { justifyContent: isWide ? "flex-start" : "center" }]}>
                    {items.map((exercise: Exercise) => (
                      <Pressable key={exercise.exercise_id} style={[styles.exerciseCard, { maxWidth: isWide ? "48%" : "100%" }]} onPress={() => toggleExercise(exercise.exercise_id)}>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <Text style={styles.exerciseEquipment}>{exercise.equipment} • {exercise.primary_muscle_group}</Text>
                          {Array.isArray((exercise as any).target_muscles) && (exercise as any).target_muscles.length > 0 && (
                            <Text style={styles.exerciseEquipment}>
                              Targets: {(exercise as any).target_muscles.slice(0,3).join(', ')}
                            </Text>
                          )}
                        </View>
                        <Checkbox
                          value={selected.includes(exercise.exercise_id)}
                          onValueChange={() => toggleExercise(exercise.exercise_id)}
                          color="#e74c3c"
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.selectionBar, styles.maxWidth, { alignSelf: "center" } ]}>
        <View style={styles.selectionRow}>
          <Text style={styles.selectionText}>{selected.length} selected</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable style={styles.clearButton} onPress={() => setSelected([])}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
