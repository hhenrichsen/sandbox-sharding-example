import { Service } from "typedi";
import pino, { type Logger as PinoLogger } from "pino";
import pinoHttp from "pino-http";

@Service()
export class Logger {
  private readonly logger: PinoLogger = pino();

  public info(message: string, ...args: unknown[]) {
    this.logger.info(message, ...args);
  }

  public error(message: string, ...args: unknown[]) {
    this.logger.error(message, ...args);
  }

  public warn(message: string, ...args: unknown[]) {
    this.logger.warn(message, ...args);
  }

  public debug(message: string, ...args: unknown[]) {
    this.logger.debug(message, ...args);
  }

  public middleware() {
    return pinoHttp({ logger: this.logger });
  }
}
