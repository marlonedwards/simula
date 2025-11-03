import { Connector } from "@starknet-react/core";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: Connector[];
  onSelectWallet: (connector: Connector) => void;
  isConnecting: boolean;
}

export default function WalletModal({
  isOpen,
  onClose,
  connectors,
  onSelectWallet,
  isConnecting,
}: WalletModalProps) {
  if (!isOpen) return null;

  const getWalletIcon = (connectorId: string) => {
    if (connectorId.toLowerCase().includes('cartridge')) return '🎮';
    if (connectorId.toLowerCase().includes('argent')) return '🔷';
    if (connectorId.toLowerCase().includes('braavos')) return '🦁';
    return '👛';
  };

  const getWalletName = (connector: Connector) => {
    if (connector.id.toLowerCase().includes('cartridge')) return 'Cartridge Controller';
    if (connector.id.toLowerCase().includes('argent')) return 'Argent X';
    if (connector.id.toLowerCase().includes('braavos')) return 'Braavos';
    return connector.name || connector.id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 border-4 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white pixel-title">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            disabled={isConnecting}
          >
            ×
          </button>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => onSelectWallet(connector)}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border-2 border-gray-600 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <span className="text-3xl">{getWalletIcon(connector.id)}</span>
              <div className="flex-1 text-left">
                <div className="text-white font-bold">{getWalletName(connector)}</div>
                <div className="text-gray-400 text-xs">{connector.id}</div>
              </div>
              {isConnecting && (
                <div className="text-blue-400 text-sm">Connecting...</div>
              )}
            </button>
          ))}
        </div>

        {/* Info Text */}
        <div className="mt-6 text-gray-400 text-sm text-center">
          <p>Choose your preferred Starknet wallet</p>
          <p className="mt-2 text-xs">
            💡 Tip: Use Argent or Braavos for localhost development
          </p>
        </div>
      </div>
    </div>
  );
}
