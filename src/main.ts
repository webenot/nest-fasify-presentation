import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FastifyRequest } from 'fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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

  app.enableCors();

  const validationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // after updating class-validator to v0.14.0 pipes throws errors when try to use @Param decorator
    // that is why we need to turn off this option
    // Issue https://github.com/nestjs/nest/issues/10683
    // yarn audit error for lower versions https://github.com/advisories/GHSA-fj58-h2fr-3pp2
    forbidUnknownValues: false,
  };
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  const swaggerOptions = new DocumentBuilder()
    .setTitle('App API')
    .setDescription('Documentation for App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
