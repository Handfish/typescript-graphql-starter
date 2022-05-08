import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { AuthorFactory, BookFactory } from "../factories";

export class BookSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    new BookFactory(em)
      .each((book) => {
        book.author = new AuthorFactory(em).makeOne();
      })
      .make(10);
  }
}
