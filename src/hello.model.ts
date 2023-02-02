import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'hello ' })
export class HelloModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  message: string;
}
