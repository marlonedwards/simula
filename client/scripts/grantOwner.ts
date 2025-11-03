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

async function grantOwner() {
  console.log("\n🔑 Grant Owner Permission\n");
  console.log("========================================");

  if (!WORLD_ADDRESS || !MASTER_ADDRESS || !MASTER_PRIVATE_KEY || !NODE_URL) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  console.log("📝 Configuration:");
  console.log(`  Dojo World: ${WORLD_ADDRESS}`);
  console.log(`  City Selector: ${CITY_SELECTOR}`);
  console.log(`  Your Address: ${MASTER_ADDRESS}`);
  console.log("");

  try {
    const provider = new RpcProvider({
      nodeUrl: NODE_URL,
      blockIdentifier: "latest",
    });

    const account = new Account(
      provider,
      MASTER_ADDRESS,
      MASTER_PRIVATE_KEY,
      "1"
    );

    console.log("🔌 Connected to Starknet\n");

    // Grant owner permission on the city contract
    console.log("📡 Granting owner permission...");
    console.log("   This allows you to admin the city contract");
    console.log("");

    const result = await account.execute({
      contractAddress: WORLD_ADDRESS,
      entrypoint: "grant_owner",
      calldata: [
        CITY_SELECTOR, // Resource (city contract)
        MASTER_ADDRESS, // Address to grant owner to
      ],
    });

    console.log("⏳ Transaction sent!");
    console.log(`  Transaction hash: ${result.transaction_hash}`);
    console.log("");

    console.log("⏰ Waiting for confirmation...");
    await provider.waitForTransaction(result.transaction_hash);

    console.log("✅ Owner permission granted!");
    console.log("");
    console.log("========================================");
    console.log("🎉 You now have owner permissions!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Try 'npm run generate-map' again");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error granting owner:");
    console.error(error.message || error);
    process.exit(1);
  }
}

grantOwner();
