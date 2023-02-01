import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FastifyRequest } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            ignore: 'serviceContext',
            translateTime: 'SYS:HH:MM:ss.l',
          },
        },
        redact: {
          paths: ['pid', 'hostname'],
          remove: true,
        },
      },
      genReqId: (request: FastifyRequest) => {
        return request.headers['x-request-id'] || randomStringGenerator();
      },
      requestIdHeader: 'x-request-id',
      requestIdLogLabel: 'traceId',
    })
  );
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
