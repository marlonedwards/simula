use core::num::traits::zero::Zero;

// Terrain types
pub const TERRAIN_GRASS: u8 = 0;
pub const TERRAIN_WATER: u8 = 1;
pub const TERRAIN_MOUNTAIN: u8 = 2;
pub const TERRAIN_FOREST: u8 = 3;

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Tile {
    #[key]
    pub map_id: u32,
    #[key]
    pub x: u32,
    #[key]
    pub y: u32,
    pub terrain_type: u8,
    pub height: u8,
    pub has_iron: bool,
    pub has_coal: bool,
    pub has_gold: bool,
}

#[generate_trait]
pub impl TileImpl of TileTrait {
    fn new(
        map_id: u32,
        x: u32,
        y: u32,
        terrain_type: u8,
        height: u8,
        has_iron: bool,
        has_coal: bool,
        has_gold: bool,
    ) -> Tile {
        Tile {
            map_id,
            x,
            y,
            terrain_type,
            height,
            has_iron,
            has_coal,
            has_gold,
        }
    }

    fn is_buildable(self: @Tile) -> bool {
        // Can't build on water
        *self.terrain_type != TERRAIN_WATER
    }
}

pub impl ZeroableTileTrait of Zero<Tile> {
    #[inline(always)]
    fn zero() -> Tile {
        Tile {
            map_id: 0,
            x: 0,
            y: 0,
            terrain_type: 0,
            height: 0,
            has_iron: false,
            has_coal: false,
            has_gold: false,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Tile) -> bool {
        *self.map_id == 0
    }

    #[inline(always)]
    fn is_non_zero(self: @Tile) -> bool {
        !self.is_zero()
    }
}
