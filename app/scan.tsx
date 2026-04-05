import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNetworkById } from "../lib/networks";
import { recognizeTextFromImageUri } from "../lib/ocr";
import { parseRechargePinFromText } from "../lib/pin";
import { colors } from "../utils/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Scan() {
  const params = useLocalSearchParams<{ network?: string }>();
  const network = useMemo(() => getNetworkById(params.network), [params.network]);

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [busy, setBusy] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hint, setHint] = useState("Align the PIN area inside the frame.");

  useEffect(() => {
    if (!network) {
      setHint("Select a network to continue.");
    }
  }, [network]);

  async function captureAndRead() {
    if (!network) {
      router.replace("/network");
      return;
    }
    try {
      // #region agent log
      fetch("http://127.0.0.1:7379/ingest/f5079690-0574-49ac-a670-49bd5e2524d3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b71f3c" },
        body: JSON.stringify({
          sessionId: "b71f3c",
          hypothesisId: "H1",
          location: "scan.tsx:captureAndRead",
          message: "capture start",
          data: { networkId: network.id },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setBusy(true);
      setHint("Capturing…");

      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.9,
        base64: false,
        exif: false,
      });

      if (!photo?.uri) throw new Error("No photo captured.");

      setHint("Optimizing image…");

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1400 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setHint("Reading text (ML Kit)…");
      const ocr = await recognizeTextFromImageUri(manipulated.uri);
      let parsed = parseRechargePinFromText(ocr.text);

      // Fallback pass: some cards are recognized better without resize/compression.
      if (!parsed.pinCandidate) {
        setHint("Retrying OCR…");
        const fallbackOcr = await recognizeTextFromImageUri(photo.uri);
        parsed = parseRechargePinFromText(fallbackOcr.text);
      }

      if (!parsed.pinCandidate) {
        Alert.alert(
          "No PIN found",
          "Try again with better lighting and make sure the PIN digits are clear in the frame."
        );
        setHint("Try again. Keep the PIN sharp and centered.");
        return;
      }

      router.push({
        pathname: "/result",
        params: {
          network: network.id,
          pin: parsed.pinCandidate,
          raw: ocr.text,
        },
      });
      // #region agent log
      fetch("http://127.0.0.1:7379/ingest/f5079690-0574-49ac-a670-49bd5e2524d3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b71f3c" },
        body: JSON.stringify({
          sessionId: "b71f3c",
          hypothesisId: "H1",
          location: "scan.tsx:captureAndRead",
          message: "navigate result ok",
          data: { pinLen: (parsed.pinCandidate ?? "").length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setTorchEnabled(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      // #region agent log
      fetch("http://127.0.0.1:7379/ingest/f5079690-0574-49ac-a670-49bd5e2524d3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b71f3c" },
        body: JSON.stringify({
          sessionId: "b71f3c",
          hypothesisId: "H1",
          location: "scan.tsx:captureAndRead",
          message: "capture error",
          data: { msg },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      Alert.alert("Scan failed", msg);
      setHint("Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionRoot}>
        <LinearGradient colors={colors.gradientPermission} style={StyleSheet.absoluteFill} />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Feather name="camera" size={22} color={colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera permission</Text>
          <Text style={styles.permissionBody}>
            We need access to your camera to scan the recharge card and extract the PIN.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.permissionBtnText}>Allow camera</Text>
            <Feather name="arrow-right" size={18} color={colors.textOnPrimary} />
          </Pressable>
          <Pressable onPress={() => router.replace("/network")} hitSlop={10} style={{ marginTop: 12 }}>
            <Text style={styles.permissionSecondary}>Back to networks</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchEnabled}
      />

      <LinearGradient colors={colors.scanOverlay} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.topBtn}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={styles.topTitle}>Scan card</Text>
          <Text style={styles.topSubtitle}>{network?.name ?? "Choose network"}</Text>
        </View>
        <Pressable
          onPress={() => setTorchEnabled((prev) => !prev)}
          hitSlop={12}
          style={[styles.topBtn, torchEnabled && styles.topBtnActive]}
          disabled={busy}
        >
          <Feather name={torchEnabled ? "zap" : "zap-off"} size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.hint}>{hint}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => router.replace("/network")}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
          disabled={busy}
        >
          <Feather name="grid" size={18} color={colors.white} />
          <Text style={styles.secondaryText}>Network</Text>
        </Pressable>

        <Pressable
          onPress={captureAndRead}
          style={({ pressed }) => [styles.captureBtn, pressed && { transform: [{ scale: 0.98 }] }]}
          disabled={busy}
        >
          <View style={styles.captureInner}>
            {busy ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Feather name="camera" size={20} color={colors.primary} />
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() =>
            Alert.alert(
              "Tips",
              "Keep the PIN area flat, avoid glare, and make sure the digits fill the frame."
            )
          }
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
          disabled={busy}
        >
          <Feather name="help-circle" size={18} color={colors.white} />
          <Text style={styles.secondaryText}>Help</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const FRAME_WIDTH = Math.min(340, SCREEN_WIDTH - 44);
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * 0.40);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cameraBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.controlGlass,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  topBtnActive: {
    backgroundColor: colors.torchActiveBg,
    borderColor: colors.torchActiveBorder,
  },
  topTitleWrap: { flex: 1, alignItems: "center" },
  topTitle: { color: colors.white, fontSize: 16, fontWeight: "900" },
  topSubtitle: { color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 2 },
  frameWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.scanFrameBorder,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 12,
    right: 12,
    top: "52%",
    height: 2,
    backgroundColor: colors.scanLine,
  },
  hint: {
    marginTop: 14,
    color: "rgba(255,255,255,0.88)",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 320,
  },
  cornerTL: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 22,
    height: 22,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: colors.scanCorner,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 22,
    height: 22,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: colors.scanCorner,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 22,
    height: 22,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.scanCorner,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 22,
    height: 22,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.scanCorner,
    borderBottomRightRadius: 8,
  },
  controls: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  captureBtn: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: "rgba(37, 99, 235, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(147, 197, 253, 0.45)",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    width: 96,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.controlGlass,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryText: { color: colors.white, fontWeight: "800", fontSize: 13 },
  permissionRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  permissionCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  permissionTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  permissionBody: { marginTop: 6, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  permissionBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  permissionBtnText: { color: colors.textOnPrimary, fontWeight: "900", fontSize: 14.5 },
  permissionSecondary: { textAlign: "center", color: colors.primaryDark, fontWeight: "800" },
});

