// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { trpc, trpcClient } from "@/lib/trpc";
import { ChatProvider } from "@/lib/chat-context";
import { ConsciousnessProvider } from "@/lib/consciousness-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[conversationId]" options={{ 
        headerShown: false,
        presentation: "modal"
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ChatProvider>
          <ConsciousnessProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="light" backgroundColor="#2c003e" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ConsciousnessProvider>
        </ChatProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
