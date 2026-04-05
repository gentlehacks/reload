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

// Helper to check if a match is near "S/N" or "SEQ" (should be ignored)
function isNearSerialNumber(text: string, matchIndex: number): boolean {
  const start = Math.max(0, matchIndex - 15);
  const end = Math.min(text.length, matchIndex + 30);
  const surrounding = text.substring(start, end);
  // Check for serial number indicators
  return /S\/N|S N|SEQ|SERIAL|BATCH|S\/|S\\/i.test(surrounding);
}

// Helper to check if number has dash pattern (PINs usually have dashes)
function hasDashPattern(text: string, numberStr: string): boolean {
  // Look for pattern like 1234-5678-9012-3456
  const firstFour = numberStr.slice(0, 4);
  const nextFour = numberStr.slice(4, 8);
  if (firstFour && nextFour) {
    const pattern = new RegExp(`${firstFour}[\\s-]${nextFour}`);
    return pattern.test(text);
  }
  return false;
}

export function parseRechargePinFromText(rawText: string): PinParseResult {
  const text = rawText ?? "";
  const digitsOnly = text.replace(/\D+/g, "");

  // Strategy 1: Look for exact "PIN:" label (not "S/N" or "SN")
  // Use word boundary to ensure "PIN" is separate
  const exactPinRegex = /\bPIN\s*:?\s*([\d\s-]{10,20})/i;
  const exactMatch = text.match(exactPinRegex);

  if (exactMatch) {
    // Verify this is not near S/N
    const matchIndex = exactMatch.index || 0;
    if (!isNearSerialNumber(text, matchIndex)) {
      const pinCandidate = exactMatch[1].replace(/[\s-]/g, "");
      if (pinCandidate.length >= 10 && pinCandidate.length <= 20) {
        return {
          rawText: text,
          digitsOnly,
          pinCandidate,
        };
      }
    }
  }

  // Strategy 2: Look for numbers with dash pattern (most likely PIN)
  const dashPatternRegex = /(\d{4})[\s-](\d{4})[\s-](\d{4})[\s-](\d{3,5})/;
  const dashMatch = text.match(dashPatternRegex);

  if (dashMatch) {
    const matchIndex = dashMatch.index || 0;
    if (!isNearSerialNumber(text, matchIndex)) {
      const pinCandidate = dashMatch[0].replace(/[\s-]/g, "");
      if (pinCandidate.length >= 12 && pinCandidate.length <= 17) {
        return {
          rawText: text,
          digitsOnly,
          pinCandidate,
        };
      }
    }
  }

  // Strategy 3: Look for "PIN" (without colon) with number
  const pinWordRegex = /\bPIN\b\s*([\d\s-]{10,20})/i;
  const pinWordMatch = text.match(pinWordRegex);

  if (pinWordMatch) {
    const matchIndex = pinWordMatch.index || 0;
    if (!isNearSerialNumber(text, matchIndex)) {
      const pinCandidate = pinWordMatch[1].replace(/[\s-]/g, "");
      if (pinCandidate.length >= 10 && pinCandidate.length <= 20) {
        return {
          rawText: text,
          digitsOnly,
          pinCandidate,
        };
      }
    }
  }

  // Strategy 4: Original scoring logic (but filter out numbers near S/N)
  const matches = Array.from(text.matchAll(/\d[\d\s-]{8,}\d/g)).map((m) => ({
    text: m[0],
    index: m.index || 0,
  }));

  const candidates = uniqueBy(matches, (m) => m.text)
    .map((m) => ({
      digits: m.text.replace(/\D+/g, ""),
      index: m.index,
    }))
    .filter((d) => d.digits.length >= 10 && d.digits.length <= 20)
    .filter((d) => !isNearSerialNumber(text, d.index));

  // Score candidates: prefer 16-digit, then 12-16, then longest
  const scored = candidates
    .map((c) => {
      const len = c.digits.length;
      let score = len;
      // Bonus for 16 digits (most common PIN length)
      if (len === 16) score += 30;
      else if (len >= 12 && len <= 16) score += 20;
      // Bonus for having dash pattern in original text
      if (hasDashPattern(text, c.digits)) score += 15;
      return { c: c.digits, score };
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
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
