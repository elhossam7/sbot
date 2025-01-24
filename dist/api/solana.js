import { Transaction } from '@solana/web3.js';
function createTransaction(connection, instructions, signers) {
    const transaction = new Transaction().add(...instructions);
    return transaction;
}
async function sendTransaction(connection, transaction, signers) {
    const signature = await connection.sendTransaction(transaction, signers);
    await connection.confirmTransaction(signature);
    return signature;
}
async function getAccountInfo(connection, publicKey) {
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo;
}
export { createTransaction, sendTransaction, getAccountInfo };
//# sourceMappingURL=solana.js.map