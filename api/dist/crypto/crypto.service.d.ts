import { ConfigService } from '@nestjs/config';
export declare class CryptoService {
    private configService;
    private algorithm;
    private key;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(encryptedData: string): string;
}
