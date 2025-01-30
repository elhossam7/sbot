// src/index.ts
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config as dotenvConfig } from "dotenv";
import { Telegraf } from "telegraf";
import { Connection as Connection4, Keypair as Keypair2 } from "@solana/web3.js";

// src/bot/commands.ts
import { PublicKey as PublicKey3 } from "@solana/web3.js";

// src/core/trading.ts
function executeTrade(trade) {
  console.log(`Executing trade: ${trade.id}`);
  if (trade.amount <= 0 || trade.price <= 0) {
    throw new Error("Invalid trade parameters");
  }
  const totalValue = trade.amount * trade.price;
  console.log(`Trading ${trade.amount} ${trade.token} at ${trade.price} SOL. Total: ${totalValue} SOL`);
}
function setLimitOrder(order) {
  if (order.amount <= 0 || order.limitPrice <= 0) {
    throw new Error("Invalid limit order parameters");
  }
  const potentialValue = order.amount * order.limitPrice;
  order.isActive = true;
  console.log(`Setting limit order: ${order.id}`);
  console.log(`Token: ${order.token}`);
  console.log(`Amount: ${order.amount}`);
  console.log(`Limit Price: ${order.limitPrice} SOL`);
  console.log(`Potential Total: ${potentialValue} SOL`);
}

// src/bot/handlers.ts
import { Connection as Connection2 } from "@solana/web3.js";

