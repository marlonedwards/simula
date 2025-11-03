import { Account, RpcProvider, constants } from "starknet";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.development") });

const CITY_CONTRACT_ADDRESS = process.env.VITE_PUBLIC_CITY_CONTRACT;
const MASTER_ADDRESS = process.env.VITE_PUBLIC_MASTER_ADDRESS;
const MASTER_PRIVATE_KEY = process.env.VITE_PUBLIC_MASTER_PRIVATE_KEY;
const NODE_URL = process.env.VITE_PUBLIC_NODE_URL;

async function generateMap() {
  console.log("\n🗺️  Simula Map Generator\n");
  console.log("========================================");

  // Validate environment variables
  if (!CITY_CONTRACT_ADDRESS || !MASTER_ADDRESS || !MASTER_PRIVATE_KEY || !NODE_URL) {
    console.error("❌ Missing required environment variables!");
    console.log("Required variables:");
    console.log("  - VITE_PUBLIC_CITY_CONTRACT");
    console.log("  - VITE_PUBLIC_MASTER_ADDRESS");
    console.log("  - VITE_PUBLIC_MASTER_PRIVATE_KEY");
    console.log("  - VITE_PUBLIC_NODE_URL");
    process.exit(1);
  }

  console.log("📝 Configuration:");
  console.log(`  City Contract: ${CITY_CONTRACT_ADDRESS}`);
  console.log(`  Admin Address: ${MASTER_ADDRESS}`);
  console.log(`  RPC URL: ${NODE_URL}`);
  console.log("");

  try {
    // Create provider
    console.log("🔌 Connecting to Starknet...");
    const provider = new RpcProvider({
      nodeUrl: NODE_URL,
      blockIdentifier: "latest", // Use latest instead of pending
    });

    // Create admin account
    const adminAccount = new Account(
      provider,
      MASTER_ADDRESS,
      MASTER_PRIVATE_KEY,
      "1" // Sepolia chain ID
    );

    console.log("✅ Connected successfully!\n");

    // Map parameters
    const mapWidth = 10;
    const mapHeight = 10;
    const mapSeed = Math.floor(Date.now() / 1000); // Use timestamp as seed

    console.log("🎲 Generating map with parameters:");
    console.log(`  Width: ${mapWidth}`);
    console.log(`  Height: ${mapHeight}`);
    console.log(`  Seed: ${mapSeed}`);
    console.log("");

    // Call generate_map
    console.log("📡 Calling generate_map on contract...");
    const result = await adminAccount.execute({
      contractAddress: CITY_CONTRACT_ADDRESS,
      entrypoint: "generate_map",
      calldata: [
        mapWidth.toString(),
        mapHeight.toString(),
        mapSeed.toString(),
        "0", // seed is u256, so we need low and high parts (low only for now)
      ],
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
    console.log("  1. Reload your game at localhost:3002");
    console.log("  2. The map should now show the correct dimensions");
    console.log("  3. Start claiming plots and building!");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error generating map:");
    console.error(error.message || error);

    if (error.message?.includes("Only admin can generate map")) {
      console.log("\n💡 Tip: Make sure the MASTER_ADDRESS is the same address that deployed the contract.");
    }

    process.exit(1);
  }
}

// Run the script
generateMap();
