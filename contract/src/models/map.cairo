use starknet::ContractAddress;
use core::num::traits::zero::Zero;
use simula::constants;

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Map {
    #[key]
    pub id: u32,
    pub width: u32,
    pub height: u32,
    pub seed: u256,
    pub admin: ContractAddress,
    pub created_at: u64,
}

#[generate_trait]
pub impl MapImpl of MapTrait {
    fn new(
        id: u32,
        width: u32,
        height: u32,
        seed: u256,
        admin: ContractAddress,
        created_at: u64,
    ) -> Map {
        Map {
            id,
            width,
            height,
            seed,
            admin,
            created_at,
        }
    }
}

#[generate_trait]
pub impl MapAssert of AssertTrait {
    #[inline(always)]
    fn assert_exists(self: Map) {
        assert(self.is_non_zero(), 'Map: Does not exist');
    }

    #[inline(always)]
    fn assert_not_exists(self: Map) {
        assert(self.is_zero(), 'Map: Already exists');
    }
}

pub impl ZeroableMapTrait of Zero<Map> {
    #[inline(always)]
    fn zero() -> Map {
        Map {
            id: 0,
            width: 0,
            height: 0,
            seed: 0,
            admin: constants::ZERO_ADDRESS(),
            created_at: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Map) -> bool {
        *self.id == 0
    }

    #[inline(always)]
    fn is_non_zero(self: @Map) -> bool {
        !self.is_zero()
    }
}
