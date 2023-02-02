import { Args, Query, Resolver } from '@nestjs/graphql';
import { HelloModel } from './hello.model';

@Resolver()
export class AppResolver {
  @Query(() => HelloModel)
  sayHello(@Args('name') name: string): HelloModel {
    return {
      message: `Hello, ${name}`,
      name,
    };
  }
}
