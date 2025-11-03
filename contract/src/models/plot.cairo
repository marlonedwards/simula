use starknet::ContractAddress;
use core::num::traits::zero::Zero;
use simula::constants;

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Plot {
    #[key]
    pub map_id: u32,
    #[key]
    pub x: u32,
    #[key]
    pub y: u32,
    pub owner: ContractAddress,
    pub claimed_at: u64,
}

#[generate_trait]
pub impl PlotImpl of PlotTrait {
    fn new(
        map_id: u32,
        x: u32,
        y: u32,
        owner: ContractAddress,
        claimed_at: u64,
    ) -> Plot {
        Plot {
            map_id,
            x,
            y,
            owner,
            claimed_at,
        }
    }

    fn is_claimed(self: @Plot) -> bool {
        *self.owner != constants::ZERO_ADDRESS()
    }
}

#[generate_trait]
pub impl PlotAssert of AssertTrait {
    #[inline(always)]
    fn assert_not_claimed(self: Plot) {
        assert(self.owner == constants::ZERO_ADDRESS(), 'Plot: Already claimed');
    }

    #[inline(always)]
    fn assert_owned_by(self: Plot, address: ContractAddress) {
        assert(self.owner == address, 'Plot: Not owner');
    }
}

pub impl ZeroablePlotTrait of Zero<Plot> {
    #[inline(always)]
    fn zero() -> Plot {
        Plot {
            map_id: 0,
            x: 0,
            y: 0,
            owner: constants::ZERO_ADDRESS(),
            claimed_at: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Plot) -> bool {
        *self.owner == constants::ZERO_ADDRESS()
    }

    #[inline(always)]
    fn is_non_zero(self: @Plot) -> bool {
        !self.is_zero()
    }
}
