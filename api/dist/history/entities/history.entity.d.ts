export declare enum HistoryReason {
    LEAVE = "Leave",
    PERMISSION_2H = "Permission 2h",
    CONSULTATION_MEDICAL = "Consultation medicale",
    MEDICAL_SERVICE = "Medical service",
    EMPLOYEE = "Employee",
    MANAGER = "Manager",
    USER = "User",
    HOLIDAY = "Holiday",
    WITHDRAW = "Withdraw"
}
export declare class History {
    id: string;
    date_at: Date;
    reason: string;
    message: string;
    created_by?: string;
}
