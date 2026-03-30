import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NETWORKS, type Network } from "../lib/networks";
import { colors } from "../utils/colors";

function NetworkCard({ item, onPress }: { item: Network; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.badge, { backgroundColor: item.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>{item.shortName.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>Tap to scan a recharge card</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.primary} />
    </Pressable>
  );
}

export default function NetworkSelect() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={colors.gradientHero} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Choose network</Text>
        <Text style={styles.subtitle}>
          Select the network you want to load airtime for
        </Text>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={NETWORKS as Network[]}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NetworkCard
            item={item}
            onPress={() => router.push({ pathname: "/scan", params: { network: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.footer}>
        <View style={styles.tip}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={styles.tipText}>
            Make sure the PIN digits are well-lit and in focus for best results.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: colors.textSecondary,
    maxWidth: 340,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  card: {
    height: 72,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  cardSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  footer: { paddingHorizontal: 20, paddingBottom: 18, marginBottom: 10 },
  tip: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tipText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});

