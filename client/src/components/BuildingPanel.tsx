interface BuildingPanelProps {
  playerData: {
    money: number;
    energy: number;
    water: number;
    iron: number;
    population: number;
    populationCap: number;
  };
  selectedTile: {x: number, y: number} | null;
  onBuild: (buildingType: number) => void;
}

const BUILDINGS = [
  {
    id: 0,
    name: 'Gold Mine',
    cost: 500,
    description: '+$100/hour',
    color: 'bg-yellow-500',
    icon: '💰'
  },
  {
    id: 1,
    name: 'Energy Plant',
    cost: 300,
    description: '+50 energy/hour',
    color: 'bg-green-500',
    icon: '⚡'
  },
  {
    id: 2,
    name: 'Water Extractor',
    cost: 300,
    description: '+50 water/hour',
    color: 'bg-blue-500',
    icon: '💧'
  },
  {
    id: 3,
    name: 'Habitat',
    cost: 400,
    description: '+50 population capacity',
    color: 'bg-orange-500',
    icon: '🏠'
  },
  {
    id: 4,
    name: 'Iron Mine',
    cost: 350,
    description: '+20 iron/hour',
    color: 'bg-gray-500',
    icon: '⛏️'
  }
];

export default function BuildingPanel({ playerData, selectedTile, onBuild }: BuildingPanelProps) {
  return (
    <div className="bg-gray-800 border-4 border-gray-700 p-4 rounded-lg h-fit">
      <h2 className="text-2xl text-white mb-4 text-center">BUILDINGS</h2>

      {!selectedTile && (
        <div className="text-gray-400 text-center text-sm mb-4">
          Select a tile to build
        </div>
      )}

      <div className="space-y-3">
        {BUILDINGS.map((building) => {
          const canAfford = playerData.money >= building.cost;
          const disabled = !selectedTile || !canAfford;

          return (
            <button
              key={building.id}
              onClick={() => onBuild(building.id)}
              disabled={disabled}
              className={`
                w-full p-3 rounded border-2 text-left transition-all
                ${disabled
                  ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 border-gray-500 text-white hover:border-white hover:scale-105'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${building.color} rounded flex items-center justify-center text-xl`}>
                  {building.icon}
                </div>
                <div>
                  <div className="font-bold text-sm">{building.name}</div>
                  <div className="text-xs text-yellow-400">${building.cost}</div>
                </div>
              </div>
              <div className="text-xs text-gray-300">
                {building.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-900 rounded border-2 border-gray-600">
        <div className="text-xs text-gray-400 mb-2">Legend:</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-700 border border-gray-600"></div>
            <span className="text-gray-300">Grass</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border border-gray-600"></div>
            <span className="text-gray-300">Water</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 border border-gray-600"></div>
            <span className="text-gray-300">Mountain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-900 border border-gray-600"></div>
            <span className="text-gray-300">Forest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 border border-gray-600"></div>
            <span className="text-gray-300">Your Plot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
