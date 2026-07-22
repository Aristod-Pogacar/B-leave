export class LeaveApproveEvent {
    constructor(
        public readonly leaveId: string,
        public readonly userId: string,
    ) { }
}

export class PermissionApproveEvent {
    constructor(
        public readonly leaveId: string,
        public readonly userId: string,
    ) { }
}