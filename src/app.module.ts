import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => ({
        context: ({ req, connection }) => ({
          req: req || connection?.context,
        }),
        useGlobalPrefix: true,
        debug: true,
        installSubscriptionHandlers: true,
        subscriptions: {
          'subscriptions-transport-ws': {
            path: '/api/graphql',
            keepAlive: configService.get('keepAliveMS'),
            onConnect: (connectionParams) => connectionParams,
          },
        },
        playground: true,
        autoSchemaFile: 'schema.graphql',
        buildSchemaOptions: {
          dateScalarMode: 'isoDate',
          numberScalarMode: 'float',
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
