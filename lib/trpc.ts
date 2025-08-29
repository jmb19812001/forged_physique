import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/routes/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Prefer explicit prod/staging URL
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Native (device/simulator): derive LAN URL from Expo host
  if (Platform.OS !== "web") {
    // Works in Expo Go & dev builds
    const hostUri = (Constants as any).expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost; // legacy
    const host = typeof hostUri === "string" ? hostUri.split(":")[0] : undefined;
    if (host) return `http://${host}:3000`;
    // Fallback to localhost (works on emulators, not physical devices)
    return "http://localhost:3000";
  }

  // Web dev
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
