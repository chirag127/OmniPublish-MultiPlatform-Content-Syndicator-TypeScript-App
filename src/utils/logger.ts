/**
 * Structured JSON-lines logger for publishing operations
 */

export interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "success";
    platform?: string;
    postSlug?: string;
    message: string;
    error?: string;
    metadata?: Record<string, any>;
}

class Logger {
    private logs: LogEntry[] = [];

    private createEntry(
        level: LogEntry["level"],
        message: string,
        platform?: string,
        postSlug?: string,
        error?: Error,
        metadata?: Record<string, any>
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            platform,
            postSlug,
            message,
            error: error?.message,
            metadata,
        };
    }

    info(
        message: string,
        platform?: string,
        postSlug?: string,
        metadata?: Record<string, any>
    ) {
        const entry = this.createEntry(
            "info",
            message,
            platform,
            postSlug,
            undefined,
            metadata
        );
        this.logs.push(entry);
        console.log(JSON.stringify(entry));
    }

    success(
        message: string,
        platform?: string,
        postSlug?: string,
        metadata?: Record<string, any>
    ) {
        const entry = this.createEntry(
            "success",
            message,
            platform,
            postSlug,
            undefined,
            metadata
        );
        this.logs.push(entry);
        console.log(JSON.stringify(entry));
    }

    warn(
        message: string,
        platform?: string,
        postSlug?: string,
        metadata?: Record<string, any>
    ) {
        const entry = this.createEntry(
            "warn",
            message,
            platform,
            postSlug,
            undefined,
            metadata
        );
        this.logs.push(entry);
        console.warn(JSON.stringify(entry));
    }

    error(
        message: string,
        platform?: string,
        postSlug?: string,
        error?: Error,
        metadata?: Record<string, any>
    ) {
        const entry = this.createEntry(
            "error",
            message,
            platform,
            postSlug,
            error,
            metadata
        );
        this.logs.push(entry);
        console.error(JSON.stringify(entry));
    }

    getLogs(): LogEntry[] {
        return this.logs;
    }

    getSummary() {
        const summary = {
            total: this.logs.length,
            success: this.logs.filter((l) => l.level === "success").length,
            errors: this.logs.filter((l) => l.level === "error").length,
            warnings: this.logs.filter((l) => l.level === "warn").length,
        };
        return summary;
    }
}

export const logger = new Logger();
