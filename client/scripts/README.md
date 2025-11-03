# Map Generation Scripts

These scripts help you manage the game map on the blockchain.

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Make sure your `.env.development` file has the correct values:
```
VITE_PUBLIC_CITY_CONTRACT=0x6cee424a3a9bc50a46acc8df7b49d19e7c1f690f704fd8931c1821053b83606
VITE_PUBLIC_MASTER_ADDRESS=<your_admin_address>
VITE_PUBLIC_MASTER_PRIVATE_KEY=<your_admin_private_key>
VITE_PUBLIC_NODE_URL=<your_rpc_url>
```

## Scripts

### Generate Map

Creates a new map on the blockchain. This must be run by the admin account that deployed the contract.

```bash
npm run generate-map
```

This will:
- Create a 10x10 map
- Generate procedural terrain (grass, water, mountains, forests)
- Place resources on the map
- Emit a MapGenerated event

**Default parameters:**
- Width: 10
- Height: 10
- Seed: Current timestamp (for random terrain generation)

### Check Map

Verifies if a map exists and shows its details.

```bash
npm run check-map
```

This will display:
- Map ID
- Map dimensions (width x height)
- Seed used for terrain generation
- Total number of tiles

## Troubleshooting

### "Only admin can generate map"
The MASTER_ADDRESS must match the address that deployed the city contract. Check that your `.env.development` has the correct admin address.

### "Map not found"
The map hasn't been generated yet. Run `npm run generate-map` first.

### "Missing required environment variables"
Make sure all required variables are set in `.env.development`:
- VITE_PUBLIC_CITY_CONTRACT
- VITE_PUBLIC_MASTER_ADDRESS
- VITE_PUBLIC_MASTER_PRIVATE_KEY
- VITE_PUBLIC_NODE_URL

## Customizing Map Size

To change the map size, edit `scripts/generateMap.ts`:

```typescript
const mapWidth = 20;  // Change to desired width
const mapHeight = 15; // Change to desired height
```

Note: Larger maps will cost more gas to generate due to the procedural terrain generation.
