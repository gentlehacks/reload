import { Stack } from "expo-router";

import { colors } from "../utils/colors";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "800", color: colors.text },
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.surface },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="network" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen name="result" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
      </Stack>
    <StatusBar barStyle="dark-content" backgroundColor={colors.surface} /></>
 
  );
}
