import { RpcProvider, Contract } from "starknet";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.development") });

const CITY_CONTRACT_ADDRESS = process.env.VITE_PUBLIC_CITY_CONTRACT;
const NODE_URL = process.env.VITE_PUBLIC_NODE_URL;

async function checkAdmin() {
  console.log("\n🔍 Admin Address Checker\n");
  console.log("========================================");

  if (!CITY_CONTRACT_ADDRESS || !NODE_URL) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  console.log(`  City Contract: ${CITY_CONTRACT_ADDRESS}`);
  console.log(`  RPC URL: ${NODE_URL}`);
  console.log("");

  try {
    const provider = new RpcProvider({
      nodeUrl: NODE_URL,
      blockIdentifier: "latest",
    });

    console.log("🔌 Connecting to Starknet...");
    console.log("");

    // Try to read the admin storage directly
    // Storage slot for admin is at position 2 (map_counter=0, building_counter=1, admin=2)
    console.log("📡 Reading admin storage slot...");

    // In Starknet, storage slots are calculated with pedersen hash
    // For simple storage vars, it's often just the position
    // Let's try to read storage at different positions

    for (let i = 0; i < 5; i++) {
      try {
        const storageValue = await provider.getStorageAt(
          CITY_CONTRACT_ADDRESS,
          i.toString(),
          "latest"
        );

        console.log(`  Storage[${i}]: ${storageValue}`);

        // If it looks like an address (non-zero, reasonable size)
        if (storageValue !== "0x0" && BigInt(storageValue) > 0n) {
          console.log(`    -> Potential address: ${storageValue}`);
        }
      } catch (e) {
        // Skip
      }
    }

    console.log("");
    console.log("========================================");
    console.log("💡 Look for non-zero values that look like addresses");
    console.log("   (Addresses typically start with 0x0... and are 64 hex chars)");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error checking admin:");
    console.error(error.message || error);
    process.exit(1);
  }
}

// Run the script
checkAdmin();
