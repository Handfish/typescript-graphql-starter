import { Entity, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";
import CustomBaseEntity from "./templates/CustomBaseEntity";

@ObjectType()
@Entity({ tableName: "users" })
export default class User extends CustomBaseEntity {
  @Field()
  @Property({ nullable: true })
  firstName?: string;

  @Field()
  @Property({ nullable: true })
  lastName?: string;

  @Field(() => Int)
  @Property({ nullable: true })
  age?: number;

  @Field()
  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Field(() => Boolean)
  @Property({ default: false })
  confirmed?: boolean;
}
