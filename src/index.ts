import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Telegraf, Context } from 'telegraf';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { registerCommands } from './bot/commands.js';
import { handleBalanceCommand, handleBuyCommand, handleSellCommand, handleError, handleStart } from './bot/handlers.js';
import { PrismaClient } from '@prisma/client';
import config from './config.js';

// Initialize ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenvConfig({ path: `${__dirname}/../.env` });

// Initialize bot and connection
const bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN!);
const prisma = new PrismaClient();

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

async function getUserWallet(userId: string): Promise<{ publicKey: PublicKey; balance: number }> {
  let wallet = userWallets.get(userId);
  if (!wallet) {
    wallet = Keypair.generate();
    userWallets.set(userId, wallet);
  }

  const balanceLamports = await connection.getBalance(wallet.publicKey);
  const balance = balanceLamports / 1e9; // Convert lamports to SOL
  return { publicKey: wallet.publicKey, balance };
}

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
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Execute main function
startBot().catch((error) => {
  console.error('Startup error:', error);
  process.exit(1);
});

export { bot, connection, prisma, getUserWallet, userWallets };
