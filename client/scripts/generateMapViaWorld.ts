import { Account, RpcProvider, CallData, stark } from "starknet";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.development") });

const WORLD_ADDRESS = process.env.VITE_PUBLIC_WORLD_ADDRESS;
const CITY_CONTRACT_ADDRESS = process.env.VITE_PUBLIC_CITY_CONTRACT;
const MASTER_ADDRESS = process.env.VITE_PUBLIC_MASTER_ADDRESS;
const MASTER_PRIVATE_KEY = process.env.VITE_PUBLIC_MASTER_PRIVATE_KEY;
const NODE_URL = process.env.VITE_PUBLIC_NODE_URL;

async function generateMapViaWorld() {
  console.log("\n🗺️  Simula Map Generator (via Dojo World)\n");
  console.log("========================================");

  // Validate environment variables
  if (!WORLD_ADDRESS || !CITY_CONTRACT_ADDRESS || !MASTER_ADDRESS || !MASTER_PRIVATE_KEY || !NODE_URL) {
    console.error("❌ Missing required environment variables!");
    console.log("Required variables:");
    console.log("  - VITE_PUBLIC_WORLD_ADDRESS");
    console.log("  - VITE_PUBLIC_CITY_CONTRACT");
    console.log("  - VITE_PUBLIC_MASTER_ADDRESS");
    console.log("  - VITE_PUBLIC_MASTER_PRIVATE_KEY");
    console.log("  - VITE_PUBLIC_NODE_URL");
    process.exit(1);
  }

  console.log("📝 Configuration:");
  console.log(`  Dojo World: ${WORLD_ADDRESS}`);
  console.log(`  City Contract: ${CITY_CONTRACT_ADDRESS}`);
  console.log(`  Account: ${MASTER_ADDRESS}`);
  console.log(`  RPC URL: ${NODE_URL}`);
  console.log("");

  try {
    // Create provider
    console.log("🔌 Connecting to Starknet...");
    const provider = new RpcProvider({
      nodeUrl: NODE_URL,
      blockIdentifier: "latest",
    });

    // Create account
    const account = new Account(
      provider,
      MASTER_ADDRESS,
      MASTER_PRIVATE_KEY,
      "1"
    );

    console.log("✅ Connected successfully!\n");

    // Map parameters
    const mapWidth = 10;
    const mapHeight = 10;
    const mapSeed = Math.floor(Date.now() / 1000);

    console.log("🎲 Generating map with parameters:");
    console.log(`  Width: ${mapWidth}`);
    console.log(`  Height: ${mapHeight}`);
    console.log(`  Seed: ${mapSeed}`);
    console.log("");

    // Calculate the selector for generate_map
    const generateMapSelector = stark.getSelectorFromName("generate_map");
    console.log(`📋 Function selector: ${generateMapSelector}`);
    console.log("");

    // Call through the world contract
    // In Dojo, you call: world.execute(contract_address, entrypoint_selector, calldata)
    console.log("📡 Calling generate_map through Dojo world...");

    const calldata = [
      CITY_CONTRACT_ADDRESS, // Contract address to call
      generateMapSelector, // Entrypoint selector
      "4", // Calldata length (width, height, seed_low, seed_high)
      mapWidth.toString(),
      mapHeight.toString(),
      mapSeed.toString(), // seed low
      "0", // seed high (seed is u256, we're using low part only)
    ];

    console.log("Calldata:", calldata);
    console.log("");

    const result = await account.execute({
      contractAddress: WORLD_ADDRESS,
      entrypoint: "execute",
      calldata: calldata,
    });

    console.log("⏳ Transaction sent!");
    console.log(`  Transaction hash: ${result.transaction_hash}`);
    console.log("");

    // Wait for transaction
    console.log("⏰ Waiting for transaction confirmation...");
    await provider.waitForTransaction(result.transaction_hash);

    console.log("✅ Map generated successfully!");
    console.log("");
    console.log("========================================");
    console.log("🎉 All done! Your map is ready to play!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Run 'npm run check-map' to verify");
    console.log("  2. Reload your game at localhost:3002");
    console.log("  3. Start claiming plots and building!");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error generating map:");
    console.error(error.message || error);

    if (error.message?.includes("Only admin can generate map")) {
      console.log("\n💡 The world contract might not be authorized.");
      console.log("   Try calling directly if you are the admin.");
    }

    process.exit(1);
  }
}

// Run the script
generateMapViaWorld();
