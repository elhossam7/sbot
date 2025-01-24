import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Telegraf, Context } from 'telegraf';
import { Connection } from '@solana/web3.js';
import { registerCommands } from './bot/commands.js';
import prisma from './db/client.js';

interface BotContext extends Context {
  wallet?: {
    address: string;
    connection: Connection;
  };
}

// Initialize ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/../.env` });

// Bot configuration
const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  RPC_URL: process.env.RPC_URL || '',
  SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'mainnet-beta',
  PRIVATE_KEY: process.env.PRIVATE_KEY || ''
};
const bot = new Telegraf<BotContext>(config.TELEGRAM_BOT_TOKEN);
// Validate required configuration
if (!config.TELEGRAM_BOT_TOKEN || !config.RPC_URL) {
  throw new Error('Missing required environment variables');
}

// Initialize connection
const connection = new Connection(config.RPC_URL);

// Register all commands and menu handlers
registerCommands(bot);

// Initialize database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Add middleware for wallet connection
bot.use(async (ctx, next) => {
  ctx.wallet = {
    address: config.PRIVATE_KEY,
    connection: connection
  };
  await next();
});

// Error handling
bot.catch((err: unknown, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Please try again.');
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Graceful shutdown
  bot.stop('Uncaught Exception');
  process.exit(1);
});

// Add cleanup for database connection
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Start bot with error handling
const startBot = async () => {
  try {
    await prisma.$connect();
    console.log('Starting Solana Trading Bot...');
    await bot.launch();
    console.log('Bot successfully started!');

    // Graceful shutdown handlers
    process.once('SIGINT', async () => {
      await prisma.$disconnect();
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', async () => {
      await prisma.$disconnect();
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Execute main function
startBot().catch((error) => {
  console.error('Startup error:', error);
  process.exit(1);
});

export { bot, connection };
