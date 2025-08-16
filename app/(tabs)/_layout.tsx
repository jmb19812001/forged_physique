import React from "react";
import { Tabs } from "expo-router";
import { Dumbbell, Home, LineChart, User, Shield } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#e74c3c",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#1a1a1a",
          borderTopColor: "#333",
        },
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTitleStyle: {
          color: "#fff",
        },
        headerTintColor: "#fff",
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mesocycles"
        options={{
          title: "Mesocycles",
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <LineChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {user && user.email === "admin@example.com" && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}