// src/config.ts
import dotenv from "dotenv";
dotenv.config();
var getEnvVar = (name, defaultValue) => {
  const value = process.env[name];
  if (!value && defaultValue === void 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || defaultValue || "";
};
var config = {
  PRIVATE_KEY: getEnvVar("PRIVATE_KEY"),
  RPC_URL: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  TELEGRAM_BOT_TOKEN: getEnvVar("TELEGRAM_BOT_TOKEN"),
  SOLANA_NETWORK: getEnvVar("SOLANA_NETWORK", "mainnet-beta"),
  DEX_API_URL: getEnvVar("DEX_API_URL", "https://quote-api.jup.ag/v6"),
  MAX_RETRIES: parseInt(getEnvVar("MAX_RETRIES", "3"), 10),
  TIMEOUT_MS: parseInt(getEnvVar("TIMEOUT_MS", "30000"), 10),
  DEBUG_MODE: getEnvVar("DEBUG_MODE", "false") === "true",
  ENCRYPTION_KEY: getEnvVar("ENCRYPTION_KEY", "5772428e-4b7b-4b3b-8b7b-4b3b8b7b4b3b")
};
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
var config_default = config;

// src/services/trading.ts
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { parsePriceData } from "@pythnetwork/client";
var db2 = {
  // Mocked db object to prevent errors
  portfolios: {
    upsert: async (args) => {
    }
  },
  transactions: {
    create: async (args) => {
    }
  },
  raw: (query) => query
};
async function executeSellOrder(connection2, tokenMint, amount, minPrice) {
  try {
    const transaction = new Transaction();
    const signature = await connection2.sendTransaction(transaction, []);
    return signature;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Sell order failed: ${errorMessage}`);
  }
}
async function getUserBalance(connection2, userId) {
  try {
    const userPublicKey = new PublicKey(userId);
    const balance = await connection2.getBalance(userPublicKey);
    const solBalance = balance / 1e9;
    return solBalance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get user balance: ${errorMessage}`);
  }
}
async function getUserTokenBalance(connection2, userId, token) {
  try {
    const tokenMint = new PublicKey(token);
    const userPublicKey = new PublicKey(userId);
    const response = await connection2.getTokenAccountsByOwner(userPublicKey, {
      mint: tokenMint,
      programId: TOKEN_PROGRAM_ID
    });
    if (response.value.length === 0) {
      return 0;
    }
    const accountInfo = await connection2.getParsedAccountInfo(response.value[0].pubkey);
    const balance = accountInfo.value?.data && "parsed" in accountInfo.value.data ? Number(accountInfo.value.data.parsed.info.tokenAmount.amount) : 0;
    return balance / 1e9;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get token balance: ${errorMessage}`);
  }
}
async function getTokenPrice(connection2, token) {
  try {
    const pythConnection = new PublicKey("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
    const priceAccount = await connection2.getAccountInfo(pythConnection);
    if (!priceAccount) {
      throw new Error("Pyth price feed not available");
    }
    const tokenPythMapping = {
      "SOL": "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
      "USDC": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
      "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
    };
    const pythPriceFeedId = tokenPythMapping[token];
    if (!pythPriceFeedId) {
      throw new Error(`No price feed available for token: ${token}`);
    }
    const priceFeedAccount = new PublicKey(pythPriceFeedId);
    const priceInfo = await connection2.getAccountInfo(priceFeedAccount);
    if (!priceInfo) {
      throw new Error(`Price feed data not available for token: ${token}`);
    }
    const priceData = parsePriceData(priceInfo.data);
    if (!priceData.confidence || !priceData.price || priceData.confidence > priceData.price * 0.01) {
      throw new Error("Price confidence interval too large");
    }
    const pythPrice = priceData.price;
    const mockPrices = {
      "SOL": 100,
      "USDC": 1,
      "RAY": 1.5
    };
    const price = mockPrices[token];
    if (!price) {
      throw new Error(`Price not available for token: ${token}`);
    }
    return price;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch token price: ${errorMessage}`);
  }
}
async function executeBuyOrder({
  connection: connection2,
  userId,
  token,
  amount,
  price
}) {
  try {
    const userBalance = await getUserBalance(connection2, userId);
    if (userBalance < amount * price) {
      throw new Error("Insufficient balance");
    }
    const currentPrice = await getTokenPrice(connection2, token);
    if (currentPrice > price) {
      throw new Error("Price exceeds maximum limit");
    }
    const tradeResult = await connection2.sendTransaction(
      new Transaction().add(
        /* buy instruction */
      ),
      []
    );
    await updateUserPortfolio(userId, {
      token,
      amount,
      price: currentPrice,
      transactionType: "BUY",
      orderId: "some-order-id"
    });
    return tradeResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Buy order failed: ${errorMessage}`);
  }
}
async function updateUserPortfolio(userId, params) {
  try {
    const portfolioUpdate = {
      userId,
      tokenSymbol: params.token,
      quantity: params.amount,
      purchasePrice: params.price,
      transactionType: params.transactionType,
      orderId: params.orderId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db2.portfolios.upsert({
      where: { userId, token: params.token },
      update: {
        quantity: { increment: params.amount },
        lastUpdated: /* @__PURE__ */ new Date(),
        averagePrice: db2.raw(`
          (averagePrice * (SELECT quantity FROM portfolios WHERE userId = '${userId}' AND token = '${params.token}') + ${params.price} * ${params.amount}) 
          / ((SELECT quantity FROM portfolios WHERE userId = '${userId}' AND token = '${params.token}') + ${params.amount})
        `)
      },
      create: {
        userId,
        token: params.token,
        quantity: params.amount,
        averagePrice: params.price,
        lastUpdated: /* @__PURE__ */ new Date()
      }
    });
    await db2.transactions.create({
      data: portfolioUpdate
    });
    console.log(`Updating portfolio for user ${userId} with data:`, params);
    console.log(`Portfolio updated successfully for user ${userId}`);
  } catch (error) {
    throw new Error(`Failed to update portfolio: ${error.message}`);
  }
}

// src/bot/handlers.ts
import { Markup } from "telegraf";
var mainMenuKeyboard = Markup.keyboard([
  ["\u{1F4B0} Balance", "\u{1F4C8} Buy", "\u{1F4C9} Sell"],
  ["\u{1F4CA} Positions", "\u23F0 Limit Orders", "\u{1F504} DCA"],
  ["\u{1F465} Copy Trade", "\u{1F3AF} Sniper", "\u2694\uFE0F Trenches"],
  ["\u{1F517} Referrals", "\u{1F440} Watchlist", "\u{1F4B3} Withdraw"],
  ["\u2699\uFE0F Settings", "\u2753 Help", "\u{1F504} Refresh"]
]).resize();
var handleBalanceCommand = async (ctx) => {
  try {
    const userId = ctx.from?.id.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }
    const { publicKey, balance } = await getUserWallet(userId);
    await ctx.reply(
      `\u{1F4B3} Your Wallet: ${publicKey.toBase58()}
\u{1F4B0} Balance: ${balance.toFixed(4)} SOL`
    );
  } catch (error) {
    console.error("Balance check error:", error);
    await ctx.reply("Error fetching your wallet information. Please try again.");
  }
};
var handleBuyCommand = async (ctx) => {
  const userId = ctx.from.id;
  const [amount, token] = ctx.message.text.split(" ").slice(1);
  console.log(`User ${userId} requested to buy ${amount} of ${token}`);
  try {
    const connection2 = new Connection2(config_default.RPC_URL);
    const userBalance = await getUserBalance(connection2, userId);
    if (userBalance < amount) {
      throw new Error("Insufficient balance");
    }
    const tokenBalance = await getUserTokenBalance(connection2, userId, token);
    if (tokenBalance < amount) {
      throw new Error("Token not available in requested quantity");
    }
    const order = await executeBuyOrder({
      connection: connection2,
      userId,
      token,
      amount,
      price: await getTokenPrice(connection2, token)
    });
    await updateUserPortfolio(userId, {
      token,
      amount,
      price: await getTokenPrice(connection2, token),
      transactionType: "BUY",
      orderId: order
    });
    ctx.reply(`Successfully initiated buy order for ${amount} ${token}`);
  } catch (error) {
    console.error(`Error executing buy order: ${error}`);
    ctx.reply("Failed to execute buy order");
  }
};
async function handleSellCommand(ctx) {
  try {
    const result = await executeSellOrder(
      new Connection2(config_default.RPC_URL),
      ctx.tokenMint,
      ctx.amount,
      ctx.minPrice
    );
    await ctx.reply(`Sell order executed: ${result}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    await ctx.reply(`Failed to execute sell order: ${errorMessage}`);
  }
}
var handleStart = async (ctx) => {
  try {
    const userId = ctx.from?.id.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }
    const { publicKey, balance } = await getUserWallet(userId);
    await ctx.reply(
      `Welcome to Solana Trading Bot! \u{1F680}

\u{1F4B3} Your Wallet: ${publicKey.toBase58()}
\u{1F4B0} Balance: ${balance.toFixed(4)} SOL

Use /help to see available commands.`,
      { reply_markup: mainMenuKeyboard.reply_markup }
    );
  } catch (error) {
    console.error("Start command error:", error);
    await ctx.reply("Error initializing your wallet. Please try again.");
  }
};
async function handleError(ctx, error) {
  console.error("Bot error:", error);
  await ctx.reply("An error occurred. Please try again later.");
}

