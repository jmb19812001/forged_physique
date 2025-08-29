import { enableScreens } from "react-native-screens";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";

enableScreens();
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/context/AppContext";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import KeyboardDismissOverlay from "@/components/KeyboardDismissOverlay";
import InputAccessoryBar from "@/components/InputAccessoryBar";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-theme";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <StatusBar style="light" />
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              </Stack>
              <KeyboardDismissOverlay />
            </AppProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </GluestackUIProvider>
      <InputAccessoryBar />
    </GestureHandlerRootView>
  );
}
