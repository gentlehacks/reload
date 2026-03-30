import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../utils/colors";

export default function Home() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradientHero} style={StyleSheet.absoluteFill} />
      <Text style={styles.title}>Ready to scan</Text>
      <Text style={styles.subtitle}>
        Next we’ll add the camera scanner to extract your recharge PIN.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});

