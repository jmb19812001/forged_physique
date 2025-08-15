import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useMesocycleStore } from "@/hooks/useMesocycleStore";
import { MesoCycle } from "@/types/workout";
import { Calendar, ChevronRight, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MesocyclesScreen() {
  const { mesocycles, getActiveMesocycle } = useMesocycleStore();
  const [activeMeso, setActiveMeso] = useState<MesoCycle | null>(null);

  useEffect(() => {
    const active = getActiveMesocycle();
    if (active) {
      setActiveMeso(active);
    }
  }, [mesocycles]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Mesocycles</Text>
          <Text style={styles.subtitle}>Plan and track your training blocks</Text>
        </View>

        <LinearGradient
          colors={["#2a2a2a", "#1e1e1e"]}
          style={styles.createCard}
        >
          <View style={styles.createCardContent}>
            <Text style={styles.createCardTitle}>Plan a mesocycle</Text>
            <Text style={styles.createCardText}>
              Choose from a preset or design your own from the ground up!
            </Text>
            
            <View style={styles.buttonRow}>
              <Pressable 
                style={[styles.button, styles.presetButton]}
                onPress={() => router.push("/mesocycle/create?type=preset")}
              >
                <Text style={styles.buttonText}>Preset</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.button, styles.customButton]}
                onPress={() => router.push("/mesocycle/create?type=custom")}
              >
                <Text style={styles.buttonText}>Custom</Text>
              </Pressable>
              
              <Pressable style={[styles.button, styles.copyButton]}>
                <Text style={styles.buttonText}>Copy</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {activeMeso && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Mesocycle</Text>
            <Pressable 
              style={styles.mesoCard}
              onPress={() => router.push(`/mesocycle/${activeMeso.meso_id}`)}
            >
              <View style={styles.mesoCardLeft}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
                <Text style={styles.mesoCardTitle}>{activeMeso.meso_name}</Text>
                <Text style={styles.mesoCardSubtitle}>Week 2 of {activeMeso.duration_weeks}</Text>
              </View>
              <ChevronRight size={20} color="#888" />
            </Pressable>
          </View>
        )}

        {mesocycles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Mesocycles</Text>
            {mesocycles.map((meso) => (
              <Pressable 
                key={meso.meso_id}
                style={styles.mesoCard}
                onPress={() => router.push(`/mesocycle/${meso.meso_id}`)}
              >
                <View style={styles.mesoCardLeft}>
                  {meso.is_active && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                  <Text style={styles.mesoCardTitle}>{meso.meso_name}</Text>
                  <Text style={styles.mesoCardSubtitle}>
                    {meso.is_active ? `Week 2 of ${meso.duration_weeks}` : `${meso.duration_weeks} weeks`}
                  </Text>
                </View>
                <ChevronRight size={20} color="#888" />
              </Pressable>
            ))}
          </View>
        )}

        {mesocycles.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={60} color="#888" />
            <Text style={styles.emptyStateTitle}>No Mesocycles Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first training block to get started
            </Text>
            <Pressable 
              style={styles.createButton}
              onPress={() => router.push("/mesocycle/create")}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>CREATE MESOCYCLE</Text>
            </Pressable>
          </View>
        )}
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
  createCard: {
    margin: 20,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createCardContent: {
    padding: 20,
  },
  createCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  createCardText: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  presetButton: {
    backgroundColor: "#e74c3c",
  },
  customButton: {
    backgroundColor: "#333",
  },
  copyButton: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700" as const,
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
  mesoCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mesoCardLeft: {
    flex: 1,
  },
  activeBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  mesoCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  mesoCardSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700" as const,
    marginLeft: 10,
  },
});