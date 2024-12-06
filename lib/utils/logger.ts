type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel = 'info';

  constructor() {
    // Allow setting log level via environment variable
    const envLogLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLogLevel) {
      this.logLevel = envLogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return logLevels.indexOf(level) >= logLevels.indexOf(this.logLevel);
  }

  debug(message: string, ...meta: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...meta);
    }
  }

  info(message: string, ...meta: any[]) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...meta);
    }
  }

  warn(message: string, ...meta: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...meta);
    }
  }

  error(message: string, ...meta: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...meta);
    }
  }
}

export const logger = new Logger();
