import { useState, useEffect } from 'react';
import { useAccount, Connector, useProvider } from '@starknet-react/core';
import MapGrid from './MapGrid';
import BuildingPanel from './BuildingPanel';
import ResourcePanel from './ResourcePanel';
import WalletModal from './WalletModal';
import { useStarknetConnect } from '../dojo/hooks/useStarknetConnect';
import { setupCityContract, MapInfo, PlayerInfo, BuildingInfo } from '../dojo/cityContracts';
import {
  PlayerResources,
  Building,
  calculateOfflineResources,
  getTimeUntilNextHour,
  saveResourcesToStorage,
  loadResourcesFromStorage,
  saveBuildingsToStorage,
  loadBuildingsFromStorage,
} from '../utils/resourceCalculator';

export default function CityBuilder() {
  const { account, address } = useAccount();
  const { provider } = useProvider();
  const { handleConnect, handleDisconnect, isConnecting, connectors } = useStarknetConnect();
  const [mapId] = useState(1);
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerResources>({
    money: 1000,
    energy: 0,
    water: 0,
    iron: 0,
    population: 0,
    populationCap: 0,
    lastSync: Math.floor(Date.now() / 1000),
  });
  const [timeUntilSync, setTimeUntilSync] = useState('');

  // Fetch map info on mount
  useEffect(() => {
    const fetchMapInfo = async () => {
      if (provider) {
        try {
          console.log('Fetching map info for mapId:', mapId);
          const cityContract = setupCityContract();
          const info = await cityContract.get_map(provider, mapId);
          setMapInfo(info);
          console.log('✅ Map info loaded successfully:', info);
        } catch (error) {
          console.error('❌ Failed to load map info:', error);
          alert('Failed to load map from blockchain. Please check console.');
        }
      }
    };

    fetchMapInfo();
  }, [provider, mapId]);

  // Load player data and buildings from blockchain
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (address && provider) {
        try {
          console.log('📊 Loading player data from blockchain...');
          const cityContract = setupCityContract();

          // Get player data
          const playerInfo = await cityContract.get_player(provider, address, mapId);
          console.log('✅ Player data loaded:', playerInfo);

          setPlayerData({
            money: playerInfo.money,
            energy: playerInfo.energy,
            water: playerInfo.water,
            iron: playerInfo.iron,
            population: playerInfo.population,
            populationCap: playerInfo.populationCap,
            lastSync: playerInfo.lastSync,
          });

          // TODO: Load buildings from blockchain
          // For now, keep localStorage for buildings
          const storedBuildings = loadBuildingsFromStorage();
          if (storedBuildings.length > 0) {
            setBuildings(storedBuildings);
          }

        } catch (error) {
          console.error('Failed to load blockchain data:', error);
          // Fallback to localStorage if player doesn't exist yet
          const storedResources = loadResourcesFromStorage();
          const storedBuildings = loadBuildingsFromStorage();

          if (storedResources) {
            const updatedResources = calculateOfflineResources(
              storedResources,
              storedBuildings,
              Math.floor(Date.now() / 1000)
            );
            setPlayerData(updatedResources);
          }

          if (storedBuildings.length > 0) {
            setBuildings(storedBuildings);
          }
        }
      }
    };

    loadBlockchainData();
  }, [address, provider, mapId]);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilSync(getTimeUntilNextHour(playerData.lastSync));
    }, 1000);

    return () => clearInterval(interval);
  }, [playerData.lastSync]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (address) {
      saveResourcesToStorage(playerData);
      saveBuildingsToStorage(buildings);
    }
  }, [playerData, buildings, address]);

  const handleClaimPlot = async (x: number, y: number) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!mapInfo) {
      alert('Map info not loaded yet. Please wait...');
      return;
    }

    // Validate coordinates are within map bounds
    if (x >= mapInfo.width || y >= mapInfo.height) {
      alert(`Invalid coordinates! Map size is ${mapInfo.width}x${mapInfo.height}. You clicked (${x}, ${y}).`);
      return;
    }

    try {
      console.log('Claiming plot at', x, y, 'on map', mapId);

      // Call the onchain claim_plot function
      const cityContract = setupCityContract();
      const result = await cityContract.claim_plot(account, mapId, x, y);

      console.log('Plot claimed successfully!', result);
      setSelectedTile({x, y});

      alert(`Plot claimed at (${x}, ${y})! You now have a place to build.`);
    } catch (error) {
      console.error('Failed to claim plot:', error);
      alert('Failed to claim plot. See console for details.');
    }
  };

  const handleBuildStructure = async (buildingType: number) => {
    if (!account || !selectedTile) return;

    try {
      console.log('Building structure type', buildingType, 'at', selectedTile);

      // Call the onchain build_structure function
      const cityContract = setupCityContract();
      const result = await cityContract.build_structure(
        account,
        mapId,
        buildingType,
        selectedTile.x,
        selectedTile.y
      );

      console.log('Building constructed successfully!', result);

      // Update local state after successful onchain transaction
      const newBuilding: Building = {
        id: buildings.length + 1,
        type: buildingType,
        x: selectedTile.x,
        y: selectedTile.y,
        builtAt: Math.floor(Date.now() / 1000),
      };

      setBuildings([...buildings, newBuilding]);

      // Deduct cost
      const costs = [500, 300, 300, 400, 350]; // Matching building types
      setPlayerData(prev => ({
        ...prev,
        money: prev.money - costs[buildingType],
      }));

      alert('Building constructed! It will start producing resources.');
    } catch (error) {
      console.error('Failed to build structure:', error);
      alert('Failed to build. See console for details.');
    }
  };

  const handleCollectResources = async () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // Calculate what should be synced
      const currentTime = Math.floor(Date.now() / 1000);
      const updatedResources = calculateOfflineResources(
        playerData,
        buildings,
        currentTime
      );

      console.log('Syncing with blockchain...', updatedResources);

      // Call the onchain collect_resources function to sync with blockchain
      const cityContract = setupCityContract();
      const result = await cityContract.collect_resources(account, mapId);

      console.log('Resources synced successfully!', result);

      // Update local state with blockchain sync timestamp
      setPlayerData({
        ...updatedResources,
        lastSync: currentTime,
      });

      alert('Resources synced with blockchain!');
    } catch (error) {
      console.error('Failed to collect resources:', error);
      alert('Failed to sync. See console for details.');
    }
  };

  const handleWalletSelect = async (connector: Connector) => {
    await handleConnect(connector);
    setIsWalletModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 pixel-font">
      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        connectors={connectors}
        onSelectWallet={handleWalletSelect}
        isConnecting={isConnecting}
      />

      {/* Header */}
      <div className="bg-gray-800 border-b-4 border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl text-white pixel-title">SIMULA</h1>
            {mapInfo && (
              <div className="text-gray-400 text-xs mt-1">
                Map: {mapInfo.width}x{mapInfo.height} (ID: {mapInfo.id})
              </div>
            )}
            {!mapInfo && (
              <div className="text-yellow-400 text-xs mt-1">
                Loading map...
              </div>
            )}
          </div>
          {address ? (
            <div className="text-right flex items-center gap-4">
              <div>
                <div className="text-green-400 text-sm">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {buildings.length} building{buildings.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded border-2 border-red-800 text-sm font-bold transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              disabled={isConnecting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg border-2 border-blue-800 text-lg font-bold transition-colors disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Panel - Resources */}
        <div className="lg:col-span-1">
          <ResourcePanel
            playerData={playerData}
            buildings={buildings}
            onCollectResources={handleCollectResources}
            timeUntilSync={timeUntilSync}
          />
        </div>

        {/* Center - Map */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border-4 border-gray-700 p-4 rounded-lg">
            <h2 className="text-2xl text-white mb-4 text-center">MAP</h2>
            <MapGrid
              mapId={mapId}
              onTileClick={handleClaimPlot}
              selectedTile={selectedTile}
            />
          </div>
        </div>

        {/* Right Panel - Buildings */}
        <div className="lg:col-span-1">
          <BuildingPanel
            playerData={playerData}
            selectedTile={selectedTile}
            onBuild={handleBuildStructure}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-gray-800 border-4 border-gray-700 p-4 rounded-lg">
          <h3 className="text-xl text-white mb-2">⚡ How to Play</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>💰 <strong>Make Money:</strong> Build Gold Mines ($500) to generate $100/hour</li>
            <li>🏗️ <strong>Build:</strong> Place Energy Plants, Water Extractors, Habitats, and Iron Mines</li>
            <li>⏰ <strong>Passive Income:</strong> Resources generate automatically based on time elapsed</li>
            <li>🔄 <strong>Save:</strong> Click "Save Game" to save progress onchain</li>
            <li>📊 <strong>Watch Live:</strong> Resources update in real-time on screen</li>
            <li>💾 <strong>Offline Progress:</strong> Your buildings keep producing even when you're away!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
