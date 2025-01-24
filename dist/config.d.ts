interface BotConfig {
    PRIVATE_KEY: string;
    RPC_URL: string;
    TELEGRAM_BOT_TOKEN: string;
    SOLANA_NETWORK: 'mainnet-beta' | 'testnet' | 'devnet';
    DEX_API_URL: string;
    MAX_RETRIES: number;
    TIMEOUT_MS: number;
    DEBUG_MODE: boolean;
    ENCRYPTION_KEY: string;
}
declare const config: BotConfig;
export declare const TELEGRAM_BOT_TOKEN: string;
export declare const SOLANA_RPC_URL: string;
export default config;
