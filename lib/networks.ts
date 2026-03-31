export type NetworkId = "mtn" | "glo" | "airtel" | "etisalat";

export type Network = {
  id: NetworkId;
  name: string;
  shortName: string;
  accent: string;
  ussdPrefix: string;
};

export const NETWORKS: readonly Network[] = [
  { id: "mtn", name: "MTN", shortName: "MTN", accent: "#FFCC00", ussdPrefix: "*311*" },
  { id: "glo", name: "Glo", shortName: "glo", accent: "#16A34A", ussdPrefix: "*311*" },
  { id: "airtel", name: "Airtel", shortName: "air", accent: "#EF4444", ussdPrefix: "*311*" },
  { id: "etisalat", name: "Etisalat (9mobile)", shortName: "eti", accent: "#10B981", ussdPrefix: "*222*" },
] as const;

export function getNetworkById(id: string | undefined): Network | undefined {
  return NETWORKS.find((n) => n.id === id);
}

