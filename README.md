# Simula - 8-bit City Builder on Starknet

A fully onchain multiplayer city builder where players compete to claim plots on a shared 10x10 map. Build gold mines, manage resources, and watch your city grow with Clash of Clans-style mechanics - all secured by Cairo smart contracts.

## 🎮 Game Features

- **Shared World**: All players compete on the same 10x10 map (100 plots, first-come-first-served)
- **Real Blockchain Integration**: Player resources, buildings, and plots stored onchain
- **Starting Resources**: Get 1000 gold when you claim your first plot
- **5 Building Types**: Gold Mines ($100/hr), Energy Plants, Water Extractors, Habitats, Iron Mines
- **Procedural Terrain**: 65% grass, 15% forest, 10% mountain, 10% water
- **Multi-Player Ready**: Each wallet = different player with separate resources
- **Fully Onchain**: All game state secured by Cairo smart contracts on Starknet Sepolia

## Tech Stack

- **Smart Contracts**: Cairo 2.12.2 + Dojo 1.7.1
- **Frontend**: React + TypeScript + Vite
- **Wallet**: ArgentX / Braavos
- **Blockchain**: Starknet Sepolia Testnet

## 🎯 How To Play

### Getting Started
1. **Connect Wallet**: ArgentX or Braavos on Starknet Sepolia
2. **Claim Your First Plot**: Click any green/forest/mountain tile (not water!)
   - Transaction creates your player account onchain
   - Automatically get **1000 gold** to start building
3. **Build Structures**: Spend gold to construct buildings on your claimed plots
4. **Collect Resources**: Sync with blockchain to update your resources

### Map & Plots
- **One Shared Map** (Map ID: 1)
- **10x10 Grid** = 100 total plots
- **First-Come-First-Served**: Once claimed, a plot is owned forever
- **Terrain Types**:
  - 🟩 Grass (buildable)
  - 🌲 Forest (buildable)
  - ⛰️ Mountain (buildable)
  - 💧 Water (NOT buildable)

### Buildings & Economy

| Building | Cost | Production |
|----------|------|------------|
| Gold Mine | $500 | $100/hour |
| Energy Plant | $300 | 50 energy/hour |
| Water Extractor | $300 | 50 water/hour |
| Habitat | $400 | +50 population capacity |
| Iron Mine | $350 | 20 iron/hour |

### Blockchain Integration

**What's Onchain:**
✅ Map terrain (10x10, seed: 123456)
✅ Your player resources (gold, energy, water, iron, population)
✅ Plot ownership (who owns which coordinates)
✅ Buildings (type, position, owner, timestamp)

**What's Local (Temporary):**
⚠️ Building display (buildings are saved onchain but not yet queried back)
⚠️ Resource calculations between syncs

**How It Works:**
1. **Claim Plot** → Creates player account + grants 1000 gold onchain
2. **Build Structure** → Deducts gold + saves building onchain
3. **Collect Resources** → Updates resources based on buildings & time onchain
4. **Page Reload** → Loads your real resources from blockchain

## 🚀 Quick Start

### Play Now (Sepolia Testnet)
```bash
# Clone the repository
git clone https://github.com/yourusername/simula.git
cd simula/client

# Install and run
npm install
npm run dev

# Open http://localhost:3002
# Connect your Starknet wallet (Sepolia network)
```

