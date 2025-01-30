import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Telegraf, Context } from 'telegraf';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { registerCommands } from './bot/commands.js';
import { handleBalanceCommand, handleBuyCommand, handleSellCommand, handleError, handleStart } from './bot/handlers.js';
import prisma from './db/client.js';
import config from './config.js';
import { Client } from 'rpc-websockets';

// Initialize ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenvConfig({ path: `${__dirname}/../.env` });

// Initialize bot and connection
const bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN!);

const userWallets: Map<string, Keypair> = new Map();

function createConnection(): Connection {
  if (!config.RPC_URL.startsWith('http')) {
    throw new Error(`Invalid RPC URL: ${config.RPC_URL}`);
  }
  return new Connection(config.RPC_URL, {
    commitment: 'confirmed',
    httpHeaders: { 'Content-Type': 'application/json' }
  });
}

const connection = createConnection();

interface UserWallet {
  publicKey: PublicKey;
  balance: number;
}

export const getUserWallet = async (userId: string): Promise<UserWallet> => {
  let wallet = userWallets.get(userId);
  if (!wallet) {
    wallet = Keypair.generate();
    userWallets.set(userId, wallet);
  }

  const balanceLamports = await connection.getBalance(wallet.publicKey);
  const balance = balanceLamports / 1e9; // Convert lamports to SOL
  return { publicKey: wallet.publicKey, balance };
};

// Register commands and handlers
registerCommands(bot);

bot.command('balance', handleBalanceCommand);
bot.command('buy', handleBuyCommand);
bot.command('sell', handleSellCommand);
bot.command('start', handleStart);

// Error handling
bot.catch((err: unknown, ctx) => {
  if (err instanceof Error) {
    handleError(ctx, err);
  }
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  bot.stop('Uncaught Exception');
  process.exit(1);
});

// Graceful shutdown handlers
process.once('SIGINT', () => {
  console.log('SIGINT signal received');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('SIGTERM signal received');
  bot.stop('SIGTERM');
});

// Start bot with error handling
const startBot = async () => {
  try {
    console.log('Starting Solana Trading Bot...');
    await bot.launch();
    console.log('Bot successfully started!');

    // Check wallet connection
    const testUserId = 'testUser';
    const { publicKey } = await getUserWallet(testUserId);
    if (!publicKey) {
      console.error("Your Wallet: Not connected");
    } else {
      console.log("Your Wallet:", publicKey.toBase58());
    }
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Execute main function
    await startBot();
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { bot, connection, prisma, userWallets };
