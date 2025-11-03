use starknet::ContractAddress;
use core::num::traits::zero::Zero;
use simula::constants;

// Building types
pub const BUILDING_GOLD_MINE: u8 = 0;
pub const BUILDING_ENERGY_PLANT: u8 = 1;
pub const BUILDING_WATER_EXTRACTOR: u8 = 2;
pub const BUILDING_HABITAT: u8 = 3;
pub const BUILDING_IRON_MINE: u8 = 4;

// Building costs
pub const COST_GOLD_MINE: u32 = 500;
pub const COST_ENERGY_PLANT: u32 = 300;
pub const COST_WATER_EXTRACTOR: u32 = 300;
pub const COST_HABITAT: u32 = 400;
pub const COST_IRON_MINE: u32 = 350;

// Building production rates per hour
pub const GOLD_PRODUCTION_PER_HOUR: u32 = 100; // $100/hour
pub const ENERGY_PRODUCTION_PER_HOUR: u32 = 50; // 50 energy/hour
pub const WATER_PRODUCTION_PER_HOUR: u32 = 50; // 50 water/hour
pub const HABITAT_CAPACITY: u32 = 50; // +50 population cap
pub const IRON_PRODUCTION_PER_HOUR: u32 = 20; // 20 iron/hour

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Building {
    #[key]
    pub id: u32,
    pub map_id: u32,
    pub owner: ContractAddress,
    pub building_type: u8,
    pub x: u32,
    pub y: u32,
    pub level: u8,
    pub built_at: u64,
}

#[generate_trait]
pub impl BuildingImpl of BuildingTrait {
    fn new(
        id: u32,
        map_id: u32,
        owner: ContractAddress,
        building_type: u8,
        x: u32,
        y: u32,
        level: u8,
        built_at: u64,
    ) -> Building {
        Building {
            id,
            map_id,
            owner,
            building_type,
            x,
            y,
            level,
            built_at,
        }
    }

    fn get_cost(building_type: u8) -> u32 {
        if building_type == BUILDING_GOLD_MINE {
            COST_GOLD_MINE
        } else if building_type == BUILDING_ENERGY_PLANT {
            COST_ENERGY_PLANT
        } else if building_type == BUILDING_WATER_EXTRACTOR {
            COST_WATER_EXTRACTOR
        } else if building_type == BUILDING_HABITAT {
            COST_HABITAT
        } else if building_type == BUILDING_IRON_MINE {
            COST_IRON_MINE
        } else {
            0
        }
    }

    fn get_production_per_hour(self: @Building) -> u32 {
        if *self.building_type == BUILDING_GOLD_MINE {
            GOLD_PRODUCTION_PER_HOUR
        } else if *self.building_type == BUILDING_ENERGY_PLANT {
            ENERGY_PRODUCTION_PER_HOUR
        } else if *self.building_type == BUILDING_WATER_EXTRACTOR {
            WATER_PRODUCTION_PER_HOUR
        } else if *self.building_type == BUILDING_HABITAT {
            HABITAT_CAPACITY
        } else if *self.building_type == BUILDING_IRON_MINE {
            IRON_PRODUCTION_PER_HOUR
        } else {
            0
        }
    }
}

pub impl ZeroableBuildingTrait of Zero<Building> {
    #[inline(always)]
    fn zero() -> Building {
        Building {
            id: 0,
            map_id: 0,
            owner: constants::ZERO_ADDRESS(),
            building_type: 0,
            x: 0,
            y: 0,
            level: 0,
            built_at: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Building) -> bool {
        *self.id == 0
    }

    #[inline(always)]
    fn is_non_zero(self: @Building) -> bool {
        !self.is_zero()
    }
}
