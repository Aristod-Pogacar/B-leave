import { NestMiddleware } from '@nestjs/common';
export declare class SessionLocalsMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void;
}
