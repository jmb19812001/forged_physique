import { ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { MesoCycle, MesocycleCreateParams } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";
import { generateId } from "@/utils/helpers";

interface MesocycleContextType {
  mesocycles: MesoCycle[];
  isLoading: boolean;
  createMesocycle: (params: MesocycleCreateParams) => Promise<MesoCycle>;
  getMesocycleById: (id: string) => MesoCycle | undefined;
  getActiveMesocycle: () => MesoCycle | undefined;
  setActiveMesocycle: (id: string) => Promise<void>;
  updateMesocycle: (id: string, updates: Partial<Pick<MesoCycle, 'meso_name' | 'duration_weeks' | 'start_date'>>) => Promise<MesoCycle>;
  deleteMesocycle: (id: string) => Promise<void>;
}

export const [MesocycleProvider, useMesocycleStore] = createContextHook<MesocycleContextType>(() => {
  const [mesocycles, setMesocycles] = useState<MesoCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load mesocycles from AsyncStorage
    const loadMesocycles = async () => {
      if (!user) {
        setMesocycles([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const mesocyclesJson = await AsyncStorage.getItem(`mesocycles_${user.user_id}`);
        if (mesocyclesJson) {
          setMesocycles(JSON.parse(mesocyclesJson));
        }
      } catch (error) {
        console.error("Failed to load mesocycles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMesocycles();
  }, [user]);

  const saveMesocycles = async (updatedMesocycles: MesoCycle[]) => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`mesocycles_${user.user_id}`, JSON.stringify(updatedMesocycles));
      setMesocycles(updatedMesocycles);
    } catch (error) {
      console.error("Failed to save mesocycles:", error);
      throw error;
    }
  };

  const createMesocycle = async (params: MesocycleCreateParams) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Enforce unique name per user (case-insensitive)
      const nameLower = params.meso_name.trim().toLowerCase();
      const duplicate = mesocycles.some(m => m.meso_name.trim().toLowerCase() === nameLower);
      if (duplicate) {
        throw new Error("Mesocycle name already exists. Please choose a unique name.");
      }
      // Deactivate any currently active mesocycle
      const updatedMesocycles = mesocycles.map(meso => ({
        ...meso,
        is_active: false
      }));
      
      // Create new mesocycle
      const newMesocycle: MesoCycle = {
        meso_id: generateId(),
        user_id: user.user_id,
        meso_name: params.meso_name,
        start_date: new Date().toISOString(),
        duration_weeks: params.duration_weeks,
        is_active: true,
      };
      
      updatedMesocycles.push(newMesocycle);
      await saveMesocycles(updatedMesocycles);
      
      // Note: Workout days creation will be handled separately in the component
      // to avoid circular dependency issues with useWorkoutStore
      
      return newMesocycle;
    } catch (error) {
      console.error("Failed to create mesocycle:", error);
      throw error;
    }
  };

  const getMesocycleById = (id: string) => {
    return mesocycles.find(meso => meso.meso_id === id);
  };

  const getActiveMesocycle = () => {
    return mesocycles.find(meso => meso.is_active);
  };

  const setActiveMesocycle = async (id: string) => {
    try {
      const updatedMesocycles = mesocycles.map(meso => ({
        ...meso,
        is_active: meso.meso_id === id
      }));
      
      await saveMesocycles(updatedMesocycles);
    } catch (error) {
      console.error("Failed to set active mesocycle:", error);
      throw error;
    }
  };

  const updateMesocycle = async (id: string, updates: Partial<Pick<MesoCycle, 'meso_name' | 'duration_weeks' | 'start_date'>>) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const target = mesocycles.find(m => m.meso_id === id);
      if (!target) throw new Error("Mesocycle not found");

      if (updates.meso_name) {
        const nameLower = updates.meso_name.trim().toLowerCase();
        const duplicate = mesocycles.some(m => m.meso_id !== id && m.meso_name.trim().toLowerCase() === nameLower);
        if (duplicate) throw new Error("Mesocycle name already exists. Please choose a unique name.");
      }

      const updated = mesocycles.map(m => m.meso_id === id ? { ...m, ...updates } as MesoCycle : m);
      await saveMesocycles(updated);
      return updated.find(m => m.meso_id === id)!;
    } catch (error) {
      console.error("Failed to update mesocycle:", error);
      throw error;
    }
  };

  const deleteMesocycle = async (id: string) => {
    try {
      const updatedMesocycles = mesocycles.filter(meso => meso.meso_id !== id);
      await saveMesocycles(updatedMesocycles);
      
      // Also delete related workout days for this meso from AsyncStorage
      if (user) {
        try {
          const key = `workoutDays_${user.user_id}`;
          const daysJson = await AsyncStorage.getItem(key);
          if (daysJson) {
            const days = JSON.parse(daysJson);
            const filtered = days.filter((d: any) => d.meso_id !== id);
            await AsyncStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch (e) {
          console.warn("Failed to delete workout days for mesocycle:", e);
        }
      }
    } catch (error) {
      console.error("Failed to delete mesocycle:", error);
      throw error;
    }
  };

  return {
    mesocycles,
    isLoading,
    createMesocycle,
    getMesocycleById,
    getActiveMesocycle,
    setActiveMesocycle,
    updateMesocycle,
    deleteMesocycle,
  };
});
