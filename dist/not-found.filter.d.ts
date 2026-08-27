import { ExceptionFilter, ArgumentsHost, NotFoundException } from '@nestjs/common';
export declare class NotFoundFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost): void;
}
