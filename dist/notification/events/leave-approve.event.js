"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionApproveEvent = exports.LeaveApproveEvent = void 0;
class LeaveApproveEvent {
    leaveId;
    userId;
    constructor(leaveId, userId) {
        this.leaveId = leaveId;
        this.userId = userId;
    }
}
exports.LeaveApproveEvent = LeaveApproveEvent;
class PermissionApproveEvent {
    leaveId;
    userId;
    constructor(leaveId, userId) {
        this.leaveId = leaveId;
        this.userId = userId;
    }
}
exports.PermissionApproveEvent = PermissionApproveEvent;
//# sourceMappingURL=leave-approve.event.js.map