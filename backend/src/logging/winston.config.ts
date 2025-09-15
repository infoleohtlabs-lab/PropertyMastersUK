import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = 'logs';

const createDailyRotateFileTransport = (filename: string, level: string) => {
  return new DailyRotateFile({
    filename: `${logDir}/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  });
};

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('PropertyMastersUK', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    createDailyRotateFileTransport('application', 'info'),
    createDailyRotateFileTransport('error', 'error'),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
};

export const createWinstonLogger = () => {
  return WinstonModule.createLogger(winstonConfig);
};