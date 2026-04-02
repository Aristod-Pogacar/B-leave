import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
    private algorithm = 'aes-256-gcm';
    private key: Buffer;

    constructor(private configService: ConfigService) {
        const secret = this.configService.get<string>('ENCRYPTION_SECRET');
        if (!secret) {
            throw new Error('ENCRYPTION_SECRET is missing');
        }

        // clé de 32 bytes
        this.key = crypto.createHash('sha256').update(secret).digest();
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(12); // recommandé pour GCM
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final(),
        ]);

        const authTag = cipher.getAuthTag();

        return Buffer.concat([iv, authTag, encrypted]).toString('base64');
    }

    decrypt(encryptedData: string): string {
        const data = Buffer.from(encryptedData, 'base64');
        // const data = Buffer.from(encryptedData, 'base64');

        if (data.length < 28) {
            throw new Error('Invalid encrypted data');
        }
        const iv = data.subarray(0, 12);
        const authTag = data.subarray(12, 28);
        const encrypted = data.subarray(28);
        console.log("IV length:", iv.length);
        console.log("Tag length:", authTag.length);
        console.log("Encrypted length:", encrypted.length);
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        const decryptedText = decrypted.toString('utf8');

        return decryptedText;
    }
}
