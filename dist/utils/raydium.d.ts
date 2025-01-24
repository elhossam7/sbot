import { PublicKey } from '@solana/web3.js';
export declare const RAYDIUM_LIQUIDITY_PROGRAM_ID: PublicKey;
export interface PoolData {
    address: PublicKey;
    tokenA: PublicKey;
    tokenB: PublicKey;
    liquidity: number;
}
export declare function parsePoolData(data: Buffer): PoolData;
export declare function isNewPool(poolData: PoolData): boolean;
export declare function getLiquidityPools(): Promise<PoolData[]>;
