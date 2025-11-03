use starknet::ContractAddress;
use core::num::traits::zero::Zero;
use simula::constants;

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct CityPlayer {
    #[key]
    pub owner: ContractAddress,
    #[key]
    pub map_id: u32,
    pub money: u32,
    pub energy: u32,
    pub water: u32,
    pub iron: u32,
    pub population: u32,
    pub population_cap: u32,
    pub joined_at: u64,
    pub last_sync: u64, // Timestamp of last resource sync
}

#[generate_trait]
pub impl CityPlayerImpl of CityPlayerTrait {
    fn new(
        owner: ContractAddress,
        map_id: u32,
        money: u32,
        energy: u32,
        water: u32,
        iron: u32,
        population: u32,
        population_cap: u32,
        joined_at: u64,
        last_sync: u64,
    ) -> CityPlayer {
        CityPlayer {
            owner,
            map_id,
            money,
            energy,
            water,
            iron,
            population,
            population_cap,
            joined_at,
            last_sync,
        }
    }

    fn can_afford(self: @CityPlayer, cost: u32) -> bool {
        *self.money >= cost
    }

    fn deduct_money(ref self: CityPlayer, amount: u32) {
        assert(self.money >= amount, 'Insufficient funds');
        self.money -= amount;
    }

    fn add_money(ref self: CityPlayer, amount: u32) {
        self.money += amount;
    }

    fn add_energy(ref self: CityPlayer, amount: u32) {
        self.energy += amount;
    }

    fn add_water(ref self: CityPlayer, amount: u32) {
        self.water += amount;
    }

    fn add_iron(ref self: CityPlayer, amount: u32) {
        self.iron += amount;
    }

    fn set_population_cap(ref self: CityPlayer, cap: u32) {
        self.population_cap = cap;
    }

    fn update_last_sync(ref self: CityPlayer, timestamp: u64) {
        self.last_sync = timestamp;
    }
}

#[generate_trait]
pub impl CityPlayerAssert of AssertTrait {
    #[inline(always)]
    fn assert_exists(self: CityPlayer) {
        assert(self.is_non_zero(), 'CityPlayer: Does not exist');
    }

    #[inline(always)]
    fn assert_not_exists(self: CityPlayer) {
        assert(self.is_zero(), 'CityPlayer: Already exists');
    }
}

pub impl ZeroableCityPlayerTrait of Zero<CityPlayer> {
    #[inline(always)]
    fn zero() -> CityPlayer {
        CityPlayer {
            owner: constants::ZERO_ADDRESS(),
            map_id: 0,
            money: 0,
            energy: 0,
            water: 0,
            iron: 0,
            population: 0,
            population_cap: 0,
            joined_at: 0,
            last_sync: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @CityPlayer) -> bool {
        *self.owner == constants::ZERO_ADDRESS()
    }

    #[inline(always)]
    fn is_non_zero(self: @CityPlayer) -> bool {
        !self.is_zero()
    }
}
