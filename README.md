# Simula - 8-bit City Builder on Starknet

A fully onchain city builder civilization game where players claim plots, construct buildings, and manage resources. Build gold mines, watch your city grow in real-time with Clash of Clans-style mechanics.

## Game Features

- **Real-time Resource Generation**: Clash of Clans-style passive income based on elapsed time
- **Offline Progress**: Buildings keep producing while you're away
- **5 Building Types**: Gold Mines ($100/hr), Energy Plants, Water Extractors, Habitats, Iron Mines
- **Live Counters**: Watch resources tick up every second on screen
- **Procedural Maps**: Unique terrain with water, mountains, forests, and resource deposits
- **localStorage Persistence**: Instant feedback with client-side state management
- **Fully Onchain**: All game logic secured by Cairo smart contracts on Starknet

## Tech Stack

- **Smart Contracts**: Cairo 2.12.2 + Dojo 1.7.1
- **Frontend**: React + TypeScript + Vite
- **Wallet**: ArgentX / Braavos
- **Blockchain**: Starknet Sepolia Testnet

## Game Mechanics

### Starting Out
- Connect with ArgentX or Braavos wallet on Starknet Sepolia
- Start with $1000 balance when claiming first plot
- Select buildable terrain (not water) to claim your plot

### Buildings

| Building | Cost | Production |
|----------|------|------------|
| Gold Mine | $500 | $100/hour |
| Energy Plant | $300 | 50 energy/hour |
| Water Extractor | $300 | 50 water/hour |
| Habitat | $400 | +50 population capacity |
| Iron Mine | $350 | 20 iron/hour |

### Two-Layer Architecture

**Client-Side (Instant)**
- Resources update every second locally
- localStorage saves progress across sessions
- Offline progress calculated when you return
- No waiting for blockchain confirmations

**Blockchain (Secure)**
- Click "Sync with Blockchain" to commit state
- Contract validates time elapsed using timestamps
- Only real time earns real rewards (anti-cheat)
- All game state permanently stored onchain

## Quick Start

### Prerequisites
- [Dojo 1.7.1](https://book.dojoengine.org/getting-started/quick-start.html)
- [Scarb](https://docs.swmansion.com/scarb/) (Cairo package manager)
- [Node.js](https://nodejs.org/) v18+
- [Starknet wallet](https://www.argent.xyz/argent-x/) (ArgentX or Braavos)

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/simula.git
cd simula

# Build contracts
cd contract
sozo build

# Deploy to local Katana (Terminal 1)
katana --disable-fee

# Deploy contracts (Terminal 2)
sozo migrate

# Start frontend (Terminal 3)
cd ../client
npm install
npm run dev
```

## Deployed Contracts (Sepolia)

- **World Address**: `0x06aa900adb298c2b4fd068199baab902d1d90a40483b53e03fa4e1dedb6fe2da`
- **City System**: `0x6cee424a3a9bc50a46acc8df7b49d19e7c1f690f704fd8931c1821053b83606`
- **Network**: Starknet Sepolia Testnet
- **RPC**: Alchemy Sepolia

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

## Smart Contract Functions

### Admin Functions
```cairo
// Generate map (admin only)
fn generate_map(width: u32, height: u32, seed: u256) -> u32
```

### Player Functions
```cairo
// Claim a plot
fn claim_plot(map_id: u32, x: u32, y: u32)

// Build structure
fn build_structure(map_id: u32, building_type: u8, x: u32, y: u32)

// Collect resources (syncs with blockchain)
fn collect_resources(map_id: u32)

// View functions
fn get_map(map_id: u32) -> (u32, u32, u32, u256)
fn get_tile(map_id: u32, x: u32, y: u32) -> (u8, u8, bool, bool, bool)
```

## Documentation

- [Dojo Book](https://book.dojoengine.org) - Dojo framework documentation
- [Cairo Documentation](https://book.cairo-lang.org/) - Cairo language guide
- [Starknet Documentation](https://docs.starknet.io/) - Starknet network docs

## Roadmap

### Phase 1 - MVP (Current)
- ✅ Core contracts (Map, Tile, Plot, CityPlayer, Building)
- ✅ Procedural map generation with varied terrain
- ✅ Time-based resource generation (Clash of Clans style)
- ✅ Real-time counters with localStorage persistence
- ✅ Offline progress calculation
- ✅ Deployed to Sepolia testnet
- ⏳ Wire frontend to deployed contracts
- ⏳ Deploy frontend to Vercel

### Phase 2 - Enhanced Gameplay
- [ ] Building upgrades (Level 2-5 with better rates)
- [ ] Resource storage caps (prevent infinite accumulation)
- [ ] Speedups (spend gems to instant-collect)
- [ ] Production boosts (2x for 1 hour)
- [ ] Multiple maps support

### Phase 3 - PvP & Social
- [ ] Raiding mechanics (attack other players)
- [ ] Defense buildings (walls, towers)
- [ ] Player rankings and leaderboards
- [ ] Alliances and clans
- [ ] Chat system

### Phase 4 - Economy & Polish
- [ ] Resource marketplace (trade with other players)
- [ ] $SIMULA token integration
- [ ] NFT buildings (unique bonuses)
- [ ] Seasonal events
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Links

- [Dojo Engine](https://dojoengine.org) - Onchain game framework
- [Starknet](https://starknet.io) - Ethereum L2 network
- [Cairo Book](https://book.cairo-lang.org/) - Cairo programming language

---

Built with Dojo Engine on Starknet
