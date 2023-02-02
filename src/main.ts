import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FastifyRequest } from 'fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { contentParser } from 'fastify-file-interceptor';
import { join } from 'path';
import { RedisService } from './redis.service';
import * as connectRedis from 'connect-redis';
import fastifySession from '@fastify/session';
import { Authenticator } from '@fastify/passport';
import fastifyCookie from '@fastify/cookie';

const fastifyPassport = new Authenticator();

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
        return (request.headers['x-request-id'] as string) || randomStringGenerator();
      },
      requestIdHeader: 'x-request-id',
      requestIdLogLabel: 'traceId',
    })
  );

  await app.register(contentParser);
  app.useStaticAssets({ root: join(__dirname, '../uploads') });

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

  await app.register(fastifyCookie);

  const redisService = new RedisService({
    host: 'localhost',
    port: 6379,
    username: 'default',
    password: 'test',
  });
  const RedisStore = connectRedis(fastifySession);
  await app.register(fastifySession, {
    secret: 'the secret must have length 32 or greater',
    saveUninitialized: true,
    cookie: {
      maxAge: 604800000,
    },
    store: new RedisStore({
      client: redisService.getClient(),
      ttl: 260,
    }),
  });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession({ session: true }));

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
