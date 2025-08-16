import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/context/AppContext";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* ...existing code... */}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerBackTitle: "Back",
                headerStyle: {
                  backgroundColor: "#121212",
                },
                headerTintColor: "#fff",
                contentStyle: {
                  backgroundColor: "#121212",
                },
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="workout/[dayId]"
                options={{
                  title: "Workout",
                  headerTitleStyle: {
                    color: "#fff",
                  },
                }}
              />
              <Stack.Screen
                name="mesocycle/create"
                options={{
                  title: "Create Mesocycle",
                  headerTitleStyle: {
                    color: "#fff",
                  },
                }}
              />
              <Stack.Screen
                name="mesocycle/[mesoId]"
                options={{
                  title: "Mesocycle Details",
                  headerTitleStyle: {
                    color: "#fff",
                  },
                }}
              />
              <Stack.Screen
                name="exercise/[exerciseId]"
                options={{
                  title: "Exercise Details",
                  headerTitleStyle: {
                    color: "#fff",
                  },
                }}
              />
            </Stack>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}
