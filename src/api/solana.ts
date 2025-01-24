import { Connection, Transaction, TransactionInstruction, Signer, PublicKey } from '@solana/web3.js';

function createTransaction(connection: Connection, instructions: TransactionInstruction[], signers: Signer[]) {
    const transaction = new Transaction().add(...instructions);
    return transaction;
}

async function sendTransaction(connection: Connection, transaction: Transaction, signers: Signer[]) {
    const signature = await connection.sendTransaction(transaction, signers);
    await connection.confirmTransaction(signature);
    return signature;
}

async function getAccountInfo(connection: Connection, publicKey: PublicKey) {
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo;
}

export { createTransaction, sendTransaction, getAccountInfo };