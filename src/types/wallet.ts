import { PublicKey } from '@solana/web3.js';

export interface UserWallet {
  publicKey: PublicKey;
  secretKey: Uint8Array;
}
