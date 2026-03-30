import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";

import { getHasSeenOnboarding } from "../lib/onboardingStorage";
import { colors } from "../utils/colors";

export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const hasSeen = await getHasSeenOnboarding();
      if (cancelled) return;
      router.replace(hasSeen ? "/network" : "/onboarding");
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {!ready && <ActivityIndicator color={colors.primary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
