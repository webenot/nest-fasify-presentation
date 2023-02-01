import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FastifyRequest } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
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
