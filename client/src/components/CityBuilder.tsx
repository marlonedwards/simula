import { useState, useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import MapGrid from './MapGrid';
import BuildingPanel from './BuildingPanel';
import ResourcePanel from './ResourcePanel';
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
  const [mapId] = useState(1);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
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

  // Load from localStorage on mount
  useEffect(() => {
    if (address) {
      const storedResources = loadResourcesFromStorage();
      const storedBuildings = loadBuildingsFromStorage();

      if (storedResources) {
        // Calculate offline progress
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
  }, [address]);

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

    try {
      // TODO: Call claim_plot function via Dojo
      console.log('Claiming plot at', x, y);
      setSelectedTile({x, y});

      // For demo: mock success
      alert(`Plot claimed at (${x}, ${y})! You now have a place to build.`);
    } catch (error) {
      console.error('Failed to claim plot:', error);
      alert('Failed to claim plot. See console for details.');
    }
  };

  const handleBuildStructure = async (buildingType: number) => {
    if (!account || !selectedTile) return;

    try {
      // TODO: Call build_structure function via Dojo
      console.log('Building structure type', buildingType, 'at', selectedTile);

      // For demo: add building locally
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

      // TODO: Call collect_resources function via Dojo to sync onchain
      console.log('Syncing with blockchain...', updatedResources);

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

  return (
    <div className="min-h-screen bg-gray-900 pixel-font">
      {/* Header */}
      <div className="bg-gray-800 border-b-4 border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl text-white pixel-title">SIMULA</h1>
          {address ? (
            <div className="text-right">
              <div className="text-green-400 text-sm">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {buildings.length} building{buildings.length !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div className="text-red-400 text-sm">Not Connected</div>
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
          <h3 className="text-xl text-white mb-2">⚡ How to Play (Clash of Clans Style!)</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>💰 <strong>Make Money:</strong> Build Gold Mines ($500) to generate $100/hour</li>
            <li>🏗️ <strong>Build:</strong> Place Energy Plants, Water Extractors, Habitats, and Iron Mines</li>
            <li>⏰ <strong>Passive Income:</strong> Resources generate automatically based on time elapsed</li>
            <li>🔄 <strong>Sync:</strong> Click "Sync with Blockchain" to save progress onchain</li>
            <li>📊 <strong>Watch Live:</strong> Resources update in real-time on screen</li>
            <li>💾 <strong>Offline Progress:</strong> Your buildings keep producing even when you're away!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
