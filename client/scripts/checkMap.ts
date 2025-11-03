import { RpcProvider } from "starknet";
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

async function checkMap() {
  console.log("\n🔍 Simula Map Checker\n");
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
    });

    console.log("🔌 Connecting to Starknet...");

    // Try to get map with ID 1
    console.log("📡 Fetching map ID 1...");
    const result = await provider.callContract(
      {
        contractAddress: CITY_CONTRACT_ADDRESS,
        entrypoint: "get_map",
        calldata: ["1"],
      },
      "latest" // Use latest block instead of pending
    );

    console.log("\n✅ Map found!");
    console.log("========================================");

    const id = Number(result.result?.[0] || result[0]);
    const width = Number(result.result?.[1] || result[1]);
    const height = Number(result.result?.[2] || result[2]);
    const seed = result.result?.[3] || result[3];

    console.log(`  Map ID: ${id}`);
    console.log(`  Width: ${width}`);
    console.log(`  Height: ${height}`);
    console.log(`  Seed: ${seed}`);
    console.log("");
    console.log(`Total tiles: ${width * height}`);
    console.log("========================================\n");

  } catch (error: any) {
    console.error("\n❌ Map not found or error occurred:");
    console.error(error.message || error);
    console.log("\n💡 This probably means the map hasn't been generated yet.");
    console.log("   Run 'npm run generate-map' to create it.");
    console.log("");
    process.exit(1);
  }
}

// Run the script
checkMap();
