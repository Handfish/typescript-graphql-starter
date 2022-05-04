import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";
import Author from "./Author";
import CustomBaseEntity from "./templates/CustomBaseEntity";

@ObjectType()
@Entity({ tableName: "books" })
export default class Book extends CustomBaseEntity {
  @Field()
  @Property()
  title!: string;

  @Field(() => Int, { nullable: true })
  @Property({ type: "int", nullable: true })
  year?: number;

  @Field()
  @Property()
  authorId!: string;

  @Field(() => Author, { nullable: true })
  @ManyToOne(() => Author, { mapToPk: true, nullable: true })
  author?: Author;
}