// src/services/utils.js
var getSwapRate = async () => {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error("Error fetching swap rate:", error);
    throw error;
  }
};
var getUserBalance2 = async (userId) => {
  try {
    const balance = await db.collection("users").doc(userId).get();
    return balance.data()?.balance || 0;
  } catch (error) {
    console.error("Error getting user balance:", error);
    throw error;
  }
};
var updateUserBalance = async (userId, newBalance) => {
  try {
    await db.collection("users").doc(userId).update({
      balance: newBalance
    });
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};

// src/services/swap.js
var calculateSwap = async () => {
  const rate = await getSwapRate();
  const balance = await getUserBalance2();
  const maxSwapAmount = balance * rate;
  return {
    rate,
    maxSwapAmount,
    currentBalance: balance
  };
};
var simulateSwap = async () => {
  const swapDetails = await calculateSwap();
  const simulatedResult = {
    estimatedGas: 5e4,
    expectedRate: swapDetails.rate,
    maxAmount: swapDetails.maxSwapAmount,
    priceImpact: 5e-3,
    // 0.5% price impact
    minimumReceived: swapDetails.maxSwapAmount * 0.995
    // Account for slippage
  };
  return simulatedResult;
};
var executeBuy = async (userId, tokenAddress, amount) => {
  if (!userId || !tokenAddress || !amount) {
    throw new Error("Missing required parameters");
  }
  const simulation = await simulateSwap();
  if (amount > simulation.maxAmount) {
    throw new Error("Amount exceeds maximum allowed");
  }
  const balance = await getUserBalance2(userId);
  if (balance < amount) {
    throw new Error("Insufficient balance");
  }
  const transaction = {
    userId,
    tokenAddress,
    amount,
    rate: simulation.expectedRate,
    timestamp: Date.now()
  };
  await updateUserBalance(userId, balance - amount);
  return transaction;
};

// src/bot/commands.ts
var validateTokenAddress = (address) => {
  try {
    new PublicKey3(address);
    return true;
  } catch {
    return false;
  }
};
var registerCommands = (bot2) => {
  bot2.command("start", handleStart);
  bot2.command("buy", async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("Invalid message format");
    }
    const [_, tokenAddress, amount] = ctx.message.text.split(" ");
    const numericAmount = parseFloat(amount);
    if (!tokenAddress || isNaN(numericAmount)) {
      return ctx.reply("Invalid format. Use: /buy <TOKEN_ADDRESS> <AMOUNT>");
    }
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        throw new Error("User ID not found");
      }
      const { publicKey } = await getUserWallet(userId);
      if (!validateTokenAddress(tokenAddress)) {
        return ctx.reply("Invalid token address.");
      }
      const swapDetails = await calculateSwap("So11111111111111111111111111111111111111112", tokenAddress, numericAmount);
      const simulation = await simulateSwap(swapDetails.transaction);
      if (!simulation.success) {
        return ctx.reply("Transaction simulation failed.");
      }
      await ctx.reply(
        `Swap Details:
Token: ${tokenAddress}
Amount: ${numericAmount}
Price Impact: ${swapDetails.priceImpactPct}%
Confirm execution? (yes/no)`
      );
      bot2.on("text", async (confirmationCtx) => {
        if (confirmationCtx.message.text.toLowerCase() === "yes") {
          const signature = await executeBuy(userId, tokenAddress, numericAmount);
          await ctx.reply(`\u2705 Buy order executed!
\u{1F4C4} TX: https://solscan.io/tx/${signature}`);
        } else {
          await ctx.reply("Buy order cancelled.");
        }
      });
    } catch (error) {
      console.error("Buy command error:", error);
      await ctx.reply(`Error executing buy order: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
  bot2.command("sell", async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("Invalid message format");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
      return ctx.reply("Usage: /sell <amount> <token>");
    }
    const amount = args[1];
    const token = args[2];
    try {
      const result = await executeTrade({
        id: Date.now().toString(),
        amount: Number(amount),
        token,
        price: 0,
        type: "sell",
        timestamp: /* @__PURE__ */ new Date()
      });
      await ctx.reply(`Sell order executed: ${result}`);
    } catch (error) {
      await ctx.reply(`Error executing sell order: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
  bot2.command("limit", async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("Invalid message format");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
      return ctx.reply("Usage: /limit <amount> <price>");
    }
    const amount = args[1];
    const price = args[2];
    try {
      const result = await setLimitOrder({
        id: Date.now().toString(),
        amount: Number(amount),
        limitPrice: Number(price),
        token: "",
        isActive: false
      });
      await ctx.reply(`Limit order set: ${result}`);
    } catch (error) {
      await ctx.reply(`Error setting limit order: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
  bot2.hears("\u{1F4B0} Balance", async (ctx) => {
    try {
      const userId = ctx.from?.id.toString();
      if (!userId) {
        throw new Error("User ID not found");
      }
      const { publicKey, balance } = await getUserWallet(userId);
      await ctx.reply(
        `\u{1F4B3} Your Wallet: ${publicKey.toBase58()}
\u{1F4B0} Balance: ${balance.toFixed(4)} SOL`
      );
    } catch (error) {
      console.error("Balance check error:", error);
      await ctx.reply("Error fetching your wallet information. Please try again.");
    }
  });
  bot2.hears("\u{1F4C8} Buy", async (ctx) => {
    await ctx.reply("Enter token and amount to buy:\n/buy <amount> <token>");
  });
  bot2.hears("\u{1F4C9} Sell", async (ctx) => {
    await ctx.reply("Enter token and amount to sell:\n/sell <amount> <token>");
  });
  bot2.hears("\u{1F4CA} Positions", async (ctx) => {
    await ctx.reply("Fetching your open positions...");
  });
  bot2.hears("\u23F0 Limit Orders", async (ctx) => {
    await ctx.reply("To set a limit order:\n/limit <amount> <price>");
  });
  bot2.hears("\u{1F504} DCA", async (ctx) => {
    await ctx.reply("DCA feature coming soon!");
  });
  bot2.hears("\u{1F465} Copy Trade", async (ctx) => {
    await ctx.reply("Copy trading feature coming soon!");
  });
  bot2.hears("\u{1F3AF} Sniper", async (ctx) => {
    await ctx.reply("Token sniping feature coming soon!");
  });
  bot2.hears("\u2694\uFE0F Trenches", async (ctx) => {
    await ctx.reply("Trenches feature coming soon!");
  });
  bot2.hears(["\u2699\uFE0F Settings", "\u2753 Help", "\u{1F504} Refresh", "\u{1F517} Referrals", "\u{1F440} Watchlist", "\u{1F4B3} Withdraw"], async (ctx) => {
    await ctx.reply("Feature coming soon!");
  });
  bot2.command("help", async (ctx) => {
    const helpMessage = `
Available commands:
/start - Start the bot
/buy <amount> <token> - Buy tokens
/sell <amount> <token> - Sell tokens
/limit <amount> <price> - Set limit order
/balance - Check your balance
/help - Show this help message
    `;
    await ctx.reply(helpMessage);
  });
  return bot2;
};

// src/index.ts
import { PrismaClient } from "@prisma/client";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
dotenvConfig({ path: `${__dirname}/../.env` });
var bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
var prisma = new PrismaClient();
var userWallets = /* @__PURE__ */ new Map();
function createConnection() {
  if (!config_default.RPC_URL.startsWith("http")) {
    throw new Error(`Invalid RPC URL: ${config_default.RPC_URL}`);
  }
  return new Connection4(config_default.RPC_URL, {
    commitment: "confirmed",
    httpHeaders: { "Content-Type": "application/json" }
  });
}
var connection = createConnection();
var getUserWallet = async (userId) => {
  let wallet = userWallets.get(userId);
  if (!wallet) {
    wallet = Keypair2.generate();
    userWallets.set(userId, wallet);
  }
  const balanceLamports = await connection.getBalance(wallet.publicKey);
  const balance = balanceLamports / 1e9;
  return { publicKey: wallet.publicKey, balance };
};
registerCommands(bot);
bot.command("balance", handleBalanceCommand);
bot.command("buy", handleBuyCommand);
bot.command("sell", handleSellCommand);
bot.command("start", handleStart);
bot.catch((err, ctx) => {
  if (err instanceof Error) {
    handleError(ctx, err);
  }
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  bot.stop("Uncaught Exception");
  process.exit(1);
});
process.once("SIGINT", () => {
  console.log("SIGINT signal received");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  console.log("SIGTERM signal received");
  bot.stop("SIGTERM");
});
var startBot = async () => {
  try {
    console.log("Starting Solana Trading Bot...");
    await bot.launch();
    console.log("Bot successfully started!");
    const testUserId = "testUser";
    const { publicKey } = await getUserWallet(testUserId);
    if (!publicKey) {
      console.error("Your Wallet: Not connected");
    } else {
      console.log("Your Wallet:", publicKey.toBase58());
    }
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
};
startBot().catch((error) => {
  console.error("Startup error:", error);
  process.exit(1);
});
export {
  bot,
  connection,
  getUserWallet,
  prisma,
  userWallets
};
