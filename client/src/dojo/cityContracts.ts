import { Account, AccountInterface, Provider, RpcProvider } from "starknet";

// City contract address from .env
const CITY_CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CITY_CONTRACT || '0x6cee424a3a9bc50a46acc8df7b49d19e7c1f690f704fd8931c1821053b83606';

export interface MapInfo {
  id: number;
  width: number;
  height: number;
  seed: bigint;
}

export interface PlayerInfo {
  money: number;
  energy: number;
  water: number;
  iron: number;
  population: number;
  populationCap: number;
  joinedAt: number;
  lastSync: number;
}

export interface BuildingInfo {
  id: number;
  mapId: number;
  owner: string;
  buildingType: number;
  x: number;
  y: number;
  level: number;
  builtAt: number;
}

export interface CityContractCalls {
  claim_plot: (account: Account | AccountInterface, mapId: number, x: number, y: number) => Promise<any>;
  build_structure: (account: Account | AccountInterface, mapId: number, buildingType: number, x: number, y: number) => Promise<any>;
  collect_resources: (account: Account | AccountInterface, mapId: number) => Promise<any>;
  get_map: (provider: Provider | RpcProvider, mapId: number) => Promise<MapInfo>;
  get_player: (provider: Provider | RpcProvider, owner: string, mapId: number) => Promise<PlayerInfo>;
  get_building: (provider: Provider | RpcProvider, buildingId: number) => Promise<BuildingInfo>;
}

export function setupCityContract(): CityContractCalls {

  const claim_plot = async (
    snAccount: Account | AccountInterface,
    mapId: number,
    x: number,
    y: number
  ) => {
    try {
      console.log('Calling claim_plot with:', { mapId, x, y });

      const result = await snAccount.execute({
        contractAddress: CITY_CONTRACT_ADDRESS,
        entrypoint: 'claim_plot',
        calldata: [mapId, x, y],
      });

      console.log('claim_plot result:', result);
      return result;
    } catch (error) {
      console.error('claim_plot error:', error);
      throw error;
    }
  };

  const build_structure = async (
    snAccount: Account | AccountInterface,
    mapId: number,
    buildingType: number,
    x: number,
    y: number
  ) => {
    try {
      console.log('Calling build_structure with:', { mapId, buildingType, x, y });

      const result = await snAccount.execute({
        contractAddress: CITY_CONTRACT_ADDRESS,
        entrypoint: 'build_structure',
        calldata: [mapId, buildingType, x, y],
      });

      console.log('build_structure result:', result);
      return result;
    } catch (error) {
      console.error('build_structure error:', error);
      throw error;
    }
  };

  const collect_resources = async (
    snAccount: Account | AccountInterface,
    mapId: number
  ) => {
    try {
      console.log('Calling collect_resources with:', { mapId });

      const result = await snAccount.execute({
        contractAddress: CITY_CONTRACT_ADDRESS,
        entrypoint: 'collect_resources',
        calldata: [mapId],
      });

      console.log('collect_resources result:', result);
      return result;
    } catch (error) {
      console.error('collect_resources error:', error);
      throw error;
    }
  };

  const get_map = async (
    provider: Provider | RpcProvider,
    mapId: number
  ): Promise<MapInfo> => {
    try {
      console.log('Calling get_map with:', { mapId, contractAddress: CITY_CONTRACT_ADDRESS });

      // Use the correct call format for starknet-react provider
      // Use "latest" block instead of "pending"
      const result = await provider.callContract(
        {
          contractAddress: CITY_CONTRACT_ADDRESS,
          entrypoint: 'get_map',
          calldata: [mapId.toString()],
        },
        "latest"
      );

      console.log('get_map raw result:', result);

      // The result is an array of felts as strings
      // The contract returns: (id: u32, width: u32, height: u32, seed: u256)
      const id = Number(result.result?.[0] || result[0]);
      const width = Number(result.result?.[1] || result[1]);
      const height = Number(result.result?.[2] || result[2]);
      const seed = BigInt(result.result?.[3] || result[3] || '0');

      console.log('get_map parsed:', { id, width, height, seed });

      return { id, width, height, seed };
    } catch (error) {
      console.error('get_map error:', error);
      throw error;
    }
  };

  const get_player = async (
    provider: Provider | RpcProvider,
    owner: string,
    mapId: number
  ): Promise<PlayerInfo> => {
    try {
      console.log('Calling get_player with:', { owner, mapId, contractAddress: CITY_CONTRACT_ADDRESS });

      const result = await provider.callContract(
        {
          contractAddress: CITY_CONTRACT_ADDRESS,
          entrypoint: 'get_player',
          calldata: [owner, mapId.toString()],
        },
        "latest"
      );

      console.log('get_player raw result:', result);

      // Parse: (money, energy, water, iron, population, population_cap, joined_at, last_sync)
      const data = result.result || result;
      return {
        money: Number(data[0]),
        energy: Number(data[1]),
        water: Number(data[2]),
        iron: Number(data[3]),
        population: Number(data[4]),
        populationCap: Number(data[5]),
        joinedAt: Number(data[6]),
        lastSync: Number(data[7]),
      };
    } catch (error) {
      console.error('get_player error:', error);
      throw error;
    }
  };

  const get_building = async (
    provider: Provider | RpcProvider,
    buildingId: number
  ): Promise<BuildingInfo> => {
    try {
      console.log('Calling get_building with:', { buildingId, contractAddress: CITY_CONTRACT_ADDRESS });

      const result = await provider.callContract(
        {
          contractAddress: CITY_CONTRACT_ADDRESS,
          entrypoint: 'get_building',
          calldata: [buildingId.toString()],
        },
        "latest"
      );

      console.log('get_building raw result:', result);

      // Parse: (map_id, owner, building_type, x, y, level, built_at)
      const data = result.result || result;
      return {
        id: buildingId,
        mapId: Number(data[0]),
        owner: data[1],
        buildingType: Number(data[2]),
        x: Number(data[3]),
        y: Number(data[4]),
        level: Number(data[5]),
        builtAt: Number(data[6]),
      };
    } catch (error) {
      console.error('get_building error:', error);
      throw error;
    }
  };

  return {
    claim_plot,
    build_structure,
    collect_resources,
    get_map,
    get_player,
    get_building,
  };
}
