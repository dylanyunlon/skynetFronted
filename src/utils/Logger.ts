/* Logger utility */

class Logger {
  private prefix: string;

  constructor(prefix = "skynet") {
    this.prefix = prefix;
  }

  log(...args: unknown[]) {
    console.log(`[${this.prefix}]`, ...args);
  }

  warn(...args: unknown[]) {
    console.warn(`[${this.prefix}]`, ...args);
  }

  error(...args: unknown[]) {
    console.error(`[${this.prefix}]`, ...args);
  }

  debug(...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.debug(`[${this.prefix}]`, ...args);
    }
  }

  info(...args: unknown[]) {
    console.info(`[${this.prefix}]`, ...args);
  }
}

const logger = new Logger();
export default logger;
export { Logger };
