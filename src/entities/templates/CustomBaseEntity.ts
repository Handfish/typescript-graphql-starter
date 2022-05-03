import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";
import { v4 } from "uuid";

@ObjectType()
@Entity({ abstract: true })
export default abstract class CustomBaseEntity {
  @Field()
  @PrimaryKey({ type: "uuid" })
  id: string = v4();

  @Field(() => String)
  @Property()
  createdAt?: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
