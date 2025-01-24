import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { prisma } from '../utils/prismaClient.js';
import config from '../config.js';
export class WalletService {
    connection;
    constructor(endpoint = config.RPC_URL) {
        this.connection = new Connection(endpoint);
    }
    async generateNewWallet(userId) {
        const keypair = Keypair.generate();
        const encryptedPrivateKey = encrypt(Buffer.from(keypair.secretKey).toString('hex'));
        try {
            const wallet = await prisma.userWallet.create({
                data: {
                    userId,
                    publicKey: keypair.publicKey.toString(),
                    encryptedPrivateKey,
                }
            });
            return wallet.publicKey;
        }
        catch (error) {
            console.error('Error creating wallet:', error);
            throw new Error('Failed to create wallet');
        }
    }
    async getWallet(userId) {
        try {
            const wallet = await prisma.userWallet.findUnique({
                where: { userId }
            });
            if (!wallet)
                return null;
            return {
                publicKey: wallet.publicKey,
                privateKey: decrypt(wallet.encryptedPrivateKey)
            };
        }
        catch (error) {
            console.error('Error retrieving wallet:', error);
            return null;
        }
    }
    async initializeWallet(publicKey) {
        try {
            const airdropSignature = await this.connection.requestAirdrop(new PublicKey(publicKey), LAMPORTS_PER_SOL);
            await this.connection.confirmTransaction(airdropSignature);
            return true;
        }
        catch (error) {
            console.error('Airdrop failed:', error);
            return false;
        }
    }
    async getWalletInfo(publicKey) {
        const wallet = await prisma.userWallet.findUnique({
            where: { publicKey }
        });
        if (!wallet)
            throw new Error('Wallet not found');
        const balance = await this.connection.getBalance(new PublicKey(publicKey));
        return {
            publicKey: wallet.publicKey,
            balance: balance / LAMPORTS_PER_SOL,
            createdAt: wallet.createdAt
        };
    }
    async createWallet(userId, label) {
        const keypair = Keypair.generate();
        const encryptedPrivateKey = encrypt(Buffer.from(keypair.secretKey).toString('hex'));
        return prisma.wallet.create({
            data: {
                userId,
                address: keypair.publicKey.toString(),
                label,
            }
        });
    }
    async findWalletByAddress(address) {
        return prisma.wallet.findUnique({
            where: {
                address,
            },
        });
    }
    async findWalletsByUserId(userId) {
        return prisma.wallet.findMany({
            where: {
                userId,
            },
        });
    }
    async deleteWallet(address) {
        return prisma.wallet.delete({
            where: {
                address,
            },
        });
    }
    async updateWalletLabel(address, label) {
        return prisma.wallet.update({
            where: {
                address,
            },
            data: {
                label,
            },
        });
    }
}
//# sourceMappingURL=WalletService.js.map