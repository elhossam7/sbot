import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
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

// Environment validation with default values
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || defaultValue || '';
};

// Configuration object
const config: BotConfig = {
  PRIVATE_KEY: getEnvVar('PRIVATE_KEY'),
  RPC_URL: getEnvVar('RPC_URL', 'https://api.mainnet-beta.solana.com'),
  TELEGRAM_BOT_TOKEN: getEnvVar('TELEGRAM_BOT_TOKEN'),
  SOLANA_NETWORK: getEnvVar('SOLANA_NETWORK', 'mainnet-beta') as BotConfig['SOLANA_NETWORK'],
  DEX_API_URL: getEnvVar('DEX_API_URL', 'https://quote-api.jup.ag/v6'),
  MAX_RETRIES: parseInt(getEnvVar('MAX_RETRIES', '3'), 10),
  TIMEOUT_MS: parseInt(getEnvVar('TIMEOUT_MS', '30000'), 10),
  DEBUG_MODE: getEnvVar('DEBUG_MODE', 'false') === 'true',
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY', '5772428e-4b7b-4b3b-8b7b-4b3b8b7b4b3b')
};

export default config;