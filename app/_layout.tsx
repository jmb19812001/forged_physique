import { enableScreens } from "react-native-screens";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

enableScreens();
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/context/AppContext";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <StatusBar style="light" />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}
