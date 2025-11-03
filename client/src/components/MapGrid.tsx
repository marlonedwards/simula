import { useState, useEffect } from 'react';

interface MapGridProps {
  mapId: number;
  onTileClick: (x: number, y: number) => void;
  selectedTile: {x: number, y: number} | null;
}

interface Tile {
  x: number;
  y: number;
  terrain: number; // 0=grass, 1=water, 2=mountain, 3=forest
  claimed: boolean;
  building?: number;
}

export default function MapGrid({ mapId, onTileClick, selectedTile }: MapGridProps) {
  const MAP_SIZE = 10; // Changed from 30x30 to 10x10 to match blockchain map
  const [tiles, setTiles] = useState<Tile[][]>([]);
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  // Generate initial map (in production, load from chain)
  useEffect(() => {
    const newTiles: Tile[][] = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      newTiles[y] = [];
      for (let x = 0; x < MAP_SIZE; x++) {
        // Simple procedural generation matching blockchain seed
        const seed = (x * 17 + y * 31 + mapId * 13) % 100;
        let terrain = 0; // grass (default - most tiles)

        if (seed < 10) terrain = 1; // 10% water
        else if (seed < 20) terrain = 2; // 10% mountain
        else if (seed < 35) terrain = 3; // 15% forest
        // 65% grass

        newTiles[y][x] = {
          x,
          y,
          terrain,
          claimed: false
        };
      }
    }
    setTiles(newTiles);
  }, [mapId]);

  const getTileColor = (tile: Tile, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return 'bg-yellow-400';
    if (isHovered) return 'bg-white opacity-50';

    if (tile.building !== undefined) {
      if (tile.building === 0) return 'bg-green-500'; // Energy plant
      if (tile.building === 1) return 'bg-blue-500'; // Water extractor
      if (tile.building === 2) return 'bg-orange-500'; // Habitat
    }

    if (tile.claimed) return 'bg-purple-600';

    switch (tile.terrain) {
      case 0: return 'bg-green-700'; // grass
      case 1: return 'bg-blue-600'; // water
      case 2: return 'bg-gray-600'; // mountain
      case 3: return 'bg-green-900'; // forest
      default: return 'bg-gray-500';
    }
  };

  const handleTileClick = (x: number, y: number) => {
    const tile = tiles[y][x];
    if (tile.terrain === 1) {
      alert('Cannot build on water!');
      return;
    }
    onTileClick(x, y);
  };

  return (
    <div className="bg-gray-900 p-4 rounded border-2 border-gray-600">
      <div
        className="grid gap-[1px] bg-gray-950"
        style={{
          gridTemplateColumns: `repeat(${MAP_SIZE}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
        {tiles.map((row, y) =>
          row.map((tile, x) => {
            const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={`
                  w-12 h-12 cursor-pointer transition-all border border-gray-800
                  ${getTileColor(tile, isHovered, isSelected)}
                  hover:scale-105 hover:z-10
                `}
                onClick={() => handleTileClick(x, y)}
                onMouseEnter={() => setHoveredTile({x, y})}
                onMouseLeave={() => setHoveredTile(null)}
                title={`(${x}, ${y}) - ${['Grass', 'Water', 'Mountain', 'Forest'][tile.terrain]}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