**Requirements:**
- [Starknet wallet](https://www.argent.xyz/argent-x/) (ArgentX or Braavos)
- Sepolia testnet ETH ([faucet](https://starknet-faucet.vercel.app/))

### Local Development (Full Stack)

**Prerequisites:**
- [Dojo 1.7.1](https://book.dojoengine.org/getting-started/quick-start.html)
- [Scarb](https://docs.swmansion.com/scarb/) (Cairo package manager)
- [Node.js](https://nodejs.org/) v18+

**Setup:**
```bash
# Terminal 1: Start local Katana blockchain
cd contract
katana --disable-fee

# Terminal 2: Build & deploy contracts
sozo build
sozo migrate

# Terminal 3: Generate map (admin only)
sozo execute simula-city generate_map 10 10 123456 0

# Terminal 4: Start frontend
cd ../client
npm install
npm run dev
```

## 🌐 Deployed Contracts (Sepolia)

- **Dojo World**: `0x06aa900adb298c2b4fd068199baab902d1d90a40483b53e03fa4e1dedb6fe2da`
- **City Contract**: `0x6cee424a3a9bc50a46acc8df7b49d19e7c1f690f704fd8931c1821053b83606`
- **Network**: Starknet Sepolia Testnet
- **Map ID**: 1 (10x10, seed: 123456)
- **Total Plots**: 100 (shared by all players)

**Explorer Links:**
- [World on Starkscan](https://sepolia.starkscan.co/contract/0x06aa900adb298c2b4fd068199baab902d1d90a40483b53e03fa4e1dedb6fe2da)
- [City Contract on Starkscan](https://sepolia.starkscan.co/contract/0x6cee424a3a9bc50a46acc8df7b49d19e7c1f690f704fd8931c1821053b83606)

## Project Structure

```
simula/
├── contract/              # Cairo smart contracts
│   ├── src/
│   │   ├── models/       # Game data models
│   │   │   ├── map.cairo
│   │   │   ├── tile.cairo
│   │   │   ├── plot.cairo
│   │   │   ├── city_player.cairo
│   │   │   └── building.cairo
│   │   ├── systems/      # Game logic
│   │   │   └── city.cairo
│   │   └── lib.cairo
│   ├── Scarb.toml
│   └── dojo_dev.toml
│
├── client/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CityBuilder.tsx    # Main game component
│   │   │   ├── MapGrid.tsx        # Map tile grid
│   │   │   ├── BuildingPanel.tsx  # Building menu
│   │   │   └── ResourcePanel.tsx  # Live resource counters
│   │   ├── utils/
│   │   │   └── resourceCalculator.ts  # Offline progress logic
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

## 📜 Smart Contract Functions

### Admin Functions
```cairo
// Generate new map (world owner only)
fn generate_map(width: u32, height: u32, seed: u256) -> u32

// Update admin address
fn set_admin(new_admin: ContractAddress)
```

### Player Functions
```cairo
// Claim a plot (creates player if first time)
fn claim_plot(map_id: u32, x: u32, y: u32)

// Build structure on owned plot
fn build_structure(map_id: u32, building_type: u8, x: u32, y: u32)

// Collect resources (syncs with blockchain)
fn collect_resources(map_id: u32)
```

### View Functions
```cairo
// Get map details
fn get_map(map_id: u32) -> (id, width, height, seed)

// Get tile terrain
fn get_tile(map_id: u32, x: u32, y: u32) -> (terrain_type, height, has_iron, has_coal, has_gold)

// Get player resources
fn get_player(owner: ContractAddress, map_id: u32) -> (money, energy, water, iron, population, population_cap, joined_at, last_sync)

// Get building details
fn get_building(building_id: u32) -> (map_id, owner, building_type, x, y, level, built_at)

// Get current admin
fn get_admin() -> ContractAddress
```

## Documentation

- [Dojo Book](https://book.dojoengine.org) - Dojo framework documentation
- [Cairo Documentation](https://book.cairo-lang.org/) - Cairo language guide
- [Starknet Documentation](https://docs.starknet.io/) - Starknet network docs

## 🗺️ Roadmap

### Phase 1 - MVP ✅ COMPLETE
- ✅ Core contracts (Map, Tile, Plot, CityPlayer, Building)
- ✅ Procedural map generation (10x10 with varied terrain)
- ✅ Plot claiming with ownership validation
- ✅ Building construction with cost deduction
- ✅ Time-based resource generation
- ✅ Deployed to Sepolia testnet
- ✅ Frontend connected to blockchain
- ✅ Multi-player support (shared map)
- ✅ Real player resources loaded from chain
- ✅ Transaction integration for all actions
- ✅ Query all player buildings from blockchain (remove localStorage dependency)

### Phase 2 - Enhanced Gameplay
- [ ] Building upgrades (Level 2-5 with better production rates)
- [ ] Resource storage caps (prevent infinite accumulation)
- [ ] Multiple map support (private maps per player)
- [ ] Resource calculation in contract (production based on buildings)
- [ ] Events & notifications (MapGenerated, PlotClaimed, BuildingConstructed)

### Phase 3 - Social
- [ ] Player rankings and leaderboards (most gold, buildings, etc.)
- [ ] Alliances
- [ ] Resource marketplace (trade with other players)

## 🛠️ Development Scripts

Located in `client/scripts/`:

```bash
# Check if map exists
npm run check-map

# Get current admin address
npx tsx scripts/getAdmin.ts

# Generate new map (requires admin permissions)
npm run generate-map
```

## 📚 Documentation

- [Dojo Book](https://book.dojoengine.org) - Dojo framework documentation
- [Cairo Documentation](https://book.cairo-lang.org/) - Cairo language guide
- [Starknet Documentation](https://docs.starknet.io/) - Starknet network docs
- [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) - Detailed integration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Dojo Engine](https://dojoengine.org) - Onchain game framework
- [Starknet](https://starknet.io) - Ethereum L2 scaling solution
- [Cairo Book](https://book.cairo-lang.org/) - Cairo programming language
- [ArgentX Wallet](https://www.argent.xyz/argent-x/) - Starknet wallet

---

**Built with Dojo Engine on Starknet** 🚀

*A fully onchain multiplayer city builder where every action is secured by blockchain.*
