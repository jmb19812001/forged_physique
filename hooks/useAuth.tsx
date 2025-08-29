import { ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { User } from "@/types/workout";
import { generateId } from "@/utils/helpers";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUnitPreference: (preference: "kg" | "lbs") => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from AsyncStorage on app start
    const loadUser = async () => {
      try {
        // Seed a test user if one doesn't exist
        const usersJson = await AsyncStorage.getItem("users");
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];

        const testUser = users.find(u => u.email === "test@test.com");

        if (!testUser) {
          const newUser: User = {
            user_id: generateId(),
            email: "test@test.com",
            password_hash: "password", // This would be hashed in a real app
            user_name: "Test User",
            unit_preference: "lbs",
          };
          users.push(newUser);
          await AsyncStorage.setItem("users", JSON.stringify(users));
        }

        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would validate against a backend
      // For now, we'll just check if the user exists in AsyncStorage
      const usersJson = await AsyncStorage.getItem("users");
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      const foundUser = users.find(u => u.email === email);

      if (!foundUser || foundUser.password_hash !== password) {
        throw new Error("Invalid credentials");
      }

      // In a real app, we would hash the password and compare securely

      setUser(foundUser);
      await AsyncStorage.setItem("user", JSON.stringify(foundUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, userName: string) => {
    try {
      // In a real app, this would create a user in the backend
      // For now, we'll just store in AsyncStorage
      const usersJson = await AsyncStorage.getItem("users");
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error("User already exists");
      }
      
      const newUser: User = {
        user_id: generateId(),
        email,
        password_hash: password, // In a real app, this would be hashed
        user_name: userName,
        unit_preference: "lbs",
      };
      
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));
      
      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const updateUnitPreference = async (preference: "kg" | "lbs") => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, unit_preference: preference };
      setUser(updatedUser);
      
      // Update in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update in users array
      const usersJson = await AsyncStorage.getItem("users");
      if (usersJson) {
        const users: User[] = JSON.parse(usersJson);
        const updatedUsers = users.map(u => 
          u.user_id === user.user_id ? updatedUser : u
        );
        await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error("Failed to update unit preference:", error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUnitPreference,
  };
});
