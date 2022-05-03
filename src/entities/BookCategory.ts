import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";
import Book from "./Book";
import CustomBaseEntity from "./templates/CustomBaseEntity";

@ObjectType()
@Entity({ tableName: "categories" })
export default class BookCategory extends CustomBaseEntity {
  @Field()
  @Property()
  name!: string;

  @Field(() => [Book], { nullable: true })
  @ManyToMany(() => Book, (book) => book.categories, {
    pivotTable: "books_categories_join",
  })
  books = new Collection<Book>(this);
}
