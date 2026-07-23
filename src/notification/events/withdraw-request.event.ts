export class WithdrawApprovedEvent {
    constructor(
        public readonly withdrawId: string,
    ) { }
}

export class WithdrawRequestEvent {
    constructor(
        public readonly withdrawId: string,
    ) { }
}