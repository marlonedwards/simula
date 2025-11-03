import { RpcProvider } from "starknet";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.development") });

const CITY_CONTRACT_ADDRESS = process.env.VITE_PUBLIC_CITY_CONTRACT;
const NODE_URL = process.env.VITE_PUBLIC_NODE_URL;

async function getAdmin() {
  console.log("\n🔍 Get Current Admin\n");

  const provider = new RpcProvider({
    nodeUrl: NODE_URL,
    blockIdentifier: "latest",
  });

  const result = await provider.callContract(
    {
      contractAddress: CITY_CONTRACT_ADDRESS!,
      entrypoint: "get_admin",
      calldata: [],
    },
    "latest"
  );

  const admin = result.result?.[0] || result[0];
  console.log(`Current admin: ${admin}`);
  console.log("");
}

getAdmin();
