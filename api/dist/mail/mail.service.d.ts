export declare class MailService {
    private transporter;
    constructor();
    sendVerificationEmail(email: string, code: string): Promise<void>;
}
