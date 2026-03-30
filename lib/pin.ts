export type PinParseResult = {
  rawText: string;
  digitsOnly: string;
  pinCandidate?: string;
};

function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function parseRechargePinFromText(rawText: string): PinParseResult {
  const text = rawText ?? "";
  const digitsOnly = text.replace(/\D+/g, "");

  const matches = Array.from(text.matchAll(/\d[\d\s-]{8,}\d/g)).map((m) => m[0]);
  const candidates = uniqueBy(matches, (m) => m)
    .map((m) => m.replace(/\D+/g, ""))
    .filter((d) => d.length >= 10 && d.length <= 20);

  // Prefer common lengths (12–16) and longest overall.
  const scored = candidates
    .map((c) => {
      const len = c.length;
      const lengthBonus = len >= 12 && len <= 16 ? 20 : 0;
      return { c, score: lengthBonus + len };
    })
    .sort((a, b) => b.score - a.score);

  return {
    rawText: text,
    digitsOnly,
    pinCandidate: scored[0]?.c,
  };
}

export function formatPin(pinDigits: string): string {
  const digits = (pinDigits ?? "").replace(/\D+/g, "");
  if (!digits) return "";
  // group by 4s for readability
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

