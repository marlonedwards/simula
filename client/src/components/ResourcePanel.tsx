import { useState, useEffect } from 'react';
import { getProductionPerSecond, Building } from '../utils/resourceCalculator';

interface ResourcePanelProps {
  playerData: {
    money: number;
    energy: number;
    water: number;
    iron: number;
    population: number;
    populationCap: number;
  };
  buildings: Building[];
  onCollectResources: () => void;
  timeUntilSync?: string;
}

export default function ResourcePanel({
  playerData,
  buildings,
  onCollectResources,
  timeUntilSync
}: ResourcePanelProps) {
  const [liveResources, setLiveResources] = useState(playerData);
  const productionPerSecond = getProductionPerSecond(buildings);

  // Update resources every second for live feel
  useEffect(() => {
    setLiveResources(playerData);

    const interval = setInterval(() => {
      setLiveResources(prev => ({
        money: prev.money + productionPerSecond.money,
        energy: prev.energy + productionPerSecond.energy,
        water: prev.water + productionPerSecond.water,
        iron: prev.iron + productionPerSecond.iron,
        population: prev.population,
        populationCap: prev.populationCap,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [playerData, productionPerSecond]);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString();
  const formatRate = (rate: number) => {
    if (rate === 0) return '';
    return `+${rate.toFixed(2)}/s`;
  };

  return (
    <div className="bg-gray-800 border-4 border-gray-700 p-4 rounded-lg h-fit">
      <h2 className="text-2xl text-white mb-4 text-center">RESOURCES</h2>

      <div className="space-y-3">
        {/* Money */}
        <div className="bg-gray-900 p-3 rounded border-2 border-yellow-600">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 font-bold text-sm">💰 Gold</span>
            <div className="text-right">
              <div className="text-white text-lg">${formatNumber(liveResources.money)}</div>
              {productionPerSecond.money > 0 && (
                <div className="text-yellow-300 text-xs">{formatRate(productionPerSecond.money)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Energy */}
        <div className="bg-gray-900 p-3 rounded border-2 border-green-600">
          <div className="flex justify-between items-center">
            <span className="text-green-400 font-bold text-sm">⚡ Energy</span>
            <div className="text-right">
              <div className="text-white text-lg">{formatNumber(liveResources.energy)}</div>
              {productionPerSecond.energy > 0 && (
                <div className="text-green-300 text-xs">{formatRate(productionPerSecond.energy)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-gray-900 p-3 rounded border-2 border-blue-600">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-bold text-sm">💧 Water</span>
            <div className="text-right">
              <div className="text-white text-lg">{formatNumber(liveResources.water)}</div>
              {productionPerSecond.water > 0 && (
                <div className="text-blue-300 text-xs">{formatRate(productionPerSecond.water)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Iron */}
        <div className="bg-gray-900 p-3 rounded border-2 border-gray-500">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-bold text-sm">⛏️ Iron</span>
            <div className="text-right">
              <div className="text-white text-lg">{formatNumber(liveResources.iron)}</div>
              {productionPerSecond.iron > 0 && (
                <div className="text-gray-400 text-xs">{formatRate(productionPerSecond.iron)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Population */}
        <div className="bg-gray-900 p-3 rounded border-2 border-orange-600">
          <div className="flex justify-between items-center">
            <span className="text-orange-400 font-bold text-sm">👥 Population</span>
            <span className="text-white text-lg">
              {liveResources.population}/{liveResources.populationCap}
            </span>
          </div>
        </div>
      </div>

      {/* Sync with Blockchain Button */}
      <button
        onClick={onCollectResources}
        className="
          w-full mt-4 p-3 bg-green-600 hover:bg-green-500
          text-white font-bold rounded border-2 border-green-400
          transition-all hover:scale-105 active:scale-95 text-sm
        "
      >
        SAVE GAME
        {timeUntilSync && (
          <div className="text-xs mt-1 text-green-200">
            Next full hour: {timeUntilSync}
          </div>
        )}
      </button>

      {/* Production Stats */}
      <div className="mt-4 p-3 bg-gray-900 rounded border-2 border-gray-600">
        <div className="text-xs text-gray-400 mb-2">Production/Hour:</div>
        <div className="space-y-1 text-xs text-gray-300">
          <div>💰 Gold: +{Math.floor(productionPerSecond.money * 3600)}</div>
          <div>⚡ Energy: +{Math.floor(productionPerSecond.energy * 3600)}</div>
          <div>💧 Water: +{Math.floor(productionPerSecond.water * 3600)}</div>
          <div>⛏️ Iron: +{Math.floor(productionPerSecond.iron * 3600)}</div>
        </div>
      </div>

      {/* Building Costs */}
      <div className="mt-4 p-3 bg-gray-900 rounded border-2 border-gray-600">
        <div className="text-xs text-gray-400 mb-2">Building Costs:</div>
        <div className="space-y-1 text-xs text-gray-300">
          <div>💰 Gold Mine: $500</div>
          <div>⚡ Energy Plant: $300</div>
          <div>💧 Water Extractor: $300</div>
          <div>🏠 Habitat: $400</div>
          <div>⛏️ Iron Mine: $350</div>
        </div>
      </div>
    </div>
  );
}
