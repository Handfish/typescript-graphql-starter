import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";
import Book from "./Book";
import CustomBaseEntity from "./templates/CustomBaseEntity";

@ObjectType()
@Entity({ tableName: "authors" })
export default class Author extends CustomBaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  lastName?: string;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.author, { orphanRemoval: true })
  books = new Collection<Book>(this);
}
