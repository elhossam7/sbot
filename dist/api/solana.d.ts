import { Connection, Transaction, TransactionInstruction, Signer, PublicKey } from '@solana/web3.js';
declare function createTransaction(connection: Connection, instructions: TransactionInstruction[], signers: Signer[]): Transaction;
declare function sendTransaction(connection: Connection, transaction: Transaction, signers: Signer[]): Promise<string>;
declare function getAccountInfo(connection: Connection, publicKey: PublicKey): Promise<import("@solana/web3.js").AccountInfo<Buffer<ArrayBufferLike>> | null>;
export { createTransaction, sendTransaction, getAccountInfo };
