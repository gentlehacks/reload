import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

import { formatPin } from "../lib/pin";
import { getNetworkById } from "../lib/networks";
import { colors } from "../utils/colors";

function buildUssd(prefix: string, pinDigits: string) {
  const pin = (pinDigits ?? "").replace(/\D+/g, "");
  return `${prefix}${pin}#`;
}

export default function Result() {
  const params = useLocalSearchParams<{ network?: string; pin?: string; raw?: string }>();
  const network = useMemo(() => getNetworkById(params.network), [params.network]);
  const pinDigits = (params.pin ?? "").toString();
  const formatted = formatPin(pinDigits);
  const ussd = network ? buildUssd(network.ussdPrefix, pinDigits) : "";

  const [copied, setCopied] = useState(false);

  async function copy() {
    const digits = pinDigits.replace(/\D+/g, "");
    if (!digits) return;
    await Clipboard.setStringAsync(digits);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function load() {
    if (!network) {
      router.replace("/network");
      return;
    }
    const digits = pinDigits.replace(/\D+/g, "");
    if (!digits) return;

    const telUrl = `tel:${encodeURIComponent(ussd)}`;
    const can = await Linking.canOpenURL(telUrl);
    if (!can) {
      Alert.alert("Cannot dial", "Your device can’t dial USSD from this app. You can copy the PIN instead.");
      return;
    }
    await Linking.openURL(telUrl);
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={colors.gradientHero} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.topBtn}>
          <Feather name="arrow-left" size={20} color={colors.primary} />
        </Pressable>
        <Text style={styles.topTitle}>Result</Text>
        <Pressable
          onPress={() => router.replace({ pathname: "/scan", params: { network: network?.id } })}
          hitSlop={12}
          style={styles.topBtn}
        >
          <Feather name="refresh-ccw" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.netRow}>
              <View
                style={[
                  styles.netDot, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
                  { backgroundColor: network?.accent ?? "rgba(15,23,42,0.25)" },
                ]}
              >
                <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center'}}>{network?.shortName.toUpperCase()}</Text>
              </View>
              <Text style={styles.netName}>{network?.name ?? "Network"}</Text>
            </View>
            <Text style={styles.cardHint}>Detected recharge PIN</Text>
          </View>

          <View style={styles.pinBox}>
            <Text style={styles.pinText}>{formatted || "—"}</Text>
          </View>

          {network ? (
            <Text style={styles.ussdPreview}>
              Load code: <Text style={styles.ussdMono}>{ussd}</Text>
            </Text>
          ) : (
            <Text style={styles.ussdPreview}>Choose a network to enable “Load”.</Text>
          )}

          <View style={styles.actions}>
            <Pressable onPress={copy} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}>
              <Feather name={copied ? "check" : "copy"} size={18} color={colors.primary} />
              <Text style={styles.secondaryText}>{copied ? "Copied" : "Copy"}</Text>
            </Pressable>

            <Pressable
              onPress={load}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
              disabled={!network || !pinDigits}
            >
              <Feather name="phone-call" size={18} color={colors.textOnPrimary} />
              <Text style={styles.primaryText}>Load</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryTitle}>If the PIN looks wrong</Text>
          <Text style={styles.secondaryBody}>
            Try scanning again closer, avoid glare, and make sure the scratch area is fully revealed.
          </Text>
          <Pressable
            onPress={() => router.replace({ pathname: "/scan", params: { network: network?.id } })}
            style={({ pressed }) => [styles.secondaryCta, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.secondaryCtaText}>Rescan</Text>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, gap: 14 },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardHeader: { marginBottom: 12 },
  netRow: { flexDirection: "column", alignItems: "center", gap: 10, marginBottom:12, justifyContent: 'center' },
  netDot: { width: 50, height: 50, borderRadius: 15 },
  netName: { fontSize: 16, fontWeight: "900", color: colors.text },
  cardHint: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  pinBox: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: colors.primaryDeep,
    alignItems: "center",
  },
  pinText: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  ussdPreview: { marginTop: 12, fontSize: 13, color: colors.textSecondary },
  ussdMono: { fontWeight: "900", color: colors.primaryDark },
  actions: { flexDirection: "row", gap: 12, marginTop: 25 },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryText: { fontSize: 15, fontWeight: "900", color: colors.text },
  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryText: { fontSize: 15, fontWeight: "900", color: colors.textOnPrimary },
  secondaryCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryTitle: { fontSize: 14.5, fontWeight: "900", color: colors.text },
  secondaryBody: { marginTop: 6, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  secondaryCta: {
    marginTop: 12,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryCtaText: { fontSize: 14.5, fontWeight: "900", color: colors.primaryDark },
});

