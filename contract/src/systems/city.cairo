// Interface definition
#[starknet::interface]
pub trait ICity<T> {
    // Admin functions
    fn generate_map(ref self: T, width: u32, height: u32, seed: u256) -> u32;

    // Player functions
    fn claim_plot(ref self: T, map_id: u32, x: u32, y: u32);
    fn build_structure(ref self: T, map_id: u32, building_type: u8, x: u32, y: u32);
    fn collect_resources(ref self: T, map_id: u32);

    // View functions
    fn get_map(self: @T, map_id: u32) -> (u32, u32, u32, u256);
    fn get_tile(self: @T, map_id: u32, x: u32, y: u32) -> (u8, u8, bool, bool, bool);
}

#[dojo::contract]
pub mod city {
    use super::ICity;

    // Models
    use simula::models::map::{Map, MapTrait, MapAssert};
    use simula::models::tile::{Tile, TileTrait, TERRAIN_GRASS, TERRAIN_WATER, TERRAIN_MOUNTAIN, TERRAIN_FOREST};
    use simula::models::plot::{Plot, PlotTrait, PlotAssert};
    use simula::models::city_player::{CityPlayer, CityPlayerTrait, CityPlayerAssert, ZeroableCityPlayerTrait};
    use simula::models::building::{BuildingTrait, BUILDING_HABITAT};

    // Dojo imports
    use dojo::model::{ModelStorage};
    use dojo::world::{WorldStorage};

