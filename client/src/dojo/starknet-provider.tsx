import type { PropsWithChildren } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    jsonRpcProvider,
    StarknetConfig,
    starkscan,
    argent,
    braavos,
} from "@starknet-react/core";
import cartridgeConnector from "../config/cartridgeConnector";

export default function StarknetProvider({ children }: PropsWithChildren) {
    const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;

    // Get RPC URL based on environment
    const getRpcUrl = () => {
        switch (VITE_PUBLIC_DEPLOY_TYPE) {
            case "mainnet":
                return "https://api.cartridge.gg/x/starknet/mainnet";
            case "sepolia":
                return "https://api.cartridge.gg/x/starknet/sepolia";
            default:
                return "https://api.cartridge.gg/x/starknet/sepolia"; 
        }
    };

    // Create provider with the correct RPC URL
    const provider = jsonRpcProvider({
        rpc: () => ({ nodeUrl: getRpcUrl() }),
    });

    // Determine which chain to use
    const chains = VITE_PUBLIC_DEPLOY_TYPE === "mainnet" 
        ? [mainnet] 
        : [sepolia];

    // Create wallet connectors
    const connectors = [
        cartridgeConnector,
        argent(),
        braavos(),
    ];

    return (
        <StarknetConfig
            autoConnect
            chains={chains}
            connectors={connectors}
            explorer={starkscan}
            provider={provider}
        >
            {children}
        </StarknetConfig>
    );
}