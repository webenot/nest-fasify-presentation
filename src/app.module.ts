import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        context: ({ req, connection }) => ({
          req: req || connection?.context,
        }),
        useGlobalPrefix: true,
        debug: true,
        installSubscriptionHandlers: true,
        subscriptions: {
          path: '/api/graphql',
          keepAlive: configService.get('keepAliveMS'),
          onConnect: (connectionParams) => connectionParams,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
