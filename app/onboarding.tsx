import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { setHasSeenOnboarding } from "../lib/onboardingStorage";
import { colors } from "../utils/colors";

type Slide = {
  key: string;
  title: string;
  body: string;
  icon: keyof typeof Feather.glyphMap;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Onboarding() {
  const slides: Slide[] = useMemo(
    () => [
      {
        key: "scan",
        title: "Scan your recharge card",
        body: "Point your camera at the paper card and we’ll detect the PIN area automatically.",
        icon: "camera",
      },
      {
        key: "extract",
        title: "Extract the PIN instantly",
        body: "We read the digits for you using AI so you don’t have to type long codes by hand.",
        icon: "hash",
      },
      {
        key: "secure",
        title: "Private by design",
        body: "Your PIN stays on your device while we process the image for extraction.",
        icon: "lock",
      },
    ],
    []
  );

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === slides.length - 1;

  async function finish() {
    await setHasSeenOnboarding();
    router.replace("/network");
  }

  function next() {
    const nextIndex = Math.min(index + 1, slides.length - 1);
    listRef.current?.scrollToOffset({ offset: nextIndex * SCREEN_WIDTH, animated: true });
    setIndex(nextIndex);
  }

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(Math.max(0, Math.min(nextIndex, slides.length - 1)));
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient colors={colors.gradientHero} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.brand}>ZexLoad</Text>
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.illustration}>
              <View style={styles.iconWrap}>
                <Feather name={item.icon} size={28} color={colors.primary} />
              </View>
              <View style={styles.cardMock}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardChip} />
                  <View style={styles.cardLine} />
                </View>
                <View style={styles.cardBodyRow}>
                  <View style={styles.cardLineWide} />
                  <View style={styles.pinBox}>
                    <Text style={styles.pinText}>•••• •••• ••••</Text>
                  </View>
                </View>
                <View style={styles.scanBar} />
              </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              if (index === 0) return;
              const prevIndex = Math.max(index - 1, 0);
              listRef.current?.scrollToOffset({
                offset: prevIndex * SCREEN_WIDTH,
                animated: true,
              });
              setIndex(prevIndex);
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.85 },
              index === 0 && { opacity: 0.4 },
            ]}
            disabled={index === 0}
          >
            <Feather name="arrow-left" size={18} color={colors.text} />
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>

          <Pressable
            onPress={isLast ? finish : next}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryText}>{isLast ? "Get started" : "Next"}</Text>
            <Feather name={isLast ? "check" : "arrow-right"} size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: colors.primary,
  },
  skip: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "center",
  },
  illustration: {
    width: "100%",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginBottom: 14,
  },
  cardMock: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    overflow: "hidden",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardChip: {
    width: 34,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  cardLine: {
    height: 10,
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.borderSubtle,
  },
  cardBodyRow: {
    marginTop: 14,
    gap: 12,
  },
  cardLineWide: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.borderSubtle,
  },
  pinBox: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.primaryDeep,
  },
  pinText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: colors.textOnPrimary,
    textAlign: "center",
  },
  scanBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "55%",
    height: 2,
    backgroundColor: "rgba(37, 99, 235, 0.4)",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: 6,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textOnPrimary,
  },
});