    // Starknet imports
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        map_counter: u32,
        building_counter: u32,
        admin: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MapGenerated: MapGenerated,
        PlotClaimed: PlotClaimed,
        BuildingConstructed: BuildingConstructed,
        ResourcesCollected: ResourcesCollected,
    }

    #[derive(Drop, starknet::Event)]
    struct MapGenerated {
        map_id: u32,
        width: u32,
        height: u32,
        admin: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct PlotClaimed {
        map_id: u32,
        x: u32,
        y: u32,
        owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct BuildingConstructed {
        building_id: u32,
        owner: ContractAddress,
        building_type: u8,
        x: u32,
        y: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ResourcesCollected {
        player: ContractAddress,
        energy: u32,
        water: u32,
    }

    // Constructor
    fn dojo_init(ref self: ContractState) {
        self.map_counter.write(1);
        self.building_counter.write(1);
        self.admin.write(get_caller_address());
    }

    #[abi(embed_v0)]
    impl CityImpl of ICity<ContractState> {
        // Admin generates a map with procedural terrain
        fn generate_map(ref self: ContractState, width: u32, height: u32, seed: u256) -> u32 {
            let caller = get_caller_address();
            let admin = self.admin.read();
            assert(caller == admin, 'Only admin can generate map');

            let mut world = self.world(@"simula");
            let map_id = self.map_counter.read();

            // Create map
            let map = MapTrait::new(
                map_id,
                width,
                height,
                seed,
                caller,
                get_block_timestamp()
            );
            world.write_model(@map);

            // Generate tiles procedurally
            self.generate_tiles(ref world, map_id, width, height, seed);

            self.map_counter.write(map_id + 1);

            self.emit(MapGenerated {
                map_id,
                width,
                height,
                admin: caller,
            });

            map_id
        }

        // Player claims a plot and gets starting balance
        fn claim_plot(ref self: ContractState, map_id: u32, x: u32, y: u32) {
            let caller = get_caller_address();
            let mut world = self.world(@"simula");

            // Check if map exists
            let map: Map = world.read_model(map_id);
            map.assert_exists();

            // Check if coordinates are valid
            assert(x < map.width, 'X coordinate out of bounds');
            assert(y < map.height, 'Y coordinate out of bounds');

            // Check if plot is not already claimed
            let plot: Plot = world.read_model((map_id, x, y));
            plot.assert_not_claimed();

            // Check if tile is buildable (not water)
            let tile: Tile = world.read_model((map_id, x, y));
            assert(tile.is_buildable(), 'Cannot build on water');

            // Create or get player
            let mut player: CityPlayer = world.read_model((caller, map_id));
            let current_time = get_block_timestamp();
            if player.is_zero() {
                player = CityPlayerTrait::new(
                    caller,
                    map_id,
                    1000, // Starting money
                    0,    // energy
                    0,    // water
                    0,    // iron
                    0,    // population
                    0,    // population_cap
                    current_time, // joined_at
                    current_time  // last_sync
                );
            }
            world.write_model(@player);

            // Claim plot
            let new_plot = PlotTrait::new(
                map_id,
                x,
                y,
                caller,
                get_block_timestamp()
            );
            world.write_model(@new_plot);

            self.emit(PlotClaimed {
                map_id,
                x,
                y,
                owner: caller,
            });
        }

        // Build a structure on owned plot
        fn build_structure(ref self: ContractState, map_id: u32, building_type: u8, x: u32, y: u32) {
            let caller = get_caller_address();
            let mut world = self.world(@"simula");

            // Check if plot is owned by caller
            let plot: Plot = world.read_model((map_id, x, y));
            plot.assert_owned_by(caller);

            // Get player
            let mut player: CityPlayer = world.read_model((caller, map_id));
            player.assert_exists();

            // Get cost and check if player can afford
            let cost = BuildingTrait::get_cost(building_type);
            assert(player.can_afford(cost), 'Insufficient funds');

            // Deduct cost
            player.deduct_money(cost);

            // Create building
            let building_id = self.building_counter.read();
            let building = BuildingTrait::new(
                building_id,
                map_id,
                caller,
                building_type,
                x,
                y,
                1, // Level 1
                get_block_timestamp()
            );

            // Update population cap if habitat
            if building_type == BUILDING_HABITAT {
                let capacity = building.get_production_per_hour();
                player.set_population_cap(player.population_cap + capacity);
            }

            // Save models
            world.write_model(@building);
            world.write_model(@player);

            self.building_counter.write(building_id + 1);

            self.emit(BuildingConstructed {
                building_id,
                owner: caller,
                building_type,
                x,
                y,
            });
        }

        // Sync resources based on time elapsed - Clash of Clans style!
        fn collect_resources(ref self: ContractState, map_id: u32) {
            let caller = get_caller_address();
            let mut world = self.world(@"simula");

            // Get player
            let mut player: CityPlayer = world.read_model((caller, map_id));
            player.assert_exists();

            let current_time = get_block_timestamp();
            let time_elapsed = current_time - player.last_sync; // in seconds
            let hours_elapsed = time_elapsed / 3600; // convert to hours

            if hours_elapsed == 0 {
                // Less than 1 hour passed, no resources to collect
                return;
            }

            // TODO: Query all buildings owned by player
            // For now, assume 1 of each building per hour for testing
            // Cast to u32 for compatibility with player model
            let money_gained: u32 = (hours_elapsed * 100).try_into().unwrap(); // $100/hour from gold mines
            let energy_gained: u32 = (hours_elapsed * 50).try_into().unwrap();  // 50/hour from energy plants
            let water_gained: u32 = (hours_elapsed * 50).try_into().unwrap();   // 50/hour from water extractors
            let iron_gained: u32 = (hours_elapsed * 20).try_into().unwrap();    // 20/hour from iron mines

            player.add_money(money_gained);
            player.add_energy(energy_gained);
            player.add_water(water_gained);
            player.add_iron(iron_gained);
            player.update_last_sync(current_time);

            world.write_model(@player);

            self.emit(ResourcesCollected {
                player: caller,
                energy: energy_gained,
                water: water_gained,
            });
        }

        // View function to get map details
        fn get_map(self: @ContractState, map_id: u32) -> (u32, u32, u32, u256) {
            let world = self.world(@"simula");
            let map: Map = world.read_model(map_id);
            (map.id, map.width, map.height, map.seed)
        }

        // View function to get tile details
        fn get_tile(self: @ContractState, map_id: u32, x: u32, y: u32) -> (u8, u8, bool, bool, bool) {
            let world = self.world(@"simula");
            let tile: Tile = world.read_model((map_id, x, y));
            (tile.terrain_type, tile.height, tile.has_iron, tile.has_coal, tile.has_gold)
        }
    }

    // Internal helper to generate tiles
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn generate_tiles(
            ref self: ContractState,
            ref world: WorldStorage,
            map_id: u32,
            width: u32,
            height: u32,
            seed: u256
        ) {
            let mut y = 0;
            loop {
                if y >= height {
                    break;
                }

                let mut x = 0;
                loop {
                    if x >= width {
                        break;
                    }

                    // Simple procedural generation using seed
                    let tile_seed = seed + x.into() * 1000 + y.into();
                    let terrain_value = (tile_seed % 100);

                    // Determine terrain type
                    let terrain_type = if terrain_value < 15 {
                        TERRAIN_WATER
                    } else if terrain_value < 25 {
                        TERRAIN_MOUNTAIN
                    } else if terrain_value < 45 {
                        TERRAIN_FOREST
                    } else {
                        TERRAIN_GRASS
                    };

                    // Generate height (0-255)
                    let height_val: u8 = ((tile_seed / 2) % 256).try_into().unwrap();

                    // Determine resources (sparse)
                    let has_iron = terrain_type == TERRAIN_MOUNTAIN && (tile_seed % 10 == 0);
                    let has_coal = terrain_type == TERRAIN_MOUNTAIN && (tile_seed % 12 == 0);
                    let has_gold = terrain_type == TERRAIN_MOUNTAIN && (tile_seed % 20 == 0);

                    let tile = TileTrait::new(
                        map_id,
                        x,
                        y,
                        terrain_type,
                        height_val,
                        has_iron,
                        has_coal,
                        has_gold
                    );

                    world.write_model(@tile);

                    x += 1;
                };

                y += 1;
            };
        }
    }
}
