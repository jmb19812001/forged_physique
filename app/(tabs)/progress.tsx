import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useProgressStore } from "@/hooks/useProgressStore";
import { useExerciseStore } from "@/hooks/useExerciseStore";
import { Exercise } from "@/types/workout";
import { BarChart2, ChevronDown, TrendingUp } from "lucide-react-native";

export default function ProgressScreen() {
  const { getEstimated1RM, getPersonalRecords, getAverageSetsByMuscleGroup } = useProgressStore();
  const { exercises } = useExerciseStore();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  const muscleGroups = getAverageSetsByMuscleGroup();
  const personalRecords = getPersonalRecords();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your gains over time</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated 1RM Progress</Text>
        
        <Pressable 
          style={styles.exerciseSelector}
          onPress={() => setShowExerciseDropdown(!showExerciseDropdown)}
        >
          <Text style={styles.exerciseSelectorText}>
            {selectedExercise ? selectedExercise.name : "Select an exercise"}
          </Text>
          <ChevronDown size={20} color="#888" />
        </Pressable>
        
        {showExerciseDropdown && (
          <View style={styles.exerciseDropdown}>
            {exercises.slice(0, 5).map((exercise) => (
              <Pressable
                key={exercise.exercise_id}
                style={styles.exerciseDropdownItem}
                onPress={() => {
                  setSelectedExercise(exercise);
                  setShowExerciseDropdown(false);
                }}
              >
                <Text style={styles.exerciseDropdownText}>{exercise.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        
        {selectedExercise ? (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{selectedExercise.name}</Text>
              <Text style={styles.chartSubtitle}>Estimated 1RM (lbs)</Text>
            </View>
            
            <View style={styles.chart}>
              <View style={styles.chartYAxis}>
                <Text style={styles.chartYAxisLabel}>300</Text>
                <Text style={styles.chartYAxisLabel}>250</Text>
                <Text style={styles.chartYAxisLabel}>200</Text>
                <Text style={styles.chartYAxisLabel}>150</Text>
                <Text style={styles.chartYAxisLabel}>100</Text>
              </View>
              
              <View style={styles.chartContent}>
                <View style={[styles.chartBar, { height: 100 }]} />
                <View style={[styles.chartBar, { height: 120 }]} />
                <View style={[styles.chartBar, { height: 150 }]} />
                <View style={[styles.chartBar, { height: 140 }]} />
                <View style={[styles.chartBar, { height: 180 }]} />
              </View>
            </View>
            
            <View style={styles.chartXAxis}>
              <Text style={styles.chartXAxisLabel}>Week 1</Text>
              <Text style={styles.chartXAxisLabel}>Week 2</Text>
              <Text style={styles.chartXAxisLabel}>Week 3</Text>
              <Text style={styles.chartXAxisLabel}>Week 4</Text>
              <Text style={styles.chartXAxisLabel}>Week 5</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <TrendingUp size={40} color="#888" />
            <Text style={styles.emptyChartText}>Select an exercise to view progress</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Average Sets per Muscle Group</Text>
        
        <View style={styles.barChartContainer}>
          <View style={styles.barChart}>
            <View style={styles.barChartYAxis}>
              <Text style={styles.barChartYAxisLabel}>20</Text>
              <Text style={styles.barChartYAxisLabel}>15</Text>
              <Text style={styles.barChartYAxisLabel}>10</Text>
              <Text style={styles.barChartYAxisLabel}>5</Text>
              <Text style={styles.barChartYAxisLabel}>0</Text>
            </View>
            
            <View style={styles.barChartContent}>
              <View style={styles.barChartColumn}>
                <View style={[styles.barChartBar, { height: 80 }]} />
                <Text style={styles.barChartXAxisLabel}>Chest</Text>
              </View>
              <View style={styles.barChartColumn}>
                <View style={[styles.barChartBar, { height: 120 }]} />
                <Text style={styles.barChartXAxisLabel}>Back</Text>
              </View>
              <View style={styles.barChartColumn}>
                <View style={[styles.barChartBar, { height: 100 }]} />
                <Text style={styles.barChartXAxisLabel}>Legs</Text>
              </View>
              <View style={styles.barChartColumn}>
                <View style={[styles.barChartBar, { height: 60 }]} />
                <Text style={styles.barChartXAxisLabel}>Shoulders</Text>
              </View>
              <View style={styles.barChartColumn}>
                <View style={[styles.barChartBar, { height: 40 }]} />
                <Text style={styles.barChartXAxisLabel}>Arms</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Records</Text>
        
        <View style={styles.prContainer}>
          <View style={styles.prCard}>
            <Text style={styles.prExercise}>Barbell Bench Press</Text>
            <View style={styles.prDetails}>
              <View style={styles.prDetail}>
                <Text style={styles.prValue}>225</Text>
                <Text style={styles.prLabel}>lbs</Text>
              </View>
              <Text style={styles.prReps}>x 5 reps</Text>
            </View>
            <Text style={styles.prDate}>July 5, 2025</Text>
          </View>
          
          <View style={styles.prCard}>
            <Text style={styles.prExercise}>Barbell Squat</Text>
            <View style={styles.prDetails}>
              <View style={styles.prDetail}>
                <Text style={styles.prValue}>315</Text>
                <Text style={styles.prLabel}>lbs</Text>
              </View>
              <Text style={styles.prReps}>x 3 reps</Text>
            </View>
            <Text style={styles.prDate}>July 8, 2025</Text>
          </View>
          
          <View style={styles.prCard}>
            <Text style={styles.prExercise}>Deadlift</Text>
            <View style={styles.prDetails}>
              <View style={styles.prDetail}>
                <Text style={styles.prValue}>365</Text>
                <Text style={styles.prLabel}>lbs</Text>
              </View>
              <Text style={styles.prReps}>x 1 rep</Text>
            </View>
            <Text style={styles.prDate}>July 10, 2025</Text>
          </View>
        </View>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
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
  exerciseSelector: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  exerciseSelectorText: {
    color: "#fff",
    fontSize: 16,
  },
  exerciseDropdown: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  exerciseDropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  exerciseDropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  chartContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
  },
  chartHeader: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  chart: {
    height: 200,
    flexDirection: "row",
  },
  chartYAxis: {
    width: 40,
    height: "100%",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  chartYAxisLabel: {
    color: "#888",
    fontSize: 12,
  },
  chartContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  chartBar: {
    width: 20,
    backgroundColor: "#e74c3c",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  chartXAxisLabel: {
    color: "#888",
    fontSize: 12,
  },
  emptyChart: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    color: "#888",
    fontSize: 16,
    marginTop: 15,
  },
  barChartContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
  },
  barChart: {
    height: 220,
    flexDirection: "row",
  },
  barChartYAxis: {
    width: 40,
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  barChartYAxisLabel: {
    color: "#888",
    fontSize: 12,
  },
  barChartContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  barChartColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 200,
  },
  barChartBar: {
    width: 30,
    backgroundColor: "#e74c3c",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barChartXAxisLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 10,
  },
  prContainer: {
    marginTop: 10,
  },
  prCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  prDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  prDetail: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 10,
  },
  prValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#e74c3c",
  },
  prLabel: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  prReps: {
    fontSize: 16,
    color: "#aaa",
  },
  prDate: {
    fontSize: 12,
    color: "#888",
  },
});