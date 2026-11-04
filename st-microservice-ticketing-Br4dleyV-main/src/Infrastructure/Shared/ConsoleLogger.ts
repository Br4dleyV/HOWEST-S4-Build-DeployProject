import { Logger } from '@/Application/Ports/mod.ts';

// Infrastructure/Shared/ConsoleLogger.ts
export class ConsoleLogger implements Logger {
    debug(message: string, context?: Record<string, unknown>): void {
        console.log(`[DEBUG] ${message}`, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        console.log(`[INFO] ${message}`, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        console.warn(`[WARN] ${message}`, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        console.error(`[ERROR] ${message}`, context);
    }
}
