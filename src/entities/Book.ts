import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";
import Author from "./Author";
import BookCategory from "./BookCategory";
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
  authorId!: string;

  @Field(() => Author)
  @ManyToOne(() => Author, { mapToPk: true })
  author?: Author;

  @Field(() => [BookCategory], { nullable: true })
  @ManyToMany(() => BookCategory)
  categories = new Collection<BookCategory>(this);
}
