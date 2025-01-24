import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { encrypt, decrypt } from '../utils/encryption';
import { PrismaClient } from '@prisma/client';
import config from '../config';

const prisma = new PrismaClient();
const connection = new Connection(config.RPC_URL);

export class WalletService {
    private connection: Connection;

    constructor(endpoint: string) {
        this.connection = new Connection(endpoint);
    }

    async generateNewWallet(userId: string): Promise<string> {
        // Generate new keypair
        const wallet = Keypair.generate();
        
        // Encrypt private key before storage
        const encryptedPrivateKey = encrypt(Buffer.from(wallet.secretKey).toString('hex'));
        
        // Store wallet info in database
        try {
            await prisma.wallet.create({
                data: {
                    userId,
                    publicKey: wallet.publicKey.toString(),
                    encryptedPrivateKey,
                    createdAt: new Date(),
                }
            });
            return wallet.publicKey.toString();
        } catch (error) {
            console.error('Error creating wallet in database:', error);
            throw new Error('Failed to create wallet');
        }
    }

    async getWallet(userId: string): Promise<{ publicKey: string; privateKey: string } | null> {
        try {
            const walletInfo = await prisma.wallet.findUnique({
                where: { userId }
            });

            if (!walletInfo) {
                return null;
            }

            return {
                publicKey: walletInfo.publicKey,
                privateKey: decrypt(walletInfo.encryptedPrivateKey)
            };
        } catch (error) {
            console.error(`Failed to retrieve wallet for userId ${userId}:`, error);
            return null;
        }
    }

    async initializeWallet(publicKey: string): Promise<boolean> {
        try {
            const airdropSignature = await this.connection.requestAirdrop(
                new PublicKey(publicKey),
                LAMPORTS_PER_SOL
            );
            await this.connection.confirmTransaction(airdropSignature);
            return true;
        } catch (error) {
            console.error(`Failed to initialize wallet for publicKey ${publicKey}:`, error);
            return false;
        }
    }

    async getWalletInfo(address: string) {
        const walletInfo = await prisma.wallet.findUnique({
            where: {
                address: address,
            },
        });

        if (!walletInfo) {
            throw new Error('Wallet not found');
        }

        // Get on-chain balance
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);

        return {
            ...walletInfo,
            balance: balance / 1e9, // Convert lamports to SOL
        };
    }

    async createWallet(userId: string, address: string, label?: string) {
        return await prisma.wallet.create({
            data: {
                userId,
                address,
                label,
            },
        });
    }
}
