import { ethers } from "ethers";
import { Intent, DCAIntent } from "../types/dca";

// -------------------------- FHE Encryption + Contract (scaffold) --------------------------
/** Replace with your actual FHEVM SDK calls */
export async function fheEncryptIntent(params: {
  totalBudget: number;
  perInterval: number;
  interval: number;
  totalPeriods: number;
}): Promise<string> {
  // Example: return hex-encoded ciphertext string
  // TODO: plug real FHE encryption from Zama/fhevm + serialize struct
  const payload = JSON.stringify(params);
  // Fake ciphertext: 0x + utf8 bytes
  const hex = "0x" + Array.from(new TextEncoder().encode(payload)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex;
}

// Enhanced FHE encryption for Intent interface
export function fheEncryptIntentEnhanced(intent: Intent): string {
  // TODO: Replace with Zama FHEVM SDK encrypt call
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JSON.stringify(intent)));
}

// Minimal ABI example — replace with your contract ABI signature
const DCA_REGISTRY_ABI = [
  "function submitEncryptedIntent(bytes payload) returns (bytes32 intentId)",
  "function submitIntent(bytes calldata encryptedPayload) external",
];

export async function submitEncryptedOnChain(registry: string, ciphertext: string) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet");
  const provider = new ethers.BrowserProvider(eth);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(registry, DCA_REGISTRY_ABI, signer);
  const tx = await contract.submitEncryptedIntent(ciphertext);
  const receipt = await tx.wait();
  return receipt;
}

// Enhanced submission function
export async function submitEncryptedOnChainEnhanced(encrypted: string) {
  if (!(window as any).ethereum) throw new Error("No MetaMask");
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    "0xYourRegistryAddressHere",
    DCA_REGISTRY_ABI,
    signer
  );
  return contract.submitIntent(encrypted);
}

// Stub function for encrypting and submitting intents
export async function encryptAndSubmitIntent(params: any) {
  console.log("Encrypting + submitting to contract:", params);
  // Example: use FHEVM lib here
  // const encrypted = await fheEncrypt(params);
  // await contract.submitIntent(encrypted);
  return true;
}

// Utility functions
export const truncate = (addr?: string, n = 4) =>
  addr ? `${addr.slice(0, 2 + n)}…${addr.slice(-n)}` : "";

export function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function formatCountdown(sec: number) {
  if (sec < 0) sec = 0;
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Enhanced countdown calculation
export function calculateCountdown(target: number): string {
  const timeLeft = target - Date.now() / 1000;
  if (timeLeft <= 0) return "Ready to execute";
  
  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = Math.floor(timeLeft % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

// Chart data generation functions
export function generateChartData(intents: DCAIntent[]): Array<{ name: string; spent: number; remaining: number }> {
  return intents.map((i) => {
    const elapsed = (Date.now() / 1000 - i.createdAt) / i.interval;
    const spent = Math.floor(elapsed) * i.perInterval;
    const remaining = Math.max(0, i.totalBudget - spent);
    return {
      name: `Intent ${i.id}`,
      spent,
      remaining,
    };
  });
}

export function generatePeriodChartData(totalBudget: number, amountPerInterval: number, totalPeriods: number): Array<{ period: string; spent: number; remaining: number }> {
  return Array.from({ length: totalPeriods }, (_, i) => {
    const spent = Math.min((i + 1) * amountPerInterval, totalBudget);
    return {
      period: `#${i + 1}`,
      spent,
      remaining: Math.max(totalBudget - spent, 0),
    };
  });
}
