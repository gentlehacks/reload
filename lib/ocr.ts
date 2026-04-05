import { Platform } from "react-native";
import Constants from "expo-constants";

type OcrResult = {
  text: string;
};

export async function recognizeTextFromImageUri(uri: string): Promise<OcrResult> {
  if (Platform.OS !== "android") {
    throw new Error("ML Kit OCR is configured for Android only in this build.");
  }

  const appOwnership = Constants.appOwnership;
  if (appOwnership === "expo") {
    throw new Error(
      "Google ML Kit OCR needs a development build. Expo Go does not include the native module."
    );
  }

  // expo-mlkit-ocr is native; require lazily to keep startup safe.
  let mod: unknown;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imported = require("expo-mlkit-ocr");
    mod = imported?.default ?? imported;
  } catch {
    throw new Error(
      "Native module 'ExpoMlKitOcr' is unavailable. Rebuild the Android app after installing dependencies."
    );
  }

  const ocrModule = mod as { recognizeText?: (imageUri: string) => Promise<{ text?: string }> };
  if (typeof ocrModule?.recognizeText !== "function") {
    throw new Error(
      "Native module 'ExpoMlKitOcr' is unavailable. Rebuild the Android app after installing dependencies."
    );
  }

  const result = await ocrModule.recognizeText(uri);
  const text = typeof result?.text === "string" ? result.text : String(result ?? "");
  // #region agent log
  fetch("http://127.0.0.1:7379/ingest/f5079690-0574-49ac-a670-49bd5e2524d3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b71f3c" },
    body: JSON.stringify({
      sessionId: "b71f3c",
      hypothesisId: "H1",
      location: "ocr.ts:recognizeTextFromImageUri",
      message: "ocr done",
      data: { textLen: text.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return { text };
}

