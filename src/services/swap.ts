import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';
import JSBI from 'jsbi';
import { getUserWallet } from '../index.js';
import config from '../config.js';

interface SwapDetails {
  transaction: any;
  priceImpactPct: number;
}

export async function calculateSwap(inputToken: string, outputToken: string, amount: number): Promise<SwapDetails> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
    user: Keypair.generate() // Replace with actual user keypair
  });
  const amountInBigInt = JSBI.BigInt(Math.round(amount).toString());
  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputToken),
    outputMint: new PublicKey(outputToken),
    amount: amountInBigInt,
    slippageBps: 100, // 1% slippage
    forceFetch: true
  });

  const bestRoute = routes.routesInfos[0];
  const exchangeResult = await jupiter.exchange({
    routeInfo: bestRoute
  });

  return {
    transaction: exchangeResult.swapTransaction,
    priceImpactPct: bestRoute.priceImpactPct
  };
}

export async function simulateSwap(transaction: Transaction): Promise<{ success: boolean }> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const simulation = await connection.simulateTransaction(transaction);

  if (simulation.value.err) {
    throw new Error(`Simulation failed: ${simulation.value.err}`);
  }

  return {
    success: !simulation.value.err
  };
}

export async function executeBuy(userId: string, tokenAddress: string, amount: number): Promise<string> {
  const { publicKey, balance } = await getUserWallet(userId);
  const keypair = Keypair.fromSecretKey(publicKey.toBuffer());

  const swapDetails = await calculateSwap('So11111111111111111111111111111111111111112', tokenAddress, amount);
  const transaction = swapDetails.transaction;

  transaction.sign(keypair);
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const signature = await connection.sendTransaction(transaction, [keypair]);

  await connection.confirmTransaction(signature);

  return signature;
}
