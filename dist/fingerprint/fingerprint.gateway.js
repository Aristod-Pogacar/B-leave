"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const fingerprint_service_1 = require("./fingerprint.service");
let FingerprintGateway = class FingerprintGateway {
    fingerprintService;
    server;
    clients = new Map();
    constructor(fingerprintService) {
        this.fingerprintService = fingerprintService;
    }
    handleConnection(socket) {
        this.clients.set(socket, { socket, type: 'unknown' });
        console.log(`[WS] Connecté (total: ${this.clients.size})`);
    }
    handleDisconnect(socket) {
        const disconnectedClient = this.clients.get(socket);
        if (disconnectedClient) {
            console.log(`[WS] Déconnecté: ${disconnectedClient.type}`);
        }
        this.clients.delete(socket);
        console.log(`[WS] Déconnecté (total: ${this.clients.size})`);
    }
    handleIdentify(data, socket) {
        const client = this.clients.get(socket);
        if (client)
            client.type = data.type;
        console.log(`[GW] Client: ${data.type}`);
    }
    handleStartListening() {
        console.log(`[GW] Start listening`);
        this.sendToESP32({ event: 'listen_fingerprint', data: {} });
    }
    handleStopListening() {
        console.log(`[GW] Stop listening`);
        this.sendToESP32({ event: 'stop_listening', data: {} });
    }
    async handleStartEnroll(data) {
        console.log(`[GW] Start enroll: ${data.matricule}`);
        const employee = await this.fingerprintService.findByMatricule(data.matricule);
        if (!employee) {
            this.sendToExpo({ event: 'enroll_error', data: { message: 'Matricule introuvable' } });
            return;
        }
        if (employee.fingerprintId !== null) {
            this.sendToExpo({
                event: 'enroll_error',
                data: { message: `${employee.name} a déjà une empreinte enregistrée (slot ${employee.fingerprintId})` },
            });
            return;
        }
        let slot;
        try {
            slot = await this.fingerprintService.getNextFreeSlot();
        }
        catch (e) {
            this.sendToExpo({ event: 'enroll_error', data: { message: e.message } });
            return;
        }
        console.log(`[GW] Enrol: ${data.matricule} → slot ${slot}`);
        this.sendToESP32({
            event: 'enroll_fingerprint',
            data: {
                slot,
                employeeId: employee.id,
            },
        });
    }
    handleEnrollStep(data) {
        this.sendToExpo({ event: 'enroll_step', data });
    }
    async handleEnrollSuccess(data) {
        console.log(`[GW] Enrol success: ${data.matricule} → slot ${data.fingerprintId}`);
        const employee = await this.fingerprintService.saveFingerprintId(data.matricule, data.fingerprintId, 'ESP32-ENTREE-PRINCIPALE');
        if (employee) {
            console.log(`[GW] Enrol OK: ${data.matricule} → slot ${data.fingerprintId}`);
            this.sendToExpo({ event: 'enroll_complete', data: { employee } });
        }
        else {
            this.sendToExpo({ event: 'enroll_error', data: { message: 'Sauvegarde DB échouée' } });
        }
    }
    handleEnrollFailed(data) {
        console.log(`[GW] Enrol failed: ${data.message}`);
        this.sendToExpo({ event: 'enroll_error', data });
    }
    async handleFingerprintMatch(data) {
        console.log(`[GW] Fingerprint match: ${data.fingerprintId} (score=${data.score})`);
        const employee = await this.fingerprintService.findByFingerprintId(data.fingerprintId);
        this.sendToESP32({ event: 'stop_listening', data: {} });
        if (employee) {
            console.log(`[GW] Login OK: ${employee.id} (score=${data.score})`);
            console.log(`[GW] Employee: ${JSON.stringify(employee)}`);
            this.sendToExpo({ event: 'login_success', data: { employee, score: data.score } });
        }
        else {
            this.sendToExpo({
                event: 'login_failed',
                data: { message: 'Empreinte non liée à un employé' },
            });
        }
    }
    handleFingerprintUnknown() {
        console.log(`[GW] Fingerprint unknown`);
        this.sendToExpo({ event: 'login_failed', data: { message: 'Empreinte non reconnue' } });
    }
    async handleDeleteFingerprint(data) {
        console.log(`[GW] Delete fingerprint: ${data.matricule}`);
        const employee = await this.fingerprintService.findByMatricule(data.matricule);
        if (!employee) {
            this.sendToExpo({ event: 'delete_error', data: { message: 'Matricule introuvable' } });
            return;
        }
        if (employee.fingerprintId === null || employee.fingerprintId === undefined) {
            this.sendToExpo({ event: 'delete_error', data: { message: 'Aucune empreinte enregistrée' } });
            return;
        }
        this.sendToESP32({
            event: 'delete_fingerprint',
            data: { fingerprintId: employee.fingerprintId },
        });
        await this.fingerprintService.clearFingerprintId(data.matricule);
    }
    handleDeleteSuccess(data) {
        console.log(`[GW] Slot ${data.fingerprintId} supprimé`);
        this.sendToExpo({ event: 'delete_complete', data });
    }
    handleDeleteFailed(data) {
        this.sendToExpo({ event: 'delete_error', data });
    }
    sendToESP32(payload) {
        this.clients.forEach((c) => {
            if (c.type === 'esp32' && c.socket.readyState === ws_1.WebSocket.OPEN)
                c.socket.send(JSON.stringify(payload));
        });
    }
    sendToExpo(payload) {
        this.clients.forEach((c) => {
            if (c.type === 'expo' && c.socket.readyState === ws_1.WebSocket.OPEN)
                c.socket.send(JSON.stringify(payload));
        });
    }
};
exports.FingerprintGateway = FingerprintGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof ws_1.Server !== "undefined" && ws_1.Server) === "function" ? _a : Object)
], FingerprintGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('identify'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof ws_1.WebSocket !== "undefined" && ws_1.WebSocket) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleIdentify", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_listening'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleStartListening", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_listening'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleStopListening", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_enroll'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FingerprintGateway.prototype, "handleStartEnroll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enroll_step'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleEnrollStep", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enroll_success'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FingerprintGateway.prototype, "handleEnrollSuccess", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enroll_failed'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleEnrollFailed", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('fingerprint_match'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FingerprintGateway.prototype, "handleFingerprintMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('fingerprint_unknown'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleFingerprintUnknown", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_fingerprint'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FingerprintGateway.prototype, "handleDeleteFingerprint", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_success'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleDeleteSuccess", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_failed'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FingerprintGateway.prototype, "handleDeleteFailed", null);
exports.FingerprintGateway = FingerprintGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/' }),
    __metadata("design:paramtypes", [fingerprint_service_1.FingerprintService])
], FingerprintGateway);
//# sourceMappingURL=fingerprint.gateway.js.map