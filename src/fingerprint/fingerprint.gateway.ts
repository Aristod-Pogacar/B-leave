import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { FingerprintService } from './fingerprint.service';

type ClientType = 'esp32' | 'expo' | 'unknown';
interface AppClient { socket: WebSocket; type: ClientType; }

@WebSocketGateway(3000, { path: '/' })
export class FingerprintGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients = new Map<WebSocket, AppClient>();

  constructor(private readonly fingerprintService: FingerprintService) { }

  handleConnection(socket: WebSocket) {
    this.clients.set(socket, { socket, type: 'unknown' });
    console.log(`[WS] Connecté (total: ${this.clients.size})`);
  }

  handleDisconnect(socket: WebSocket) {
    this.clients.delete(socket);
    console.log(`[WS] Déconnecté (total: ${this.clients.size})`);
  }

  // ── Identification ────────────────────────────────────────────────────────
  @SubscribeMessage('identify')
  handleIdentify(
    @MessageBody() data: { type: ClientType },
    @ConnectedSocket() socket: WebSocket,
  ) {
    const client = this.clients.get(socket);
    if (client) client.type = data.type;
    console.log(`[GW] Client: ${data.type}`);
  }

  // ── Expo → start/stop listening ───────────────────────────────────────────
  @SubscribeMessage('start_listening')
  handleStartListening() {
    this.sendToESP32({ event: 'listen_fingerprint', data: {} });
  }

  @SubscribeMessage('stop_listening')
  handleStopListening() {
    this.sendToESP32({ event: 'stop_listening', data: {} });
  }

  // ── Expo → start enroll ───────────────────────────────────────────────────
  @SubscribeMessage('start_enroll')
  async handleStartEnroll(@MessageBody() data: { matricule: string }) {
    // Vérifie que l'employé existe
    const employee = await this.fingerprintService.findByMatricule(data.matricule);
    if (!employee) {
      this.sendToExpo({ event: 'enroll_error', data: { message: 'Matricule introuvable' } });
      return;
    }

    // Vérifie qu'il n'a pas déjà une empreinte
    if (employee.fingerprintId !== null) {
      this.sendToExpo({
        event: 'enroll_error',
        data: { message: `${employee.name} a déjà une empreinte enregistrée (slot ${employee.fingerprintId})` },
      });
      return;
    }

    // Calcule le prochain slot libre
    let slot: number;
    try {
      slot = await this.fingerprintService.getNextFreeSlot();
    } catch (e) {
      this.sendToExpo({ event: 'enroll_error', data: { message: e.message } });
      return;
    }

    console.log(`[GW] Enrol: ${data.matricule} → slot ${slot}`);
    this.sendToESP32({
      event: 'start_enroll',
      data: { matricule: data.matricule, slot },
    });
  }

  // ── ESP32 → étape enrol ───────────────────────────────────────────────────
  @SubscribeMessage('enroll_step')
  handleEnrollStep(@MessageBody() data: { step: number }) {
    this.sendToExpo({ event: 'enroll_step', data });
  }

  // ── ESP32 → enrol réussi ──────────────────────────────────────────────────
  @SubscribeMessage('enroll_success')
  async handleEnrollSuccess(
    @MessageBody() data: { fingerprintId: number; matricule: string },
  ) {
    const employee = await this.fingerprintService.saveFingerprintId(
      data.matricule,
      data.fingerprintId,
      'ESP32-ENTREE-PRINCIPALE',
    );

    if (employee) {
      console.log(`[GW] Enrol OK: ${data.matricule} → slot ${data.fingerprintId}`);
      this.sendToExpo({ event: 'enroll_complete', data: { employee } });
    } else {
      this.sendToExpo({ event: 'enroll_error', data: { message: 'Sauvegarde DB échouée' } });
    }
  }

  // ── ESP32 → enrol échoué ──────────────────────────────────────────────────
  @SubscribeMessage('enroll_failed')
  handleEnrollFailed(@MessageBody() data: { message: string }) {
    this.sendToExpo({ event: 'enroll_error', data });
  }

  // ── ESP32 → match trouvé (login) ──────────────────────────────────────────
  @SubscribeMessage('fingerprint_match')
  async handleFingerprintMatch(
    @MessageBody() data: { fingerprintId: number; score: number },
  ) {
    const employee = await this.fingerprintService.findByFingerprintId(data.fingerprintId);

    this.sendToESP32({ event: 'stop_listening', data: {} });

    if (employee) {
      console.log(`[GW] Login OK: ${employee.id} (score=${data.score})`);
      console.log(`[GW] Employee: ${JSON.stringify(employee)}`);
      this.sendToExpo({ event: 'login_success', data: { employee, score: data.score } });
    } else {
      // Slot reconnu par l'AS608 mais pas en DB (désynchronisation)
      this.sendToExpo({
        event: 'login_failed',
        data: { message: 'Empreinte non liée à un employé' },
      });
    }
  }

  // ── ESP32 → pas de match ──────────────────────────────────────────────────
  @SubscribeMessage('fingerprint_unknown')
  handleFingerprintUnknown() {
    this.sendToExpo({ event: 'login_failed', data: { message: 'Empreinte non reconnue' } });
  }

  // ── Expo → suppression ────────────────────────────────────────────────────
  @SubscribeMessage('delete_fingerprint')
  async handleDeleteFingerprint(@MessageBody() data: { matricule: string }) {
    const employee = await this.fingerprintService.findByMatricule(data.matricule);

    if (!employee) {
      this.sendToExpo({ event: 'delete_error', data: { message: 'Matricule introuvable' } });
      return;
    }

    if (employee.fingerprintId === null || employee.fingerprintId === undefined) {
      this.sendToExpo({ event: 'delete_error', data: { message: 'Aucune empreinte enregistrée' } });
      return;
    }

    // Demande à l'ESP32 de supprimer le slot
    this.sendToESP32({
      event: 'delete_fingerprint',
      data: { fingerprintId: employee.fingerprintId },
    });

    // Nettoie la DB (optimiste — on ne attend pas la confirmation de l'ESP32)
    await this.fingerprintService.clearFingerprintId(data.matricule);
  }

  // ── ESP32 → suppression confirmée ────────────────────────────────────────
  @SubscribeMessage('delete_success')
  handleDeleteSuccess(@MessageBody() data: { fingerprintId: number }) {
    console.log(`[GW] Slot ${data.fingerprintId} supprimé`);
    this.sendToExpo({ event: 'delete_complete', data });
  }

  @SubscribeMessage('delete_failed')
  handleDeleteFailed(@MessageBody() data: { message: string }) {
    this.sendToExpo({ event: 'delete_error', data });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private sendToESP32(payload: object) {
    this.clients.forEach((c) => {
      if (c.type === 'esp32' && c.socket.readyState === WebSocket.OPEN)
        c.socket.send(JSON.stringify(payload));
    });
  }

  private sendToExpo(payload: object) {
    this.clients.forEach((c) => {
      if (c.type === 'expo' && c.socket.readyState === WebSocket.OPEN)
        c.socket.send(JSON.stringify(payload));
    });
  }
}