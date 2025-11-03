import { Account, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.development") });

const WORLD_ADDRESS = process.env.VITE_PUBLIC_WORLD_ADDRESS;
const MASTER_ADDRESS = process.env.VITE_PUBLIC_MASTER_ADDRESS;
const MASTER_PRIVATE_KEY = process.env.VITE_PUBLIC_MASTER_PRIVATE_KEY;
const NODE_URL = process.env.VITE_PUBLIC_NODE_URL;

// The city contract selector from manifest
const CITY_SELECTOR = "0x55f8b61952f6257ad254c10d5dbacbc79a956a368d19653134e6ef11bf372e2";

async function initCityContract() {
  console.log("\n⚙️  City Contract Initializer\n");
  console.log("========================================");

  // Validate environment variables
  if (!WORLD_ADDRESS || !MASTER_ADDRESS || !MASTER_PRIVATE_KEY || !NODE_URL) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  console.log("📝 Configuration:");
  console.log(`  Dojo World: ${WORLD_ADDRESS}`);
  console.log(`  City Selector: ${CITY_SELECTOR}`);
  console.log(`  Account: ${MASTER_ADDRESS}`);
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

    // Call init_contract on the world
    console.log("📡 Calling init_contract on Dojo world...");
    console.log("   This will call dojo_init() on the city contract");
    console.log("   and set you as the admin!");
    console.log("");

    const result = await account.execute({
      contractAddress: WORLD_ADDRESS,
      entrypoint: "init_contract",
      calldata: [
        CITY_SELECTOR, // Contract selector
        "0", // init_calldata array length (empty for dojo_init)
      ],
    });

    console.log("⏳ Transaction sent!");
    console.log(`  Transaction hash: ${result.transaction_hash}`);
    console.log("");

    // Wait for transaction
    console.log("⏰ Waiting for transaction confirmation...");
    await provider.waitForTransaction(result.transaction_hash);

    console.log("✅ City contract initialized successfully!");
    console.log("");
    console.log("========================================");
    console.log("🎉 Your account is now the admin!");
    console.log(`   Admin address: ${MASTER_ADDRESS}`);
    console.log("");
    console.log("Next steps:");
    console.log("  1. Run 'npm run generate-map' to create the map");
    console.log("  2. Run 'npm run check-map' to verify");
    console.log("  3. Start playing!");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error initializing contract:");
    console.error(error.message || error);

    if (error.message?.includes("already initialized") || error.message?.includes("AlreadyInitialized")) {
      console.log("\n💡 Contract is already initialized!");
      console.log("   The admin was set during a previous initialization.");
      console.log("   You need to use the account that initialized it first.");
    }

    process.exit(1);
  }
}

// Run the script
initCityContract();
