export class MedicalServiceCreatedEvent {
    constructor(
        public readonly medicalServiceId: string,
    ) { }
}

export class ConsultationCreatedEvent {
    constructor(
        public readonly consultationId: string,
    ) { }
}