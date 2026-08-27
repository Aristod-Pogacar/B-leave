import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { FingerprintService } from './fingerprint.service';
type ClientType = 'esp32' | 'expo' | 'unknown';
export declare class FingerprintGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly fingerprintService;
    server: Server;
    private clients;
    constructor(fingerprintService: FingerprintService);
    handleConnection(socket: WebSocket): void;
    handleDisconnect(socket: WebSocket): void;
    handleIdentify(data: {
        type: ClientType;
    }, socket: WebSocket): void;
    handleStartListening(): void;
    handleStopListening(): void;
    handleStartEnroll(data: {
        matricule: string;
    }): Promise<void>;
    handleEnrollStep(data: {
        step: number;
    }): void;
    handleEnrollSuccess(data: {
        fingerprintId: number;
        matricule: string;
    }): Promise<void>;
    handleEnrollFailed(data: {
        message: string;
    }): void;
    handleFingerprintMatch(data: {
        fingerprintId: number;
        score: number;
    }): Promise<void>;
    handleFingerprintUnknown(): void;
    handleDeleteFingerprint(data: {
        matricule: string;
    }): Promise<void>;
    handleDeleteSuccess(data: {
        fingerprintId: number;
    }): void;
    handleDeleteFailed(data: {
        message: string;
    }): void;
    private sendToESP32;
    private sendToExpo;
}
export {};
