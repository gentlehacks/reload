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
      try {
        const hasSeen = await getHasSeenOnboarding();
        if (cancelled) return;
        router.replace(hasSeen ? "/network" : "/onboarding");
      } catch (e: unknown) {
        // #region agent log
        fetch("http://127.0.0.1:7379/ingest/f5079690-0574-49ac-a670-49bd5e2524d3", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b71f3c" },
          body: JSON.stringify({
            sessionId: "b71f3c",
            hypothesisId: "H3",
            location: "index.tsx:bootstrap",
            message: "bootstrap error",
            data: { err: e instanceof Error ? e.message : String(e) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        router.replace("/onboarding");
      } finally {
        if (!cancelled) setReady(true);
      }
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
