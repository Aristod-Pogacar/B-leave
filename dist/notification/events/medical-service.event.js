"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationCreatedEvent = exports.MedicalServiceCreatedEvent = void 0;
class MedicalServiceCreatedEvent {
    medicalServiceId;
    constructor(medicalServiceId) {
        this.medicalServiceId = medicalServiceId;
    }
}
exports.MedicalServiceCreatedEvent = MedicalServiceCreatedEvent;
class ConsultationCreatedEvent {
    consultationId;
    constructor(consultationId) {
        this.consultationId = consultationId;
    }
}
exports.ConsultationCreatedEvent = ConsultationCreatedEvent;
//# sourceMappingURL=medical-service.event.js.map